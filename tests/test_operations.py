import time
import unittest

from fastapi.testclient import TestClient

from api.main import app
from digital_twin.simulator import FactoryTwin


class TestOperationsApi(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.client.__enter__()

    @classmethod
    def tearDownClass(cls):
        cls.client.__exit__(None, None, None)

    def test_work_order_puts_machine_in_service_and_logs_it(self):
        self.client.post("/fault/inject", json={"machine_id": "CNC-02", "wear_level": 0.8})
        res = self.client.post("/work-orders", json={"machine_id": "CNC-02", "approved_by": "Test Supervisor"}).json()
        self.assertEqual(res["status"], "ok")
        self.assertIsNotNone(res["service_ends_s"])
        fleet = {m["machine_id"]: m for m in self.client.get("/fleet").json()["machines"]}
        self.assertEqual(fleet["CNC-02"]["status"], "in_maintenance")
        self.assertIsNotNone(fleet["CNC-02"]["service_ends_s"])
        again = self.client.post("/work-orders", json={"machine_id": "CNC-02"}).json()
        self.assertEqual(again["status"], "noop")
        log = self.client.get("/maintenance/log").json()["entries"]
        self.assertTrue(any(e["kind"] == "work_order" and e["by"] == "Test Supervisor" for e in log))

    def test_reset_gives_every_machine_a_new_part(self):
        self.client.post("/fault/inject", json={"machine_id": "PRESS-01", "wear_level": 0.9})
        self.client.post("/fleet/reset")
        for m in self.client.get("/fleet").json()["machines"]:
            if m["status"] == "in_maintenance":
                continue
            self.assertLess(m["wear_level"], 0.1)
            self.assertLess(m["cycles_since_service"], 100, m["machine_id"])  # 5% wear on the slowest machine is ~71 cycles
            # A fresh part must not be flagged for service.
            self.assertGreater(m["predicted_rul_cycles"], 60, m["machine_id"])

    def test_machine_history(self):
        data = self.client.get("/machines/CNC-01/history?n=25").json()
        self.assertEqual(len(data["readings"]), 25)
        self.assertIn("vibration_rms", data["readings"][0])

    def test_snapshot_carries_plant_clock(self):
        with self.client.websocket_connect("/ws/telemetry") as ws:
            snap = ws.receive_json()
        self.assertIn("plant", snap)
        self.assertTrue(snap["plant"]["simulated"])
        self.assertIn("impact", snap["plant"])
        self.assertIsInstance(snap["log"], list)


class TestBoundedLivePlant(unittest.TestCase):
    def test_recent_window_cost_is_flat(self):
        twin = FactoryTwin(seed=3, max_history=5000)
        twin.run(24 * 3600)
        self.assertLessEqual(len(twin.history), 5000)
        t = time.perf_counter()
        df = twin.recent_dataframe()
        self.assertLess(time.perf_counter() - t, 0.2)
        self.assertEqual(len(df), 8 * 30)


if __name__ == "__main__":
    unittest.main()
