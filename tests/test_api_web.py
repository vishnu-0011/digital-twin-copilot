import unittest
from fastapi.testclient import TestClient
from api.main import app


class TestApiWeb(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Use TestClient with lifespan context
        cls.client = TestClient(app)
        cls.client.__enter__()

    @classmethod
    def tearDownClass(cls):
        cls.client.__exit__(None, None, None)

    def test_health_endpoint(self):
        resp = self.client.get("/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["mode"], "100% Pure ML (Zero API Keys)")
        self.assertIn("rul_backend", data)

    def test_fleet_endpoint(self):
        resp = self.client.get("/fleet")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("machines", data)
        self.assertEqual(len(data["machines"]), 8)

    def test_maintenance_trigger_endpoint(self):
        resp = self.client.post("/maintenance/trigger", json={"machine_id": "CNC-01"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["machine_id"], "CNC-01")
        self.assertTrue(data["scheduled"])

    def test_static_web_index(self):
        resp = self.client.get("/")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("text/html", resp.headers["content-type"])

    def test_pipeline_flow_endpoint(self):
        resp = self.client.get("/pipeline/flow")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("company", data)
        self.assertEqual(data["company"]["name"], "Titan Aerospace Precision Fab")
        self.assertIn("manufacturing_stages", data)
        self.assertEqual(len(data["manufacturing_stages"]), 10)
    def test_fleet_reset_endpoint(self):
        resp = self.client.post("/fleet/reset")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "SUCCESS")
        self.assertIn("fleet", data)
        for m in data["fleet"]:
            self.assertEqual(m["status"], "healthy")
            self.assertLessEqual(m["wear_level"], 0.1)


if __name__ == "__main__":
    unittest.main()
