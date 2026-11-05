/**
 * Vibration severity standard (mirror of digital_twin/standards.py)
 * ================================================================
 * ISO 10816-3 / 20816-3, group 2 (15–300 kW), rigid foundation,
 * velocity RMS in mm/s. tests/test_standards.py checks these limits
 * match the Python module, so change both together.
 */

export const ISO_ZONE_LIMITS = [1.4, 2.8, 4.5]; // A/B, B/C, C/D

export const ISO_ZONES = {
  A: { label: 'good', color: 'var(--color-emerald)' },
  B: { label: 'acceptable', color: 'var(--color-cyan)' },
  C: { label: 'unsatisfactory', color: 'var(--color-amber)' },
  D: { label: 'damage risk', color: 'var(--color-rose)' },
};

export function isoZone(vib) {
  const [ab, bc, cd] = ISO_ZONE_LIMITS;
  if (vib < ab) return 'A';
  if (vib < bc) return 'B';
  if (vib < cd) return 'C';
  return 'D';
}

/** Upper end of the gauge scale (zone D is open-ended). */
export const ISO_GAUGE_MAX = 7.1;

/**
 * The RUL model is trained with healthy life capped at 100 cycles
 * (piecewise-linear target), so predictions near the cap mean
 * "no degradation trend yet", not a precise count.
 */
export const RUL_PLATEAU = 90;

export function formatRul(rul) {
  if (rul == null || Number.isNaN(rul)) return '--';
  return rul >= RUL_PLATEAU ? `${RUL_PLATEAU}+` : `${Math.round(rul)}`;
}
