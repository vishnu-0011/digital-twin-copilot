import re
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from digital_twin.standards import ISO_10816_ZONE_LIMITS_MM_S, iso_zone, zone_c_threshold
from ml_pipeline import model_cache

ROOT = Path(__file__).resolve().parent.parent


class TestIsoZones(unittest.TestCase):
    def test_zone_boundaries(self):
        self.assertEqual(iso_zone(0.5), "A")
        self.assertEqual(iso_zone(1.4), "B")
        self.assertEqual(iso_zone(2.79), "B")
        self.assertEqual(iso_zone(2.8), "C")
        self.assertEqual(iso_zone(4.5), "D")

    def test_simulator_spans_all_zones(self):
        # vibration = 0.5 + 4 * wear^1.8 (noise-free)
        vib = lambda w: 0.5 + 4.0 * w ** 1.8
        self.assertEqual(iso_zone(vib(0.0)), "A")
        self.assertEqual(iso_zone(vib(0.86)), "C")
        self.assertEqual(iso_zone(vib(1.0)), "D")

    def test_frontend_limits_match_backend(self):
        js = (ROOT / "web/js/standards.js").read_text()
        m = re.search(r"ISO_ZONE_LIMITS\s*=\s*\[([^\]]+)\]", js)
        self.assertIsNotNone(m, "ISO_ZONE_LIMITS not found in standards.js")
        js_limits = tuple(float(x) for x in m.group(1).split(","))
        self.assertEqual(js_limits, ISO_10816_ZONE_LIMITS_MM_S)

    def test_diagnosis_threshold_is_zone_c(self):
        self.assertEqual(zone_c_threshold(), 2.8)


class TestModelCache(unittest.TestCase):
    def test_second_load_comes_from_cache(self):
        with tempfile.TemporaryDirectory() as d, \
                mock.patch.object(model_cache, "CACHE_DIR", Path(d)), \
                mock.patch.object(model_cache, "_train", side_effect=lambda *a, **k: ({"det": 1}, {"pred": 2})) as train:
            det, pred, src = model_cache.load_or_train(seed=1, duration_s=10, log=lambda *_: None)
            self.assertEqual(src, "trained")
            det2, pred2, src2 = model_cache.load_or_train(seed=1, duration_s=10, log=lambda *_: None)
            self.assertEqual(src2, "cache")
            self.assertEqual((det2, pred2), ({"det": 1}, {"pred": 2}))
            self.assertEqual(train.call_count, 1)

    def test_different_params_retrain(self):
        with tempfile.TemporaryDirectory() as d, \
                mock.patch.object(model_cache, "CACHE_DIR", Path(d)), \
                mock.patch.object(model_cache, "_train", side_effect=lambda *a, **k: ({}, {})) as train:
            model_cache.load_or_train(seed=1, duration_s=10, log=lambda *_: None)
            model_cache.load_or_train(seed=2, duration_s=10, log=lambda *_: None)
            self.assertEqual(train.call_count, 2)


if __name__ == "__main__":
    unittest.main()
