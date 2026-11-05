import unittest

from digital_twin.simulator import FactoryTwin
from digital_twin.forecast import forecast_fleet


class TestForecast(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.twin = FactoryTwin(seed=101)
        cls.twin.run(duration_s=1200)
        cls.before = {mid: (m.wear_level, m.cycle_count) for mid, m in cls.twin.machines.items()}
        cls.result = forecast_fleet(cls.twin, horizon_s=8 * 3600, samples=49)

    def test_live_twin_untouched(self):
        after = {mid: (m.wear_level, m.cycle_count) for mid, m in self.twin.machines.items()}
        self.assertEqual(self.before, after)
        self.assertAlmostEqual(self.twin.env.now, 1200)

    def test_series_shape(self):
        self.assertEqual(len(self.result["times_s"]), 49)
        for policy in self.result["policies"].values():
            for m in policy["machines"].values():
                for key in ("wear", "status", "parts", "vibration_rms", "rul_cycles"):
                    self.assertEqual(len(m[key]), 49, key)

    def test_starts_from_live_state(self):
        for mid, m in self.result["policies"]["run_to_failure"]["machines"].items():
            self.assertAlmostEqual(m["wear"][0], round(self.twin.machines[mid].wear_level, 4), places=3)

    def test_copilot_prevents_breakdowns(self):
        rtf = self.result["policies"]["run_to_failure"]["summary"]
        cop = self.result["policies"]["copilot"]["summary"]
        self.assertGreater(rtf["breakdowns"], 0)
        self.assertEqual(cop["breakdowns"], 0)
        self.assertGreater(cop["parts"], rtf["parts"])
        self.assertLess(cop["downtime_h"], rtf["downtime_h"])


if __name__ == "__main__":
    unittest.main()


class TestAgeTo(unittest.TestCase):
    def test_aging_emits_realistic_history(self):
        twin = FactoryTwin(seed=101)
        twin.run(duration_s=1200)
        m = twin.machines["CNC-01"]
        before_rows, before_cycles = len(twin.history), m.cycle_count
        m.age_to(0.86)
        self.assertAlmostEqual(m.wear_level, 0.86, places=6)
        self.assertEqual(m.status.value, "critical")
        added = m.cycle_count - before_cycles
        self.assertGreater(added, 100)  # ~380 cycles at 0.0018 wear/cycle
        self.assertEqual(len(twin.history) - before_rows, added)
        cnc = [s for s in twin.history if s.machine_id == "CNC-01"][-added:]
        steps = [b.vibration_rms - a.vibration_rms for a, b in zip(cnc, cnc[1:])]
        self.assertLess(max(steps), 0.6)  # no single teleport jump
