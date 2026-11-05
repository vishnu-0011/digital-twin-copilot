# Viva preparation: questions an examiner is likely to ask

Short, honest answers backed by the code and by `docs/RESULTS.md`. Numbers come
from `python -m evaluation.run_all` (2026-11-05).

## The problem and the scope

**Why is this problem worth solving?**
Unplanned breakdowns stop a line and are repaired reactively, which takes far
longer than a planned service; fixed maintenance calendars replace healthy parts
and still miss fast-wearing ones. Condition-based maintenance acts in between,
inside the P-F interval (Moubray). The US DOE FEMP guide reports best-case
predictive-maintenance programs with up to 70-75% fewer breakdowns; we quote it
as context, not as our result.

**Why a simulated plant instead of real data?**
We had no plant to run machines to failure in, and recorded datasets cannot be
acted on: you cannot schedule a service in a CSV and observe the effect. The
twin lets the copilot close the loop and lets us compare policies on identical
futures. To check the model on real data, the same architecture can be benchmarked
on NASA C-MAPSS FD003 (`python -m evaluation.run_all --cmapss-only`).

**How do you know the simulator is realistic?**
We don't claim it is a model of a specific machine. The degradation curves are
hand-chosen to be monotonic and accelerating, like the exponential degradation
used to generate C-MAPSS (Saxena et al., 2008), and scaled so vibration crosses
the ISO 10816-3 zones over a part's life. That is a limitation, which is why the
results report twin scores and real-data scores separately.

## Data and leakage

**What exactly does the model see?**
Vibration, temperature, their first differences, a 5-reading rolling mean and
standard deviation of vibration, and the part's age (cycles since its last
service). Never the wear level, which no real sensor can measure.

**You use a cycle counter as an input. Isn't that leakage?**
An earlier version used the lifetime cycle counter, which keeps rising after a
part is replaced, so the model saw a freshly serviced machine as old. We
replaced it with cycles since the last service, which a plant knows from its
maintenance log, and made windows and features stop at each service.

**How big is the training set, and how is it split?**
One simulated plant (seed 42, 8.3 simulated hours) with automatic
repairs gives 31 run-to-failure lives and 24,169 labelled readings.
Lives that ended in a planned service are dropped, because their failure time is
unknown (right-censored). Every score is computed on plants with other seeds
(1234, 2024, 31337), i.e. lives the model never saw.

## Models

**Why a TCN and not an LSTM?**
Dilated causal convolutions train in parallel, have stable gradients, and reach
a 61-reading receptive field with 4 layers and 61,889 parameters. LSTMs are a
fair alternative; on C-MAPSS the published LSTM (Zheng et al., 2017) reports an
RMSE of 16.18 on FD003.

**How accurate is it?**
On unseen twin plants the TCN's mean absolute error is 3.7 cycles (RMSE
4.6), against 4.1 for gradient boosting on a single reading and
7.1 for a no-sensor baseline (average life minus part age). Errors shrink
near failure: 2.6 cycles when fewer than 25 cycles remain.

**Is it better than simpler models on real data?**
Not in this report yet: the C-MAPSS benchmark (`--cmapss-only`) answers it.
One exploratory single-seed run on FD003 gave the TCN an RMSE of 13.6, against
12.3 for a random forest on window statistics, 19.2 for ridge regression, and
published results of 19.8 (CNN), 16.2 (LSTM) and 12.6 (deep CNN). If that
holds over seeds, the honest answer is: in the range of published deep models,
and a well-featured random forest is as good on this clean dataset.

**Why cap remaining life at 100?**
A healthy machine at 300 or 280 cycles left produces the same readings, so the
target is flat until wear starts (piecewise-linear target, Heimes 2008). The cap
also keeps the loss focused on the wear phase.

**How do you know when the model is wrong? What does "±" in the UI mean?**
The UI shows ± the holdout MAE (3.7 cycles). On test plants that band
contains the true value 59% of the time; 90% of errors are within
±7.6 cycles. 35% of predictions are late (too optimistic), which is why
the scheduler trusts only 85% of the prediction.

**Why an Isolation Forest, and does it beat a simple threshold?**
It needs no failure labels. It is trained on the healthy envelope (readings from
the first 80 cycles after a service) and flags the first departure from it. On
test plants it gives a median of 484 cycles of warning before failure,
against 172 for a fixed ISO zone-C threshold. The price: 11.7% false
alarms on healthy readings (the threshold has 0.0%). An earlier version
trained on all data, including worn machines, caught under 10% of worn readings.

## The decision

**Where does 0.85 come from?**
It encodes an asymmetric cost: a late prediction means a breakdown, an early one
only wastes some part life. It is a design parameter, not a fitted value; the
policy results show the rule avoids breakdowns (0.0 per shift) while using
94% of each part's life.

**Why not just service on a fixed schedule?**
That is the right baseline, and we compare against the best schedule we could
find (k = 95% of average life, tuned on the test plants, which flatters it).
Downtime per shift: run to failure 14.23 h, best schedule 6.38 h, copilot
6.43 h, perfect model 6.42 h. On this simulator, where parts wear predictably, the best schedule is marginally better (0.05 h per shift). That schedule sits next to a cliff: at 100% of average life it collapses to 19.8 breakdowns and 11.2 h per shift, and finding the safe edge needed the test plants' true average life. The copilot needs no such tuning: it reads each machine's condition.

**Does the result depend on the 3× repair assumption?**
The sensitivity analysis varies it from 1.5× to 5×. Run-to-failure downtime grows
from 8.4 h to 19.7 h per shift; the copilot stays at about
6.4 h because it rarely lets a machine break.

**Are the agents "AI"? Is there an LLM?**
No language model. The agents are a LangGraph state graph of rule-based steps.
The learning is in the two models; the agents make the decision traceable,
repeatable and testable, and retrieve the right procedure (TF-IDF retrieval in
ChromaDB, filtered by machine type).

**Who is responsible if it schedules the wrong thing?**
The copilot drafts work orders; a supervisor approves them. Autonomy is opt-in
(`COPILOT_AUTONOMY=1`). Every approval is logged with who approved it.

## Engineering

**How did you test it?**
48 automated tests (`python -m unittest discover -s tests -p "test_*.py"`):
simulator behaviour, feature engineering and labelling per life, a check that
the fast NumPy features match the pandas ones, the TCN, the agent graph, every
API endpoint and WebSocket action, the forecast, work orders, metrics, and the
policies. The evaluation suite is reproducible with one command.

**Why does the first start take two minutes?**
It trains both models. They are cached in `.model_cache/` under a hash of the
training code, so later starts take seconds and any change to the training code
retrains automatically.

**What would you do next?**
Connect one real machine (vibration sensor plus maintenance log), retrain and
re-run the evaluation; add per-life variation in wear rate (load, material) to
the simulator; calibrate the uncertainty band (for example conformal
prediction); and benchmark on the harder multi-condition C-MAPSS subsets.
