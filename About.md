# Titan Aerospace Maintenance Copilot: team primer

Start here if you are new to the project. It explains what the system does, the
ideas it rests on, where each part lives, and how to demo it. For the full
argument, open the three project pages while the server runs:

* [`/why.html`](web/why.html): the problem and why we took it on
* [`/method.html`](web/method.html): architecture, models and design decisions
* [`/results.html`](web/results.html): measured results (also in [`docs/RESULTS.md`](docs/RESULTS.md))

---

## 1. What it is, in one minute

A **digital twin** of a small aerospace machine shop (8 machines, simulated in
SimPy) streams sensor readings. Two models watch them:

* an **anomaly detector** that notices when a machine starts to wear, and
* a **remaining-life model** (a temporal convolutional network) that estimates
  how many cycles are left before it breaks.

Rule-based **agents** turn that into a decision: which machine, what to fix
(with the plant procedure cited), and by what clock time. A **supervisor
approves** the work order in the 3D operations view; the twin's machine is
then serviced and its readings return to normal.

Everything runs offline on one laptop. Nothing calls an external API, and no
language model is involved.

## 2. The problem in one picture

Machines rarely fail without warning. Wear starts silently, becomes
**detectable** (point P: vibration starts to rise) and later causes a
**breakdown** (point F). The time between P and F is the window in which a
repair can be planned. Plants usually either:

* **run to failure**: act at F, with a long unplanned stop and possibly a
  scrapped part, or
* **service on a calendar**: act on fixed dates, replacing healthy parts and
  still missing fast-wearing ones.

The copilot acts inside the P-F window. The Why page shows this as an
interactive chart.

## 3. Key ideas

| Term | Meaning here |
|---|---|
| Digital twin | A simulation that mirrors the plant and can be run forward. Ours is simulated end to end, because we have no real plant to break. |
| Wear | Hidden state from 0 (new) to 1 (broken). The simulator knows it; the models never see it. |
| RUL | Remaining useful life, in machine cycles. Capped at 100 in training, because a healthy machine at 300 or 280 cycles looks the same. |
| Part age | Cycles since the last service. Known from the maintenance log, so it is a fair input. |
| ISO 10816-3 zones | Vibration severity bands: A < 1.4, B < 2.8, C < 4.5 mm/s, D above. Zone C is "not acceptable for continuous running". |
| Safety margin | The scheduler trusts 85% of the predicted RUL, because a late prediction costs far more than an early one. |
| Status ladder | Healthy → Watch → Service soon → Service now → Down, plus In service. One vocabulary everywhere in the UI. |

## 4. From a reading to a work order

1. **Sense**: `digital_twin/simulator.py` emits one reading per machine cycle
   (vibration, temperature, part age). `api/main.py` streams them at 2 Hz over
   `/ws/telemetry`.
2. **Detect**: `ml_pipeline/anomaly_detector.py`. An Isolation Forest trained on
   the healthy envelope (the first 80 cycles after each service) flags readings
   outside it.
3. **Predict**: `ml_pipeline/tcn_model.py` reads the last 20 readings of the
   current part's life and outputs RUL.
4. **Decide**: `agents/` is a LangGraph graph: Monitor → Diagnosis (retrieves and
   cites the machine type's procedure from `rag/documents/`) → Scheduler
   (safe RUL < 30 cycles drafts a work order) → Report.
5. **Approve and fix**: the supervisor approves in the Needs attention panel
   (`POST /work-orders`). The machine goes into service for its planned time
   and comes back healthy. With `COPILOT_AUTONOMY=1` the copilot may act
   without approval.

## 5. What is real and what is simulated

* **Simulated:** the plant, its sensors, and the wear. The signal curves are
  hand-chosen (see the How it works page), not fitted to a real machine.
* **Real:** the models, the agent logic, the UI and the evaluation method. A
  benchmark of the remaining-life architecture on NASA's public C-MAPSS turbofan
  data is included (`python -m evaluation.run_all --cmapss-only`, about 30 min).
* **Assumed:** a breakdown takes 3× as long to repair as a planned service. The
  Results page shows how conclusions change if it is 1.5× or 5×.

## 6. Where things live

```
digital_twin/   simulator, forecast (run the plant forward), ISO standards
ml_pipeline/    features, anomaly detector, TCN, training data, model cache
agents/         monitor, diagnosis, scheduler, orchestrator (LangGraph)
rag/            procedure documents and the ChromaDB knowledge base
api/            FastAPI app: REST, WebSocket, static web app
web/            3D operations view (Three.js) and the Why / How / Results pages
evaluation/     metrics, twin evaluation, policy evaluation, C-MAPSS benchmark
tests/          unit and integration tests
scripts/        screenshot and video capture helpers
docs/           results report, viva preparation, screenshots, project history
```

## 7. Run, test, evaluate

```bash
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

python -m unittest discover -s tests -p "test_*.py"   # 48 tests
uvicorn api.main:app --port 8000                      # open http://localhost:8000
python -m evaluation.run_all --quick                  # about 8 min; --cmapss-only adds C-MAPSS
```

The first server start trains the models (about 2 minutes) and caches them in
`.model_cache/`; later starts take a few seconds. Editing training code
retrains automatically; `TWIN_RETRAIN=1` forces it.

## 8. A five-minute demo

1. Open the app. The welcome card explains it; choose **Explore on my own**.
2. **Needs attention** (left) is the to-do list. Point out the clock-time
   deadlines and the "Simulated plant" tag.
3. **Demo → Wear out → CNC-01**. Watch the card, the alarm and the red halo.
4. Click CNC-01. The drawer answers first: the verdict, the vibration trend over
   the ISO zones, the prediction with its error range, and the procedure.
5. **Approve work order**. The machine goes into service, then returns healthy;
   the Log tab records who approved it.
6. **Forecast**: drag the slider through the next 8 hours with and without the
   copilot.
7. Finish on **Results**: the model errors, the anomaly lead time, and the
   policy comparison (including the fixed-schedule baseline and its cliff).

Or let the **3-minute tour** do all of this with narration.

## 9. Limits to state up front

* The plant is simulated; no real machine has been connected.
* Models trained on the simulator are not validated on a real spindle.
* The live forecast in the UI uses a perfect-knowledge estimate for speed; the
  measured version with the real model is on the Results page.
* Savings figures from industry (US DOE FEMP, 2010) are best cases for
  predictive maintenance in general, not results of this project.

See [`docs/VIVA.md`](docs/VIVA.md) for the questions examiners are likely to ask,
with answers.
