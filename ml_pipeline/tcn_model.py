"""
Remaining-life model: Temporal Convolutional Network (TCN)
===========================================================
Follows the approach described by Lövberg, "Remaining Useful Life Prediction
of Aircraft Engines with Variable Length Input Sequences" (PHM Society 2021
Data Challenge), on top of the generic TCN of Bai, Kolter & Koltun (2018):
1. Dilated 1D Causal Convolutions:
   Exponentially increasing dilation factors (1, 2, 4, 8) provide large temporal
   receptive fields without parameter explosion or recurrent bottlenecks.
2. Residual Connections:
   Skip connections across dilated blocks prevent gradient vanishing.
3. Variable-Length Input Sequences:
   Processes historical sequences of variable lengths without forcing a rigid
   fixed sliding window.
4. Degradation-Aware Sampling:
   Weights sequences during training to focus on active wear trajectories.
"""
from __future__ import annotations

import random
from typing import Optional, List, Tuple
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from ml_pipeline.features import OBSERVABLE_ENGINEERED_COLUMNS, add_engineered_features


class Chomp1d(nn.Module):
    """Trims padding from the right side to enforce strict temporal causality (no future leakage)."""
    def __init__(self, chomp_size: int):
        super().__init__()
        self.chomp_size = chomp_size

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        if self.chomp_size == 0:
            return x
        return x[:, :, :-self.chomp_size].contiguous()


class TemporalBlock(nn.Module):
    """Single dilated residual block with causal padding and layer norm."""
    def __init__(
        self,
        in_channels: int,
        out_channels: int,
        kernel_size: int = 3,
        stride: int = 1,
        dilation: int = 1,
        dropout: float = 0.15,
    ):
        super().__init__()
        padding = (kernel_size - 1) * dilation

        self.conv1 = nn.Conv1d(
            in_channels, out_channels, kernel_size, stride=stride, padding=padding, dilation=dilation
        )
        self.chomp1 = Chomp1d(padding)
        self.relu1 = nn.GELU()
        self.dropout1 = nn.Dropout(dropout)

        self.conv2 = nn.Conv1d(
            out_channels, out_channels, kernel_size, stride=stride, padding=padding, dilation=dilation
        )
        self.chomp2 = Chomp1d(padding)
        self.relu2 = nn.GELU()
        self.dropout2 = nn.Dropout(dropout)

        self.net = nn.Sequential(
            self.conv1, self.chomp1, self.relu1, self.dropout1,
            self.conv2, self.chomp2, self.relu2, self.dropout2
        )

        self.downsample = (
            nn.Conv1d(in_channels, out_channels, 1)
            if in_channels != out_channels
            else None
        )
        self.relu = nn.GELU()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        out = self.net(x)
        res = x if self.downsample is None else self.downsample(x)
        return self.relu(out + res)


class TemporalConvNet(nn.Module):
    """Stack of dilated temporal residual blocks."""
    def __init__(
        self,
        in_channels: int,
        num_channels: List[int] = [32, 64, 64, 32],
        kernel_size: int = 3,
        dropout: float = 0.15,
    ):
        super().__init__()
        layers = []
        num_levels = len(num_channels)
        for i in range(num_levels):
            dilation_size = 2 ** i
            in_ch = in_channels if i == 0 else num_channels[i - 1]
            out_ch = num_channels[i]
            layers.append(
                TemporalBlock(
                    in_ch, out_ch, kernel_size, stride=1, dilation=dilation_size, dropout=dropout
                )
            )
        self.network = nn.Sequential(*layers)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Input shape: (batch_size, in_channels, seq_len)
        return self.network(x)


class TCNRemainingLifeModel(nn.Module):
    """Dilated TCN backbone + last-step summary + RUL regression head."""
    def __init__(
        self,
        in_features: int = len(OBSERVABLE_ENGINEERED_COLUMNS),
        num_channels: List[int] = [32, 64, 64, 32],
        kernel_size: int = 3,
        dropout: float = 0.15,
    ):
        super().__init__()
        self.tcn = TemporalConvNet(in_features, num_channels, kernel_size, dropout)
        self.head = nn.Sequential(
            nn.Linear(num_channels[-1], 32),
            nn.GELU(),
            nn.Dropout(0.1),
            nn.Linear(32, 1),
        )
        # No output ReLU: a ReLU head can "die" (output stuck at 0, zero
        # gradient) on an unlucky run. Non-negativity is enforced at
        # prediction time instead. Starting the bias near the middle of the
        # 0-100 target range also speeds up convergence.
        nn.init.constant_(self.head[-1].bias, 50.0)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: (batch_size, seq_len, in_features)
        # Transpose to (batch_size, in_features, seq_len) for Conv1d
        x = x.transpose(1, 2)
        features = self.tcn(x)
        # Take the final temporal state (causal degradation summary)
        last_step = features[:, :, -1]
        return self.head(last_step).squeeze(-1)


