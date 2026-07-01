// views/tests.js — "Test Çöz": list of subject tests with best-score badges

import { getRegistry } from "../data.js";
import { getTest } from "../store.js";
import { render, errorState, loading, esc, CHEVRON } from "../ui.js";

export async function testListView() {
  render(loading());
  let reg;
  try {
    reg = await getRegistry();
  } catch {
    render(errorState());
    return;
  }

  render(`<div class="wrap">
    <div class="page-head">
      <h1 class="page-title">Test Çöz</h1>
      <p class="page-sub">Bir konu seç ve testi çöz. Her sorudan sonra doğru cevabı ve açıklamayı görürsün.</p>
    </div>
    <div class="test-list">
      ${reg.map(testRow).join("")}
    </div>
  </div>`);
}

function testRow(s) {
  const t = getTest(s.id);
  let pill;
  if (!t) {
    pill = `<span class="test-item-pill pill-new">Yeni</span>`;
  } else {
    const cls = t.best >= 70 ? "pill-good" : t.best >= 50 ? "pill-mid" : "pill-bad";
    pill = `<span class="test-item-pill ${cls}">En iyi %${t.best}</span>`;
  }
  const sub = t
    ? `${s.questionCount} soru · ${t.attempts} deneme · son %${t.last}`
    : `${s.questionCount} soru · henüz çözülmedi`;

  return `<a class="test-item" href="#/test/${s.id}" data-link>
    <div class="subject-icon" style="background:${s.color}1a">${s.icon}</div>
    <div class="test-item-body">
      <div class="test-item-name">${esc(s.title)}</div>
      <div class="test-item-sub">${esc(sub)}</div>
    </div>
    ${pill}
    <span class="test-item-go">${CHEVRON}</span>
  </a>`;
}
