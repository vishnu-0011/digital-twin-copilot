/**
 * Recent readings per machine, for the drawer's trend chart.
 * Seeded from GET /machines/{id}/history, then extended from the live stream.
 */

const MAX = 90;
const store = new Map();   // id -> [{cycle, vib, temp}]
const loading = new Set();

export function recordFleet(fleet) {
  fleet.forEach(m => {
    const arr = store.get(m.machine_id);
    if (!arr) return; // only track machines someone has looked at
    const last = arr[arr.length - 1];
    if (last && last.cycle === m.cycle_count && last.vib === m.vibration_rms) return;
    arr.push({ cycle: m.cycle_count, vib: m.vibration_rms, temp: m.temperature_c });
    if (arr.length > MAX) arr.splice(0, arr.length - MAX);
  });
}

export async function ensureHistory(id, onReady) {
  if (store.has(id) || loading.has(id)) return;
  loading.add(id);
  try {
    const res = await fetch(`/machines/${encodeURIComponent(id)}/history?n=${MAX}`);
    const data = res.ok ? await res.json() : { readings: [] };
    store.set(id, data.readings.map(r => ({ cycle: r.cycle_count, vib: r.vibration_rms, temp: r.temperature_c })));
  } catch {
    store.set(id, []);
  } finally {
    loading.delete(id);
    onReady && onReady();
  }
}

export function getHistory(id) {
  return store.get(id) || [];
}
