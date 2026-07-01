// views/quiz.js — interactive quiz runner for a single subject

import { getSubject } from "../data.js";
import { recordTest } from "../store.js";
import { navigate } from "../router.js";
import {
  render, errorState, loading, esc, pct,
  CHECK, CROSS,
} from "../ui.js";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

/** Fisher–Yates shuffle (returns a new array). */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Prepare a question: shuffle its options and track the new answer index. */
function prepare(q) {
  const idx = q.options.map((_, i) => i);
  const order = shuffle(idx);
  return {
    question: q.question,
    explanation: q.explanation,
    options: order.map((i) => q.options[i]),
    answer: order.indexOf(q.answer),
  };
}

export async function quizView({ id }) {
  render(loading());
  let subject;
  try {
    subject = await getSubject(id);
  } catch {
    render(errorState("Bu test bulunamadı."));
    return;
  }
  if (!subject.questions || !subject.questions.length) {
    render(errorState("Bu konuda henüz soru yok."));
    return;
  }

  const quiz = {
    subject,
    questions: shuffle(subject.questions).map(prepare),
    i: 0,
    correct: 0,
    picked: null, // index chosen for current question, or null
  };

  renderQuestion(quiz);
}

function renderQuestion(quiz) {
  const total = quiz.questions.length;
  const q = quiz.questions[quiz.i];
  const answered = quiz.picked !== null;

  const optionsHtml = q.options
    .map((opt, i) => {
      let cls = "option";
      let mark = "";
      if (answered) {
        if (i === q.answer) { cls += " correct"; mark = CHECK; }
        else if (i === quiz.picked) { cls += " wrong"; mark = CROSS; }
      }
      return `<button class="${cls}" data-opt="${i}" ${answered ? "disabled" : ""}>
        <span class="option-key">${LETTERS[i]}</span>
        <span class="option-text">${esc(opt)}</span>
        <span class="option-mark">${mark}</span>
      </button>`;
    })
    .join("");

  render(`<div class="wrap">
    <div class="quiz-bar">
      <div class="quiz-bar-progress">
        <div class="quiz-bar-count">Soru <b>${quiz.i + 1}</b> / ${total}</div>
        <div class="progress-track"><div class="progress-fill" style="width:${pct(quiz.i + (answered ? 1 : 0), total)}%"></div></div>
      </div>
      <button class="quiz-quit" data-quit>Çıkış</button>
    </div>

    <div class="quiz-card">
      <span class="quiz-badge">${quiz.subject.icon} ${esc(quiz.subject.title)}</span>
      <h2 class="quiz-question">${esc(q.question)}</h2>
      <div class="options">${optionsHtml}</div>
      ${
        answered && q.explanation
          ? `<div class="explain"><b>${
              quiz.picked === q.answer ? "Doğru ✓" : "Yanlış ✗"
            }</b> — ${esc(q.explanation)}</div>`
          : answered
          ? `<div class="explain"><b>${
              quiz.picked === q.answer ? "Doğru ✓" : "Yanlış ✗"
            }</b> — Doğru cevap: ${LETTERS[q.answer]}</div>`
          : ""
      }
      ${
        answered
          ? `<div class="quiz-foot"><button class="btn btn-primary" data-next>${
              quiz.i + 1 < total ? "Sonraki Soru →" : "Testi Bitir →"
            }</button></div>`
          : ""
      }
    </div>
  </div>`);

  bindQuestion(quiz);
}

function bindQuestion(quiz) {
  const root = document.getElementById("app");

  root.querySelectorAll("[data-opt]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (quiz.picked !== null) return;
      const i = Number(btn.dataset.opt);
      quiz.picked = i;
      if (i === quiz.questions[quiz.i].answer) quiz.correct++;
      renderQuestion(quiz);
    });
  });

  const next = root.querySelector("[data-next]");
  if (next) {
    next.addEventListener("click", () => {
      if (quiz.i + 1 < quiz.questions.length) {
        quiz.i++;
        quiz.picked = null;
        renderQuestion(quiz);
      } else {
        finish(quiz);
      }
    });
  }

  const quit = root.querySelector("[data-quit]");
  if (quit) {
    quit.addEventListener("click", () => {
      if (confirm("Testten çıkmak istediğine emin misin? İlerlemen kaydedilmez.")) {
        navigate("/test");
      }
    });
  }
}

function finish(quiz) {
  const total = quiz.questions.length;
  const correct = quiz.correct;
  const wrong = total - correct;
  const percent = pct(correct, total);
  const stat = recordTest(quiz.subject.id, correct, total);

  const C = 2 * Math.PI * 58; // ring circumference (r=58)
  const offset = C * (1 - percent / 100);

  let title, sub;
  if (percent >= 85) { title = "Harika! 🎉"; sub = "Bu konuya çok iyi hazırsın."; }
  else if (percent >= 70) { title = "Geçtin! ✓"; sub = "Sınav barajını aştın, tekrar denemekte fayda var."; }
  else if (percent >= 50) { title = "Az kaldı 💪"; sub = "Konuyu bir kez daha çalışıp tekrar dene."; }
  else { title = "Tekrar çalış 📚"; sub = "Önce dersi oku, sonra testi tekrar çöz."; }

  render(`<div class="wrap">
    <div class="result">
      <div class="result-ring">
        <svg viewBox="0 0 132 132">
          <circle class="result-ring-track" cx="66" cy="66" r="58"/>
          <circle class="result-ring-fill" cx="66" cy="66" r="58"
            stroke-dasharray="${C}" stroke-dashoffset="${C}" data-ring/>
        </svg>
        <div class="result-pct">%${percent}</div>
      </div>
      <h1 class="result-title">${title}</h1>
      <p class="result-sub">${sub}</p>

      <div class="result-stats">
        <div><div class="result-stat-v green tnum">${correct}</div><div class="result-stat-l">Doğru</div></div>
        <div><div class="result-stat-v red tnum">${wrong}</div><div class="result-stat-l">Yanlış</div></div>
        <div><div class="result-stat-v tnum">%${stat.best}</div><div class="result-stat-l">En iyi</div></div>
      </div>

      <div class="result-actions">
        <a class="btn btn-ghost" href="#/ders/${quiz.subject.id}" data-link>Dersi Tekrar Oku</a>
        <button class="btn btn-primary" data-retry>Tekrar Çöz</button>
      </div>
    </div>
  </div>`);

  // Animate the progress ring after paint.
  requestAnimationFrame(() => {
    const ring = document.querySelector("[data-ring]");
    if (ring) ring.style.strokeDashoffset = offset;
  });

  const retry = document.querySelector("[data-retry]");
  if (retry) retry.addEventListener("click", () => quizView({ id: quiz.subject.id }));
}
