"""
2021 Competition Winning Architecture: Temporal Convolutional Network (TCN)
=============================================================================
Based on the winning approach of the 2021 PHM Society Data Challenge
(Team "IJoinedTooLate"):
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
    """
    Complete 2021 Prognostics Model:
    Dilated TCN backbone + Adaptive Pooling + RUL Regression Head.
    """
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
            nn.ReLU(),  # Enforces non-negative RUL cycles
        )

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
    Implements Degradation-Aware Sampling (Team IJoinedTooLate 2021).
    """
    df = add_engineered_features(labeled_df)
    sequences, targets = [], []

    for _, g in df.groupby("machine_id"):
        g = g.sort_values("cycle_count").reset_index(drop=True)
        feat_matrix = g[feature_cols].values.astype(np.float32)
        rul_vals = g["rul_cycles"].values.astype(np.float32)
        n = len(g)

        if n < min_seq_len:
            continue

        for end_idx in range(min_seq_len, n):
            # Degradation-aware sampling: give higher probability to abnormal/active wear stages
            current_rul = rul_vals[end_idx]
            if degradation_aware and current_rul > 80.0 and random.random() < 0.4:
                # Sub-sample early healthy flat plateau to prevent over-representation
                continue

            # Variable length window up to max_seq_len
            window_size = min(end_idx, random.randint(min_seq_len, max_seq_len))
            start_idx = end_idx - window_size
            seq_slice = feat_matrix[start_idx:end_idx]
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

    def fit(self, labeled_df: pd.DataFrame, epochs: int = 15, batch_size: int = 32):
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

        self.model.train()
        n_samples = len(norm_sequences)

        for epoch in range(epochs):
            indices = list(range(n_samples))
            random.shuffle(indices)

            for i in range(0, n_samples, batch_size):
                batch_idx = indices[i : i + batch_size]
                # Pad sequences within the batch to uniform length
                max_len = max(norm_sequences[idx].size(0) for idx in batch_idx)
                in_feat = norm_sequences[0].size(1)

                padded = torch.zeros(len(batch_idx), max_len, in_feat, device=self.device)
                for b_i, idx in enumerate(batch_idx):
                    s = norm_sequences[idx].to(self.device)
                    padded[b_i, -s.size(0):, :] = s  # Left-pad with zeros for causal alignment

                batch_targets = target_tensors[batch_idx].to(self.device)

                optimizer.zero_grad()
                preds = self.model(padded)
                loss = criterion(preds, batch_targets)
                loss.backward()
                nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
                optimizer.step()

        self.is_fitted = True
        return self

    def predict_sequences(self, sequences: List[torch.Tensor]) -> np.ndarray:
        if not self.is_fitted:
            raise RuntimeError("Model is not fitted. Call fit() first.")

        self.model.eval()
        preds = []
        with torch.no_grad():
            for seq in sequences:
                norm_seq = (seq - self.mean_) / self.std_
                x = norm_seq.unsqueeze(0).to(self.device)
                pred = self.model(x).item()
                preds.append(max(0.0, float(pred)))
        return np.array(preds)
