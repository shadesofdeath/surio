// store.js — progress persistence in localStorage
//
// Shape:
// {
//   read:   { [subjectId]: true },                // ders okundu işareti
//   tests:  { [subjectId]: { best, last, attempts, total } },  // en iyi/son skor
//   solved: number                                // toplam çözülen soru sayısı
// }

const KEY = "surio.progress.v1";

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { read: {}, tests: {}, solved: 0 };
    const data = JSON.parse(raw);
    return { read: {}, tests: {}, solved: 0, ...data };
  } catch {
    return { read: {}, tests: {}, solved: 0 };
  }
}

let state = load();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch { /* storage full / disabled — ignore */ }
}

export function getState() {
  return state;
}

export function markRead(subjectId) {
  state.read[subjectId] = true;
  save();
}

export function isRead(subjectId) {
  return !!state.read[subjectId];
}

/** Record a finished quiz. score/total are the raw counts. */
export function recordTest(subjectId, correct, total) {
  const prev = state.tests[subjectId] || { best: 0, last: 0, attempts: 0, total };
  const last = Math.round((correct / total) * 100);
  state.tests[subjectId] = {
    best: Math.max(prev.best, last),
    last,
    attempts: prev.attempts + 1,
    total,
  };
  state.solved += total;
  save();
  return state.tests[subjectId];
}

export function getTest(subjectId) {
  return state.tests[subjectId] || null;
}

/** Aggregate numbers for the home + stats views. */
export function summary() {
  const tests = Object.values(state.tests);
  const attempts = tests.reduce((a, t) => a + t.attempts, 0);
  const avgBest = tests.length
    ? Math.round(tests.reduce((a, t) => a + t.best, 0) / tests.length)
    : 0;
  return {
    solved: state.solved,
    attempts,
    avgBest,
    subjectsTried: tests.length,
    readCount: Object.keys(state.read).length,
  };
}

export function reset() {
  state = { read: {}, tests: {}, solved: 0 };
  save();
}
