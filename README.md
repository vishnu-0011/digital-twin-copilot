# Smart Manufacturing Digital Twin Copilot

An agentic predictive-maintenance system for a simulated factory line —
**100% Pure Machine Learning, 100% Offline, ZERO API Keys Required**.

Powered by the **2021 PHM Competition Winning Strategy** (Dilated 1D Temporal Convolutional Networks, variable-length sequence history, degradation-aware sampling, and piecewise linear RUL targets).

```
Digital Twin (SimPy)  --telemetry-->  ML Pipeline  --features-->  Agent Graph (LangGraph)
     |                              (anomaly detection,                 |
     | schedule_maintenance()        2021 TCN RUL)            Monitor -> Diagnosis -> Scheduler
     +---------------<--------------------------------------------------+
                              Local RAG & NLP (ChromaDB)
                    SOP documents ground the Pure-ML Diagnosis Agent
```

## Why this architecture

- **2021 Competition Winning Prognostics**: Implements the architecture of Team "IJoinedTooLate" (1st Place, 2021 PHM Data Challenge):
  - **Dilated 1D Causal Convolutions (TCN)** with exponentially growing receptive fields ($d = 1, 2, 4, 8$) to capture slowly evolving degradation without recurrent bottlenecks.
  - **Variable-Length Sequence Inputs**: Processes temporal cycle sequences rather than single instantaneous snapshot points.
  - **Degradation-Aware Sampling**: Focuses training capacity on active degradation regimes.
  - **Piecewise Linear RUL Target**: Caps early healthy cycles at a flat $RUL_{\text{max}}$ ceiling to stabilize gradient updates.
- **Zero Feature Leakage (Physically Sound)**: Real industrial sensors cannot measure microscopic internal tool wear during live operation. We eliminated `wear_level` from input features, predicting remaining life strictly from observable physical telemetry (`vibration_rms`, `temperature_c`, $\Delta\text{vibration}$, $\Delta\text{temperature}$, rolling dynamics).
- **Asymmetric Industrial Safety Margin**: In real manufacturing, overestimating tool life causes catastrophic spindle crashes. The Scheduler Agent enforces a 15% safety buffer ($\text{RUL}_{\text{safe}} = 0.85 \times \text{RUL}_{\text{pred}}$) before making maintenance decisions.
- **100% Pure ML & Zero API Keys**: The Diagnosis Agent runs locally using TF-IDF cosine similarity against ChromaDB Standard Operating Procedures (SOPs). Zero reliance on external LLMs (no Groq, no OpenAI, no Anthropic), zero latency, zero API rate limits, and zero cost.
- **Digital Twin Closed-Loop Control**: SimPy discrete-event simulation allows agents to interrupt degraded machines, perform maintenance, and reset wear in real-time.

## Project structure

```
digital-twin-copilot/
├── digital_twin/
│   ├── models.py            # MachineState, MachineConfig, MaintenanceEvent
│   └── simulator.py          # SimPy factory simulation (the twin)
├── ml_pipeline/
│   ├── features.py          # Observable feature extraction & piecewise RUL clipping
│   ├── tcn_model.py         # PyTorch 1D Dilated Temporal ConvNet (2021 Winner)
│   ├── anomaly_detector.py  # Isolation Forest over live twin telemetry
│   └── rul_predictor.py     # TCN sequence predictor with HistGradientBoosting fallback
├── rag/
│   ├── documents/           # Sample SOPs (CNC mill, press, conveyor)
│   └── knowledge_base.py    # ChromaDB ingestion + retrieval
├── agents/
│   ├── state.py             # Shared LangGraph state schema
│   ├── tools.py             # Tool functions every agent can call
│   ├── monitor_agent.py     # Flags anomalous/at-risk machines
│   ├── diagnosis_agent.py   # Pure ML & local NLP SOP diagnostic matcher
│   ├── scheduler_agent.py   # Asymmetric safety-aware maintenance scheduler
│   └── orchestrator.py      # LangGraph wiring + end-to-end demo
├── api/
│   └── main.py              # FastAPI service
├── dashboard/
│   └── app.py               # Streamlit real-time operations dashboard
├── tests/                   # Automated unit test suite
├── requirements.txt
└── PRD.md                   # Specification & Ralph Loop execution record
```

## Setup

```bash
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```
*(No `.env` or API keys needed! The system is 100% self-contained and free).*

## Running it

**Run the Automated Unit Tests:**
```bash
python -m unittest discover -s tests -p "test_*.py"
```

**Run Full Agent Pipeline in Console:**
```bash
python -m agents.orchestrator
```

## 3D Isometric Strategy-Game Operations Center (`http://localhost:8000/`)

The primary frontend is an interactive **3D isometric strategy-game style operations center**, modeled for **Titan Aerospace Precision Fab**, inspired by RTS industrial games (Factorio/SCADA) and modern sci-fi glassmorphism:

- **Enterprise Identity (Titan Aerospace)**: Models a mission-critical aerospace line fabricating Inconel 718 turbine blades and titanium airframe bulkheads.
- **End-to-End Process Pipeline Ribbon (`/pipeline/flow`)**: Dockable bottom workflow bar featuring two selectable modes:
  - **Manufacturing Line Flow**: Real-time part transit from Ingot Ingestion &rarr; CNC Milling &rarr; 1000T Hydraulic Forge &rarr; Laser QC Conveyor &rarr; Autonomous AGV Dispatch with live WIP counts and bottleneck detection.
  - **AI Reasoning Chain**: 60Hz Telemetry &rarr; Zero-Leakage Physics &rarr; 2021 Dilated TCN &rarr; Isolation Forest Anomaly Gate &rarr; ChromaDB SOP Matcher &rarr; 15% Asymmetric Risk-Aware Scheduler.
- **Camera Preset Director Bar**: Floating quick-access bar offering instant 1-click cinematic camera framing (`🌐 Global Overview`, `⚙️ CNC Mill`, `🔨 1000T Press`, `📦 Conveyor`, `🤖 Follow AGV Chase Cam`).
- **Tabbed SCADA Drawer**: Clean 3-tab layout (`📊 Telemetry`, `🧠 2021 TCN Prognostics`, `📋 Titan SOP Protocol`) featuring a dual-channel 60 FPS oscilloscope (Vibration RMS + Thermal gradient) and ISO 10816 vibration classification.
- **Physical Wear Cues**: When machines accumulate wear, the 3D models exhibit dynamic high-frequency vibration jitter, pulsing heat aura spheres, and glowing multi-state halos.
- **Factory Laser Radar Sweep**: "Scan Factory" sweeps a glowing laser plane across the factory floor, executes the agent anomaly detection cycle, and alerts on degraded units.
- **Procedural Web Audio API Synthesizer**: Zero audio asset downloads; produces high-tech UI blips, radar sweeps, alarms, and repair completion chimes with audio mute toggle.
- **Zero-Build, 100% Offline**: Built with Three.js via ES6 modules and served directly by FastAPI at `http://localhost:8000/`. Zero Node.js or npm dependencies required.

---

## Running it

**Run the Automated Unit Tests:**
```bash
python -m unittest discover -s tests -p "test_*.py"
```

**Run Full Agent Pipeline in Console:**
```bash
python -m agents.orchestrator
```

**Launch the 3D Strategy Game Operations Center:**
```bash
uvicorn api.main:app --reload --port 8000
```
Open **`http://localhost:8000/`** in any web browser to enter the 3D Tactical Factory Operations Center!

*(Optional) Secondary Streamlit Metrics View:*
```bash
streamlit run dashboard/app.py
```
Open `http://localhost:8501` to view the tabular analytics and what-if simulation panel.
