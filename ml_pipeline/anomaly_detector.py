"""
Anomaly Detection (novelty detection)
=====================================
An Isolation Forest learns what a HEALTHY machine looks like, then flags any
reading outside that envelope: the moment wear becomes detectable (point P
on the P-F curve).

How "healthy" is chosen without peeking at the hidden wear level: readings
from the first `reference_cycles` cycles after a service are presumed
healthy, which is what a plant would do after replacing a part. Fitting on
all data instead (including worn and broken machines) teaches the model that
wear is normal; on the twin that version caught under 10% of worn readings.

Inputs: vibration_rms and temperature_c only (wear is never observable).
This is the model the Monitor Agent calls as a tool.
"""
from __future__ import annotations

import pandas as pd
from sklearn.ensemble import IsolationForest

# Observable features without feature leakage (internal wear_level is unobservable in production)
FEATURE_COLUMNS = ["vibration_rms", "temperature_c"]


class AnomalyDetector:
    def __init__(self, contamination: float = 0.005, random_state: int = 42, reference_cycles: int = 80):
        self.model = IsolationForest(
            contamination=contamination, random_state=random_state, n_estimators=200
        )
        self.reference_cycles = reference_cycles
        self.is_fitted = False

    def fit(self, history_df: pd.DataFrame):
        ref = history_df
        if "cycles_since_service" in ref.columns:
            early = ref[ref["cycles_since_service"] <= self.reference_cycles]
            if len(early) >= 50:
                ref = early
        if "status" in ref.columns:
            ref = ref[~ref["status"].isin(("failed", "in_maintenance"))]
        self.model.fit(ref[FEATURE_COLUMNS])
        self.is_fitted = True
        return self

    def score(self, df: pd.DataFrame) -> pd.DataFrame:
        """Returns df with two added columns:
        - anomaly_score: lower = more anomalous
        - is_anomaly: bool flag from the fitted contamination threshold
        """
        if not self.is_fitted:
            raise RuntimeError("Call .fit() before .score()")
        out = df.copy()
        out["anomaly_score"] = self.model.decision_function(out[FEATURE_COLUMNS])
        out["is_anomaly"] = self.model.predict(out[FEATURE_COLUMNS]) == -1
        return out

    def score_latest(self, latest_states: list[dict]) -> list[dict]:
        """Convenience method for the agent tool layer: takes a list of
        MachineState dicts, returns them annotated with anomaly info."""
        df = pd.DataFrame(latest_states)
        scored = self.score(df)
        return scored.to_dict(orient="records")


if __name__ == "__main__":
    from digital_twin.simulator import FactoryTwin

    twin = FactoryTwin()
    twin.run(duration_s=7200)
    history = twin.history_dataframe()

    detector = AnomalyDetector().fit(history)
    scored = detector.score(history)

    print(scored[scored["is_anomaly"]][
        ["machine_id", "sim_time_s", "wear_level", "vibration_rms", "temperature_c", "anomaly_score"]
    ].tail(10))
