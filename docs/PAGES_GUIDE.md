# Guide to the project pages

The project makes one argument across three pages, served by the app at
`http://localhost:8000`:

| Page | Question it answers | Main code | Tests |
|---|---|---|---|
| [`/why.html`](../web/why.html) | Why is this problem worth solving? | (motivation; numbers from the evaluation) | — |
| [`/method.html`](../web/method.html) | How does the copilot work, and why was it built this way? | [`digital_twin/`](../digital_twin), [`ml_pipeline/`](../ml_pipeline), [`agents/`](../agents) | `tests/test_tcn.py`, `tests/test_standards.py`, `tests/test_agent_flow.py` |
| [`/results.html`](../web/results.html) | Does it work, measured on data the models never saw? | [`evaluation/`](../evaluation) | `tests/test_evaluation.py` |
| [`/guide.html`](../web/guide.html) | A one-page map of the three, with likely examiner questions | — | — |

## Guided reading with Rivet

Every page has a **Walk me through** button in the top bar. Rivet, the same
guide as in the 3D plant, reads the page aloud with live captions. A spotlight
follows the exact part being explained, and the narration drives the page: it
switches the P-F chart between strategies, steps through the five-stage loop
and points at the fixed-schedule "cliff" row. At the end of each page it offers
the next one (Why → How it works → Results → the live plant).

* Keys: `Space` play/pause, `←` `→` step, `V` voice on/off, `Esc` close.
* `?guide=1` on any page opens the guide ready to start. Browsers only allow
  speech after a click on the page, so it waits for one press of play.
* Every number Rivet says is read from `web/data/results.json` when the page
  loads, the same file the charts use. If the file is missing, those steps use
  wording without numbers.
* Code: [`web/js/guide/page-guide.js`](../web/js/guide/page-guide.js) and
  [`web/css/page-guide.css`](../web/css/page-guide.css).

The 3D plant also has a narrated tour of the three pages (**Tour → Why, How &
Results**), defined in `DOCS_BEATS` in
[`web/js/guide/script.js`](../web/js/guide/script.js).

## What each page claims, and the source

**Why.** Machines give a warning window (the P-F interval [Moubray 1997])
between a detectable fault and a breakdown. Plants usually repair after the
breakdown or service on a calendar. The hard part is turning a reading into a
decision someone trusts. The three policy columns are measured (see Results);
the three industry percentages are US DOE FEMP (2010) best cases, labelled as
such.

**How it works.**
* A SimPy twin of 8 machines. Hidden wear drives vibration and temperature with
  noise, and the models never see the wear.
* An Isolation Forest fitted on the healthy envelope: the first 80 cycles after
  each service.
* A dilated causal TCN (dilations 1-2-4-8, kernel 3, a Chomp1d trim, 61,889
  parameters, a receptive field of 61 readings) predicts cycles to failure,
  capped at 100.
* Rule-based LangGraph agents cite the machine type's SOP and draft a work order
  when 0.85 × RUL < 30 cycles. A supervisor approves it.
* Vibration is graded against the ISO 10816-3 zones: A < 1.4, B < 2.8,
  C < 4.5 mm/s, D above.

**Results.** These are from `python -m evaluation.run_all --quick`, and are
regenerated whenever it runs; see [`docs/RESULTS.md`](RESULTS.md) for the
current values.
* **Remaining life:** the TCN's mean absolute error is 3.68 cycles, against
  4.10 for gradient boosting and 7.12 for a no-sensor baseline.
* **Early warning:** the Isolation Forest gives a median of 484 cycles before
  failure, against 172 for an ISO zone C threshold. About 12% of healthy
  readings are flagged.
* **Downtime per 8-hour shift**, on 10 unseen plants:

  | Policy | Downtime | Breakdowns |
  |---|---|---|
  | Run to failure | 14.23 h | 30.9 |
  | Copilot (TCN) | 6.43 h | 0 |
  | Best fixed schedule (95% of average life, tuned on the same plants) | 6.38 h | 0 |

  At 100% of average life the fixed schedule collapses to 19.8 breakdowns.
* **NASA C-MAPSS:** the benchmark is built in. Run it with
  `python -m evaluation.run_all --cmapss-only`; it takes about 40 minutes.
