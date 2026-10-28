import unittest
from fastapi.testclient import TestClient
from api.main import app


class TestWebSocketTelemetry(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.client.__enter__()

    @classmethod
    def tearDownClass(cls):
        cls.client.__exit__(None, None, None)

    def test_websocket_connect_and_receive_initial_telemetry(self):
        """Verify client connects to /ws/telemetry and immediately receives telemetry snapshot."""
        with self.client.websocket_connect("/ws/telemetry") as websocket:
            data = websocket.receive_json()
            self.assertEqual(data.get("type"), "telemetry")
            self.assertIn("timestamp", data)
            self.assertIn("machines", data)
            self.assertIn("pipeline", data)

            # Validate machines payload
            machines = data["machines"]
            self.assertEqual(len(machines), 8)
            first_machine = machines[0]
            self.assertIn("machine_id", first_machine)
            self.assertIn("vibration_rms", first_machine)
            self.assertIn("temperature_c", first_machine)

            # Validate pipeline payload
            pipeline = data["pipeline"]
            self.assertIn("manufacturing_stages", pipeline)
            self.assertEqual(len(pipeline["manufacturing_stages"]), 10)

    def test_websocket_ping_pong(self):
        """Verify WebSocket ping responds with pong."""
        with self.client.websocket_connect("/ws/telemetry") as websocket:
            # Consume initial snapshot
            _ = websocket.receive_json()

            websocket.send_json({"action": "ping"})
            resp = websocket.receive_json()
            self.assertEqual(resp.get("type"), "pong")
            self.assertIn("timestamp", resp)

    def test_websocket_step_simulation(self):
        """Verify WebSocket step action advances simulation and broadcasts update."""
        with self.client.websocket_connect("/ws/telemetry") as websocket:
            _ = websocket.receive_json()

            websocket.send_json({"action": "step", "duration_s": 600})
            # Client receives broadcast and action_result
            msg1 = websocket.receive_json()
            msg2 = websocket.receive_json()
            msgs = [msg1, msg2]
            action_res = next((m for m in msgs if m.get("type") == "action_result"), None)
            telemetry_res = next((m for m in msgs if m.get("type") == "telemetry"), None)

            self.assertIsNotNone(action_res)
            self.assertEqual(action_res.get("action"), "step")
            self.assertEqual(action_res.get("status"), "ok")
            self.assertIsNotNone(telemetry_res)

    def test_websocket_repair_and_reset(self):
        """Verify WebSocket repair and reset actions mutate twin state."""
        with self.client.websocket_connect("/ws/telemetry") as websocket:
            _ = websocket.receive_json()

            # Test repair
            websocket.send_json({"action": "repair", "machine_id": "CNC-01"})
            msg1 = websocket.receive_json()
            msg2 = websocket.receive_json()
            msgs = [msg1, msg2]
            repair_res = next((m for m in msgs if m.get("type") == "action_result"), None)
            self.assertIsNotNone(repair_res)
            self.assertEqual(repair_res.get("machine_id"), "CNC-01")
            self.assertEqual(repair_res.get("status"), "ok")

            # Test reset
            websocket.send_json({"action": "reset"})
            msg3 = websocket.receive_json()
            msg4 = websocket.receive_json()
            msgs2 = [msg3, msg4]
            reset_res = next((m for m in msgs2 if m.get("type") == "action_result"), None)
            self.assertIsNotNone(reset_res)
            self.assertEqual(reset_res.get("action"), "reset")
            self.assertEqual(reset_res.get("status"), "ok")

    def test_websocket_scan_action(self):
        """Verify WebSocket scan action triggers agent graph and returns result."""
        with self.client.websocket_connect("/ws/telemetry") as websocket:
            _ = websocket.receive_json()

            websocket.send_json({"action": "scan"})
            msg1 = websocket.receive_json()
            msg2 = websocket.receive_json()
            msgs = [msg1, msg2]
            scan_res = next((m for m in msgs if m.get("type") == "scan_result"), None)
            self.assertIsNotNone(scan_res)
            self.assertEqual(scan_res.get("status"), "ok")
            self.assertIn("result", scan_res)

    def test_websocket_inject_fault_action(self):
        """Verify WebSocket inject_fault action sets machine wear and broadcasts."""
        with self.client.websocket_connect("/ws/telemetry") as websocket:
            _ = websocket.receive_json()

            websocket.send_json({"action": "inject_fault", "machine_id": "CNC-01", "wear_level": 0.88, "status": "critical"})
            msg1 = websocket.receive_json()
            msg2 = websocket.receive_json()
            msgs = [msg1, msg2]
            action_res = next((m for m in msgs if m.get("type") == "action_result"), None)
            self.assertIsNotNone(action_res)
            self.assertEqual(action_res.get("action"), "inject_fault")
            self.assertEqual(action_res.get("machine_id"), "CNC-01")
            self.assertEqual(action_res.get("wear_level"), 0.88)


if __name__ == "__main__":
    unittest.main()
