// views/home.js — landing dashboard: greeting, stats strip, quick access

import { getRegistry } from "../data.js";
import { getTest, isRead, summary } from "../store.js";
import { render, errorState, loading, esc } from "../ui.js";

function subjectCardMini(s) {
  const test = getTest(s.id);
  const read = isRead(s.id);
  const best = test ? test.best : null;

  return `<div class="subject-card">
    <div class="subject-top">
      <div class="subject-icon" style="background:${s.color}1a">${s.icon}</div>
      <div>
        <div class="subject-name">${esc(s.title)}</div>
        <div class="subject-desc">${esc(s.description)}</div>
      </div>
    </div>
    <div class="subject-meta">
      <span><b>${s.lessonCount}</b> konu</span>
      <span><b>${s.questionCount}</b> soru</span>
      <span style="margin-left:auto">${
        read ? "✓ Okundu" : "Başlanmadı"
      }${best !== null ? ` · en iyi %${best}` : ""}</span>
    </div>
    <div class="subject-actions">
      <a class="btn btn-ghost" href="#/ders/${s.id}" data-link>Ders Çalış</a>
      <a class="btn btn-primary" href="#/test/${s.id}" data-link>Test Çöz</a>
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
      <h1 class="page-title">Hoş geldin 👋</h1>
      <p class="page-sub">Ehliyet sınavına hazırlan. Önce konuyu çalış, sonra testi çöz.</p>
    </div>

    <div class="hero-strip">
      <div class="hero-stat">
        <span class="hero-stat-value tnum">${s.solved}</span>
        <span class="hero-stat-label">Çözülen Soru</span>
        <span class="hero-stat-icon">📝</span>
      </div>
      <div class="hero-stat">
        <span class="hero-stat-value tnum">${s.readCount}/${reg.length}</span>
        <span class="hero-stat-label">Çalışılan Konu</span>
        <span class="hero-stat-icon">📚</span>
      </div>
      <div class="hero-stat">
        <span class="hero-stat-value tnum">${s.avgBest ? "%" + s.avgBest : "—"}</span>
        <span class="hero-stat-label">Ortalama Başarı</span>
        <span class="hero-stat-icon">🎯</span>
      </div>
    </div>

    <div class="section-head">
      <h2 class="section-title">Konular</h2>
      <a class="section-link" href="#/test" data-link>Tüm testler →</a>
    </div>
    <div class="card-grid">
      ${reg.map(subjectCardMini).join("")}
    </div>
  </div>`);
}
