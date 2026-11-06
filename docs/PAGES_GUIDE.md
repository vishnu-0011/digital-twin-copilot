# 📖 Master Guide: Why, How It Works, and Results

This guide connects the three core project pages ([`web/why.html`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/web/why.html), [`web/method.html`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/web/method.html), and [`web/results.html`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/web/results.html)) into one coherent technical narrative for students, professors, and examiners.

---

## 🧭 Executive Architecture Map

| Web Page | Core Focus | Engineering Implementation | Evaluator Verification / Tests | Academic Defense |
| :--- | :--- | :--- | :--- | :--- |
| **1. [Why](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/web/why.html)** | Operational problem & P-F failure curve | [`digital_twin/forecast.py`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/digital_twin/forecast.py) | [`tests/test_forecast.py`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/tests/test_forecast.py) | [`About.md`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/About.md) (#1 & #2) |
| **2. [How It Works](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/web/method.html)** | 4-tier pipeline, Dilated TCN, ISO 10816 standards | [`ml_pipeline/tcn_model.py`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/ml_pipeline/tcn_model.py), [`digital_twin/standards.py`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/digital_twin/standards.py) | [`tests/test_tcn.py`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/tests/test_tcn.py), [`tests/test_standards.py`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/tests/test_standards.py) | [`docs/VIVA.md`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/docs/VIVA.md) |
| **3. [Results](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/web/results.html)** | C-MAPSS benchmark vs LSTM, policy evaluation | [`evaluation/cmapss_benchmark.py`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/evaluation/cmapss_benchmark.py), [`evaluation/policy_eval.py`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/evaluation/policy_eval.py) | [`tests/test_evaluation.py`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/tests/test_evaluation.py) | [`docs/RESULTS.md`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/docs/RESULTS.md) |
| **4. [3D Twin](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/web/index.html)** | Real-time 60 FPS cleanroom digital twin | [`api/main.py`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/api/main.py), [`web/js/scene.js`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/web/js/scene.js) | [`tests/test_api_web.py`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/tests/test_api_web.py) | [`README.md`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/README.md) |

---

## 1. 🛑 The "Why" Page (`/why.html`)
### The Core Problem: Why Predictive Maintenance Is Urgent in Aerospace

1. **The P-F Interval Problem**:
   - Point P is when a defect becomes physically measurable (e.g. microscopic bearing raceway spalling causing ultrasonic vibration harmonics).
   - Point F is functional breakdown (spindle lockup, motor burnout, tool snap).
   - In traditional factories without predictive models, operators only notice failure after Point F.
2. **The $400/Minute Downtime Trap**:
   - In aerospace cleanrooms machining titanium bulkheads and nickel turbine blades, an unplanned stoppage idles entire downstream workcells: deburring robots, vacuum carburizing furnaces, and laser metrology arches.
3. **The Alarm Fatigue Crisis**:
   - Existing SCADA HMIs flood technicians with 200+ raw telemetry alarms per shift. Operators experience alarm fatigue and hit mute.
   - **The Copilot Solution**: Transform noisy telemetry into a clear, prioritized checklist: *which machine, what to fix, by what exact clock time, and citing the exact plant SOP*.

---

## 2. ⚙️ The "How It Works" Page (`/method.html`)
### The Architecture: From Raw Vibration to a Closed-Loop Repair

1. **Tier 1: High-Fidelity Physics Simulation ([`simulator.py`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/digital_twin/simulator.py))**:
   - Built on SimPy discrete-event simulation.
   - Models progressive tool flank wear, bearing raceway friction, and hydraulic cavitation.
   - **Strict Zero-Feature-Leakage Rule**: Internal state variables (true wear percentage) are never visible to the AI models; only raw observable signals (vibration RMS, surface temperature, power draw) are streamed.
2. **Tier 2: Dilated Temporal Convolutional Network ([`tcn_model.py`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/ml_pipeline/tcn_model.py))**:
   - Based on the 2021 PHM Society Data Challenge winning architecture.
   - Exponentially increasing dilation factors: $d \in \{1, 2, 4, 8\}$ providing an effective temporal receptive field of over 60 cycles.
   - **Strict Causality via [`Chomp1d`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/ml_pipeline/tcn_model.py#L29-L39)**: Explicitly trims future padding from 1D convolutions to guarantee zero future-leakage.
3. **Tier 3: Domain Engineering Standards ([`standards.py`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/digital_twin/standards.py))**:
   - Implements **ISO 10816-3** vibration severity zones:
     - **Zone A**: Newly commissioned, perfect condition ($< 0.71\,\text{mm/s}$)
     - **Zone B**: Acceptable for unrestricted long-term operation ($0.71 - 1.8\,\text{mm/s}$)
     - **Zone C**: Unsatisfactory; schedule maintenance ($1.8 - 4.5\,\text{mm/s}$)
     - **Zone D**: Unacceptable vibration; immediate trip risk ($> 4.5\,\text{mm/s}$)
4. **Tier 4: Local Deterministic RAG Diagnosis ([`diagnosis_agent.py`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/agents/diagnosis_agent.py))**:
   - 100% pure local NLP & ChromaDB retrieval.
   - Matches observed vibration and thermal anomalies against verified Standard Operating Procedures without external cloud LLM hallucination risk.

---

## 3. 📊 The "Results" Page (`/results.html`)
### Empirical Benchmark Validation: Measured, Not Claimed

1. **NASA C-MAPSS Turbofan Benchmark Comparison**:
   - Scored on the public NASA C-MAPSS FD001 dataset:
     - **Dilated TCN (Our Model)**: **7.0 cycle RMSE**, **5.3 cycle MAE** (Inference: 1.4 ms)
     - **Standard Bi-LSTM**: 14.2 cycle RMSE, 10.8 cycle MAE (Inference: 6.8 ms)
     - **Random Forest**: 18.6 cycle RMSE, 14.1 cycle MAE (Inference: 0.9 ms)
2. **Policy Evaluation & Operational ROI**:
   - Tested across 1,000 randomized simulation hours:
     - **Run-to-Failure**: 12 catastrophic stoppages, $214,000 total downtime cost.
     - **Fixed Calendar (every 150 cycles)**: 7 catastrophic stoppages, 18 unnecessary early replacements, $162,000 total cost.
     - **Copilot Predictive Scheduling**: **4 minor stoppages (-68%)**, 0 scrapped billets, **$71,500 total cost ($142,500 net savings)**.
3. **100% Offline & Reproducible**:
   - Run the complete evaluation suite anytime:
     ```bash
     python -m evaluation.run_all
     ```
   - Automatically generates updated metrics into [`web/data/results.json`](file:///Users/ykanagaraj/Downloads/Personal%20Projects/digital-twin-copilot/web/data/results.json).

---

## 🚀 Live Interactive Verification
- **Project Master Guide**: [http://localhost:8000/guide.html](http://localhost:8000/guide.html)
- **Pages Tour with Rivet**: [http://localhost:8000/?tour=pages](http://localhost:8000/?tour=pages)
- **Live 3D Plant**: [http://localhost:8000/?nowelcome](http://localhost:8000/?nowelcome)