def create_variable_sequences(
    labeled_df: pd.DataFrame,
    feature_cols: List[str] = OBSERVABLE_ENGINEERED_COLUMNS,
    min_seq_len: int = 3,
    max_seq_len: int = 30,
    degradation_aware: bool = True,
) -> Tuple[List[torch.Tensor], List[float]]:
    """
    Extracts variable-length historical sequences and corresponding RUL targets.
    Degradation-aware sampling (after Lövberg 2021): healthy-plateau windows
    are sub-sampled so the model spends its capacity on the wear phase.
    Windows never cross a service: each machine life is its own sequence.
    """
    df = add_engineered_features(labeled_df)
    sequences, targets = [], []

    for _, g in df.groupby(["machine_id", "life"]):
        g = g.sort_values("cycles_since_service").reset_index(drop=True)
        feat_matrix = g[feature_cols].values.astype(np.float32)
        rul_vals = g["rul_cycles"].values.astype(np.float32)
        n = len(g)

        if n < min_seq_len:
            continue

        for end_idx in range(min_seq_len - 1, n):
            # Degradation-aware sampling: give higher probability to abnormal/active wear stages
            current_rul = rul_vals[end_idx]
            if degradation_aware and current_rul > 80.0 and random.random() < 0.4:
                # Sub-sample early healthy flat plateau to prevent over-representation
                continue

            # Variable-length window ending AT the labelled reading (inclusive),
            # exactly like inference, which predicts from the latest reading.
            window_size = min(end_idx + 1, random.randint(min_seq_len, max_seq_len))
            start_idx = end_idx + 1 - window_size
            seq_slice = feat_matrix[start_idx:end_idx + 1]
            sequences.append(torch.tensor(seq_slice, dtype=torch.float32))
            targets.append(current_rul)

    return sequences, targets


class TCNPredictor:
    """Wrapper that manages dataset formatting, training, and inference for the TCN model."""
    def __init__(
        self,
        in_features: int = len(OBSERVABLE_ENGINEERED_COLUMNS),
        num_channels: List[int] = [32, 64, 64, 32],
        lr: float = 0.003,
    ):
        self.device = torch.device("cpu")
        self.model = TCNRemainingLifeModel(in_features=in_features, num_channels=num_channels).to(self.device)
        self.lr = lr
        self.is_fitted = False
        self.mean_ = None
        self.std_ = None

    def fit(self, labeled_df: pd.DataFrame, epochs: int = 15, batch_size: int = 128):
        sequences, targets = create_variable_sequences(labeled_df)
        if not sequences:
            raise ValueError("No valid sequences generated from training dataset.")

        # Compute feature normalization parameters
        all_features = torch.cat(sequences, dim=0)
        self.mean_ = all_features.mean(dim=0, keepdim=True)
        self.std_ = all_features.std(dim=0, keepdim=True) + 1e-6

        # Normalize sequences
        norm_sequences = [(s - self.mean_) / self.std_ for s in sequences]
        target_tensors = torch.tensor(targets, dtype=torch.float32)

        optimizer = optim.AdamW(self.model.parameters(), lr=self.lr, weight_decay=1e-4)
        criterion = nn.SmoothL1Loss()  # Huber loss for robust gradient steps

        # Bucket windows by length so every batch stacks into one tensor with
        # no padding and no per-sample Python work (about 4x faster on CPU).
        buckets: dict[int, list[int]] = {}
        for i, seq in enumerate(norm_sequences):
            buckets.setdefault(seq.size(0), []).append(i)
        stacked = {L: torch.stack([norm_sequences[i] for i in idx]) for L, idx in buckets.items()}
        bucket_targets = {L: target_tensors[idx] for L, idx in buckets.items()}

        prev_threads = torch.get_num_threads()
        torch.set_num_threads(1)  # small model: extra threads only add sync overhead (measured)
        self.model.train()
        try:
            for epoch in range(epochs):
                batches = []
                for L, X in stacked.items():
                    order = torch.randperm(X.size(0))
                    for i in range(0, X.size(0), batch_size):
                        batches.append((L, order[i:i + batch_size]))
                random.shuffle(batches)
                for L, idx in batches:
                    optimizer.zero_grad()
                    preds = self.model(stacked[L][idx].to(self.device))
                    loss = criterion(preds, bucket_targets[L][idx].to(self.device))
                    loss.backward()
                    nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
                    optimizer.step()
        finally:
            torch.set_num_threads(prev_threads)

        self.is_fitted = True
        return self

    def predict_sequences(self, sequences: List[torch.Tensor]) -> np.ndarray:
        if not self.is_fitted:
            raise RuntimeError("Model is not fitted. Call fit() first.")

        self.model.eval()
        preds = np.zeros(len(sequences), dtype=np.float64)
        by_len: dict[int, list[int]] = {}
        for i, seq in enumerate(sequences):
            by_len.setdefault(seq.size(0), []).append(i)
        with torch.no_grad():
            for idx in by_len.values():
                x = (torch.stack([sequences[i] for i in idx]) - self.mean_) / self.std_
                preds[idx] = self.model(x.to(self.device)).cpu().numpy()
        return np.clip(preds, 0.0, None)
