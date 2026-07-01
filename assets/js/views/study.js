// views/study.js — "Ders Çalış": subject list + per-subject lesson reader

import { getRegistry, getSubject } from "../data.js";
import { isRead, markRead } from "../store.js";
import { render, errorState, loading, esc, ARROW_L } from "../ui.js";

/** List of all subjects to study. */
export async function studyListView() {
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
      <h1 class="page-title">Ders Çalış</h1>
      <p class="page-sub">Her konunun özetini oku, önemli noktaları öğren. Hazır olunca teste geç.</p>
    </div>
    <div class="card-grid">
      ${reg.map(studyCard).join("")}
    </div>
  </div>`);
}

function studyCard(s) {
  const read = isRead(s.id);
  return `<a class="subject-card" href="#/ders/${s.id}" data-link>
    <div class="subject-top">
      <div class="subject-icon" style="background:${s.color}1a">${s.icon}</div>
      <div>
        <div class="subject-name">${esc(s.title)}</div>
        <div class="subject-desc">${esc(s.description)}</div>
      </div>
    </div>
    <div class="subject-meta">
      <span><b>${s.lessonCount}</b> konu başlığı</span>
      <span style="margin-left:auto">${read ? "✓ Okundu" : "Oku →"}</span>
    </div>
  </a>`;
}

/** Lesson reader for one subject. */
export async function studyDetailView({ id }) {
  render(loading());
  let subject;
  try {
    subject = await getSubject(id);
  } catch {
    render(errorState("Bu konu bulunamadı."));
    return;
  }

  const blocks = subject.lessons
    .map(
      (l, i) => `<article class="lesson-block">
        <span class="lesson-num">${i + 1}</span>
        <h2 class="lesson-h">${esc(l.title)}</h2>
        ${l.body ? `<p class="lesson-p">${esc(l.body)}</p>` : ""}
        ${
          l.points && l.points.length
            ? `<div class="lesson-points">${l.points
                .map((p) => `<div class="lesson-point">${esc(p)}</div>`)
                .join("")}</div>`
            : ""
        }
      </article>`
    )
    .join("");

  render(`<div class="wrap">
    <a class="back-link" href="#/ders" data-link>${ARROW_L} Tüm konular</a>
    <div class="page-head">
      <h1 class="page-title">${subject.icon} ${esc(subject.title)}</h1>
      <p class="page-sub">${esc(subject.description)}</p>
    </div>

    <div class="lesson-list">${blocks}</div>

    <div class="study-cta">
      <p>Konuyu bitirdin mi? Şimdi bilgini test et.</p>
      <a class="btn btn-primary" href="#/test/${subject.id}" data-link>
        ${subject.questions.length} soruluk testi çöz →
      </a>
    </div>
  </div>`);

  // Mark as read once the reader is opened.
  if (!isRead(id)) markRead(id);
}
