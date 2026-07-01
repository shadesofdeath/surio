// views/tests.js — "Test Çöz": list of subject tests with best-score badges

import { getRegistry } from "../data.js";
import { getTest } from "../store.js";
import { QUIZ_SIZE, PASS_SCORE, NEAR_SCORE } from "../config.js";
import { icon } from "../icons.js";
import { render, errorState, loading, esc } from "../ui.js";

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
  const count = Math.min(s.questionCount, QUIZ_SIZE);

  let pill;
  if (!t) {
    pill = `<span class="test-item-pill pill-new">Yeni</span>`;
  } else {
    const cls = t.best >= PASS_SCORE ? "pill-good" : t.best >= NEAR_SCORE ? "pill-mid" : "pill-bad";
    pill = `<span class="test-item-pill ${cls}">En iyi %${t.best}</span>`;
  }
  const sub = t
    ? `${count} soru · ${t.attempts} deneme · son %${t.last}`
    : `${count} soru · henüz çözülmedi`;

  return `<a class="test-item" href="#/test/${s.id}" data-link>
    <span class="subject-ic" style="--c:${s.color}">${icon(s.icon)}</span>
    <div class="test-item-body">
      <div class="test-item-name">${esc(s.title)}</div>
      <div class="test-item-sub">${esc(sub)}</div>
    </div>
    ${pill}
    <span class="test-item-go">${icon("chevron-right")}</span>
  </a>`;
}
