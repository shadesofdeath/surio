// views/study.js — "Ders Çalış": subject list + per-subject lesson reader

import { getRegistry, getSubject } from "../data.js";
import { isRead, markRead } from "../store.js";
import { QUIZ_SIZE } from "../config.js";
import { icon } from "../icons.js";
import { render, errorState, loading, esc } from "../ui.js";

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
  return `<a class="subject-card is-link" href="#/ders/${s.id}" data-link>
    <div class="subject-top">
      <span class="subject-ic" style="--c:${s.color}">${icon(s.icon)}</span>
      <div class="subject-heading">
        <div class="subject-name">${esc(s.title)}</div>
        <div class="subject-desc">${esc(s.description)}</div>
      </div>
    </div>
    <div class="subject-meta">
      <span><b>${s.lessonCount}</b> konu başlığı</span>
      <span class="subject-status">${
        read
          ? `<span class="dot dot-good"></span>Okundu`
          : `Oku ${icon("arrow-right")}`
      }</span>
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
            ? `<ul class="lesson-points">${l.points
                .map((p) => `<li class="lesson-point">${esc(p)}</li>`)
                .join("")}</ul>`
            : ""
        }
      </article>`
    )
    .join("");

  const count = Math.min(subject.questions.length, QUIZ_SIZE);

  render(`<div class="wrap">
    <a class="back-link" href="#/ders" data-link>${icon("arrow-left")} Tüm konular</a>
    <div class="subject-hero">
      <span class="subject-ic lg" style="--c:${subject.color}">${icon(subject.icon)}</span>
      <div>
        <h1 class="page-title">${esc(subject.title)}</h1>
        <p class="page-sub">${esc(subject.description)}</p>
      </div>
    </div>

    <div class="lesson-list">${blocks}</div>

    <div class="study-cta">
      <div>
        <div class="study-cta-title">Konuyu bitirdin mi?</div>
        <p>Şimdi ${count} soruluk testi çözerek bilgini pekiştir.</p>
      </div>
      <a class="btn btn-primary" href="#/test/${subject.id}" data-link>
        ${icon("clipboard-check")} Testi çöz
      </a>
    </div>
  </div>`);

  // Mark as read once the reader is opened.
  if (!isRead(id)) markRead(id);
}
