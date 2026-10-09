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
        self.assertGreater(len(data["machines"]), 0)

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


if __name__ == "__main__":
    unittest.main()
