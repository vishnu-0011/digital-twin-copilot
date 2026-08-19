# Smart Manufacturing Digital Twin Copilot

An agentic predictive-maintenance system for a simulated factory line —
**no IoT hardware required**. The "sensor feed" is a SimPy digital twin;
everything downstream (anomaly detection, RUL prediction, multi-agent
diagnosis, RAG-grounded recommendations) consumes that synthetic telemetry
through the exact same interface real sensor data would use.

```
Digital Twin (SimPy)  --telemetry-->  ML Pipeline  --features-->  Agent Graph (LangGraph)
     |                              (anomaly detection,                 |
     | schedule_maintenance()        RUL prediction)          Monitor -> Diagnosis -> Scheduler
     +---------------<--------------------------------------------------+
                              RAG Knowledge Base (ChromaDB)
                         SOP documents ground the Diagnosis Agent
```

## Why this architecture

- **Digital twin instead of IoT**: `digital_twin/simulator.py` is a SimPy
  discrete-event simulation of machines accumulating wear each cycle,
  emitting synthetic vibration/temperature signals that correlate with
  wear. It IS the sensor feed. Swap it for a real ingestion layer later
  without touching anything downstream — the `MachineState` schema doesn't
  change.
- **ML pipeline trained on the twin's own data**: because we control the
  simulation, we know each machine's true failure point, so we can generate
  ground-truth RUL labels for free (`ml_pipeline/rul_predictor.py`). No need
  for a real historical failure dataset to get started.
- **RAG grounds the LLM, doesn't just decorate it**: the Diagnosis Agent is
  instructed to reason *only* from retrieved SOP text
  (`agents/diagnosis_agent.py`). Every diagnosis records which SOP chunks it
  used, so a human can audit the reasoning instead of trusting it blindly.
- **Scheduler is rule-based, not another LLM call**: maintenance
  scheduling decisions should be deterministic and auditable
  (`agents/scheduler_agent.py`), so urgency -> action is a plain lookup
  table, not a second prompt.
- **Monitor Agent has no LLM call at all**: it's pure ML inference
  (`agents/monitor_agent.py`). Reserves LLM spend for the one step —
  diagnosis — where natural-language reasoning genuinely adds value.

## Project structure

```
digital-twin-copilot/
├── digital_twin/
│   ├── models.py         # MachineState, MachineConfig, MaintenanceEvent
│   └── simulator.py       # SimPy factory simulation (the twin)
├── ml_pipeline/
│   ├── anomaly_detector.py  # Isolation Forest over live twin telemetry
│   └── rul_predictor.py     # XGBoost remaining-useful-life regression
├── rag/
│   ├── documents/          # Sample SOPs (CNC mill, press, conveyor)
│   └── knowledge_base.py   # ChromaDB ingestion + retrieval
├── agents/
│   ├── state.py            # Shared LangGraph state schema
│   ├── tools.py             # Tool functions every agent can call
│   ├── monitor_agent.py     # Flags anomalous/at-risk machines
│   ├── diagnosis_agent.py   # RAG + Claude -> grounded root-cause explanation
│   ├── scheduler_agent.py   # Rule-based maintenance decisions
│   └── orchestrator.py      # LangGraph wiring + end-to-end demo
├── api/
│   └── main.py              # FastAPI service
├── requirements.txt
└── .env.example
```

## Setup

```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill in your ANTHROPIC_API_KEY
```

## Running it

**Individual components** (each runs standalone for testing/demo):
```bash
python -m digital_twin.simulator      # just the twin, prints final states
python -m ml_pipeline.anomaly_detector
python -m ml_pipeline.rul_predictor
python -m rag.knowledge_base
```

**Full agent pipeline, one monitoring cycle, printed to console:**
```bash
python -m agents.orchestrator
```

**As a live API:**
```bash
uvicorn api.main:app --reload --port 8000
```
Then:
- `GET  /fleet` — current machine states
- `POST /simulate {"duration_s": 1800}` — advance the simulation clock
- `POST /monitor/check` — run one full Monitor→Diagnosis→Scheduler cycle
- `POST /whatif {"duration_s": 3600, "seed": 7}` — isolated what-if run

Interactive API docs at `http://localhost:8000/docs`.

## Notes on the RAG embedding function

The default embedding function (`rag/knowledge_base.py`) is a local TF-IDF
vectorizer — zero API keys, zero model downloads, runs fully offline. This
is intentional for a portable demo/project, but it's lexical matching, not
true semantic search. **For production, swap in Voyage AI's `voyage-3` or
OpenAI's `text-embedding-3-large`** — the `MaintenanceKnowledgeBase`
interface (`ingest_directory`, `retrieve`) won't need to change, only the
`embed_fn`.

## Extension ideas (good "v2" scope)

- **What-if production planner**: expose `run_what_if_simulation` through a
  natural-language interface — an agent translates "what if we add a second
  shift" into simulation parameters, runs it, and summarizes the delta.
- **Layout optimization agent**: swap SimPy for Mesa, add an agent that
  iteratively proposes layout changes and re-runs the twin to evaluate
  throughput/bottleneck KPIs.
- **Real dataset swap-in**: replace the twin-generated training data with
  NASA C-MAPSS or the UCI SECOM dataset — `ml_pipeline/rul_predictor.py`
  already documents the schema shape needed to do this without changing the
  model interface.
- **Dashboard**: a small React or Streamlit frontend calling the FastAPI
  endpoints — `/fleet` for live state, `/monitor/check` for the agent
  report.
