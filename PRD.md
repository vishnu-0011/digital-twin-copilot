# PRD: 2021 Competition Winning Strategy - Pure ML Digital Twin Copilot

## Problem & User Intent
The user requires an upgrade to the Digital Twin Copilot by adopting the **2021 PHM Competition Winning Strategy** (Team "IJoinedTooLate": Dilated Temporal Convolutions, variable-length sequence inputs, degradation-aware sampling, and piecewise linear RUL targets), while making the entire system **100% Pure Machine Learning & Offline** with **zero API keys and zero paid tiers**.

## Mental Model & Core Abstractions
1. **Temporal Degradation as a Sequence:** Degradation is not an instantaneous snapshot. It is a temporal progression. The model evaluates a sequence of recent cycles rather than isolated instantaneous values.
2. **Zero Feature Leakage:** In a real factory, internal microscopic tool wear is unobservable during operation. The model predicts Remaining Useful Life (RUL) strictly from observable sensor dynamics (`vibration_rms`, `temperature_c`, $\Delta \text{vibration}$, rolling stats).
3. **Piecewise Linear Target ($RUL_{\text{max}}$):** During early cycles when equipment is healthy, wear is negligible; capping target RUL prevents noisy gradient updates on healthy states and focuses model capacity on the degradation trajectory.
4. **Pure ML Offline Diagnosis:** Diagnosis is performed locally using TF-IDF NLP similarity and structured rule matching against Standard Operating Procedures (SOPs), completely eliminating LLM costs, API keys, rate limits, and hallucinations.
5. **Asymmetric Industrial Risk:** Overestimating machine life causes catastrophic tooling crashes. The scheduler enforces an asymmetric safety factor ($\text{RUL}_{\text{safe}} = 0.85 \times \text{RUL}_{\text{pred}}$).

## Architectural Decisions & Constraints
- **Deep Learning Framework:** PyTorch for the Dilated 1D Temporal Convolutional Network (TCN). CPU-optimized, runs fast on local machines.
- **Unified Predictor Interface:** `RULPredictor` retains `.fit()`, `.predict()`, and `.predict_latest()` methods so calling agents remain decoupled from model internals.
- **No External LLM / Zero API Key:** Remove `GROQ_API_KEY` requirement from `agents/diagnosis_agent.py`. The diagnosis agent uses local semantic SOP matching.
- **Backward Compatibility:** All existing endpoints (`/fleet`, `/simulate`, `/monitor/check`, `/whatif`) and Streamlit dashboard must function seamlessly without breaking.

## Verification & Backpressure
Command(s) to verify after each task:
- Verification: `./venv/bin/python -m unittest discover -s tests -p "test_*.py"`
- End-to-end Orchestration: `./venv/bin/python -m agents.orchestrator`

---

## Discrete Tasks

### Task 1: Observable Feature Engineering & Piecewise Linear RUL Target
- **Objective:** Fix sensor feature leakage by eliminating `wear_level` from input features, implement temporal sequence feature extraction ($\Delta \text{vibration}$, rolling mean/std), and implement the piecewise linear RUL target function in `ml_pipeline/rul_predictor.py`.
- **Acceptance Criteria:** Unit tests confirm piecewise target clipping at $RUL_{\text{max}}$ and feature extraction without `wear_level` in input columns.
- **Target Files:** `ml_pipeline/features.py`, `ml_pipeline/rul_predictor.py`, `tests/test_features.py`.

### Task 2: PyTorch Dilated Temporal Convolutional Network (TCN)
- **Objective:** Implement the 2021 competition winning model architecture: 1D Dilated Convolutions with exponentially growing receptive fields ($d \in [1, 2, 4, 8]$), residual connections, layer normalization, variable-length sequence handling, and degradation-aware batching.
- **Acceptance Criteria:** Model trains on synthetic or benchmark sequences, converges, and outputs predicted RUL cycles with valid shape and non-negative bounds.
- **Target Files:** `ml_pipeline/tcn_model.py`, `ml_pipeline/rul_predictor.py`, `tests/test_tcn.py`.

### Task 3: 100% Pure ML Local Diagnosis Engine (Zero LLM / Zero API Key)
- **Objective:** Replace `_call_groq()` in `agents/diagnosis_agent.py` with a pure ML/NLP local diagnostic matcher that retrieves relevant SOP sections via TF-IDF similarity, extracts structured diagnostic findings (`likely_cause`, `recommended_action`, `urgency`, `confidence`), and runs completely offline without any API keys.
- **Acceptance Criteria:** `diagnosis_agent` produces structured diagnosis dictionaries for flagged machines with zero external network requests and zero environment variables required.
- **Target Files:** `agents/diagnosis_agent.py`, `tests/test_diagnosis_ml.py`.

### Task 4: Monitor & Scheduler Temporal Buffer Integration with Safety Margins
- **Objective:** Update `agents/monitor_agent.py` and `agents/tools.py` to extract temporal sequence windows from the digital twin history for the TCN model. Update `agents/scheduler_agent.py` to apply the competition-winning asymmetric safety factor on predicted RUL.
- **Acceptance Criteria:** Monitor agent correctly passes historical cycle sequences to the TCN model, and Scheduler agent triggers maintenance conservatively based on safety-adjusted RUL thresholds.
- **Target Files:** `agents/monitor_agent.py`, `agents/tools.py`, `agents/scheduler_agent.py`, `tests/test_agent_flow.py`.

### Task 5: End-to-End Orchestrator, Streamlit UI, and Full Verification
- **Objective:** Wire the entire upgraded pipeline through `agents/orchestrator.py` and update the Streamlit dashboard in `dashboard/app.py` to display TCN sequence forecasts and local ML diagnosis cards. Run full test suite.
- **Acceptance Criteria:** Full test suite passes, `python -m agents.orchestrator` executes cleanly without any API keys, and dashboard launches with active telemetry.
- **Target Files:** `agents/orchestrator.py`, `dashboard/app.py`, `README.md`.
