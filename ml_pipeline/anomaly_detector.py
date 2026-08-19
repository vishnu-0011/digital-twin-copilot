"""
Anomaly Detection
==================
Flags machine states that deviate from normal operating behavior using an
Isolation Forest over (vibration_rms, temperature_c, wear_level). Trained on
the digital twin's own history — in a real deployment you'd fit this on
historical telemetry instead, but the model interface is identical either
way (that's the point of using the twin as a stand-in data source).

This is the model the Monitor Agent calls as a tool.
"""
from __future__ import annotations

import pandas as pd
from sklearn.ensemble import IsolationForest

FEATURE_COLUMNS = ["vibration_rms", "temperature_c", "wear_level"]


class AnomalyDetector:
    def __init__(self, contamination: float = 0.05, random_state: int = 42):
        self.model = IsolationForest(
            contamination=contamination, random_state=random_state, n_estimators=200
        )
        self.is_fitted = False

    def fit(self, history_df: pd.DataFrame):
        self.model.fit(history_df[FEATURE_COLUMNS])
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
