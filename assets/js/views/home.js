// views/home.js — landing dashboard: greeting, stats strip, subject cards

import { getRegistry } from "../data.js";
import { getTest, isRead, summary } from "../store.js";
import { QUIZ_SIZE, PASS_SCORE, NEAR_SCORE } from "../config.js";
import { icon } from "../icons.js";
import { render, errorState, loading, esc } from "../ui.js";

function statCard(iconName, value, label) {
  return `<div class="hero-stat">
    <span class="hero-stat-ic">${icon(iconName)}</span>
    <span class="hero-stat-value tnum">${value}</span>
    <span class="hero-stat-label">${label}</span>
  </div>`;
}

function subjectCard(s) {
  const test = getTest(s.id);
  const read = isRead(s.id);
  const best = test ? test.best : null;
  const count = Math.min(s.questionCount, QUIZ_SIZE);

  let status;
  if (best === null) {
    status = read ? "Okundu · test bekliyor" : "Henüz başlanmadı";
  } else {
    const tone = best >= PASS_SCORE ? "good" : best >= NEAR_SCORE ? "mid" : "bad";
    status = `<span class="dot dot-${tone}"></span>En iyi %${best}`;
  }

  return `<div class="subject-card">
    <div class="subject-top">
      <span class="subject-ic" style="--c:${s.color}">${icon(s.icon)}</span>
      <div class="subject-heading">
        <div class="subject-name">${esc(s.title)}</div>
        <div class="subject-desc">${esc(s.description)}</div>
      </div>
    </div>
    <div class="subject-meta">
      <span><b>${s.lessonCount}</b> konu</span>
      <span><b>${count}</b> soru</span>
      <span class="subject-status">${status}</span>
    </div>
    <div class="subject-actions">
      <a class="btn btn-ghost" href="#/ders/${s.id}" data-link>${icon("book-open")} Ders</a>
      <a class="btn btn-primary" href="#/test/${s.id}" data-link>${icon("clipboard-check")} Test</a>
    </div>
  </div>`;
}

export async function homeView() {
  render(loading());
  let reg;
  try {
    reg = await getRegistry();
  } catch {
    render(errorState());
    return;
  }

  const s = summary();

  render(`<div class="wrap">
    <div class="page-head">
      <h1 class="page-title">Hoş geldin</h1>
      <p class="page-sub">Ehliyet sınavına hazırlan. Önce konuyu çalış, sonra testi çöz.</p>
    </div>

    <div class="hero-strip">
      ${statCard("clipboard-check", s.solved, "Çözülen Soru")}
      ${statCard("book", `${s.readCount}/${reg.length}`, "Çalışılan Konu")}
      ${statCard("target", s.avgBest ? "%" + s.avgBest : "—", "Ortalama Başarı")}
    </div>

    <div class="section-head">
      <h2 class="section-title">Konular</h2>
      <a class="section-link" href="#/test" data-link>Tüm testler ${icon("arrow-right")}</a>
    </div>
    <div class="card-grid">
      ${reg.map(subjectCard).join("")}
    </div>
  </div>`);
}
