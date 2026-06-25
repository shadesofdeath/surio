/* ============================================================
   SÜRIO — index.js  v2
   ============================================================ */

const TOPICS = [
  {
    id: "trafik-isaret-levhalari",
    name: "Trafik İşaret Levhaları",
    icon: "🚦",
    tests: [
      { id: "t1", name: "Test 1", file: "data/topics/trafik-isaret-levhalari-t1.json" },
      { id: "t2", name: "Test 2", file: "data/topics/trafik-isaret-levhalari-t2.json" },
    ],
  },
  {
    id: "trafik-kurallari",
    name: "Trafik Kuralları",
    icon: "📋",
    tests: [
      { id: "t1", name: "Test 1", file: "data/topics/trafik-kurallari-t1.json" },
    ],
  },
  {
    id: "ilk-yardim",
    name: "İlk Yardım",
    icon: "🏥",
    tests: [
      { id: "t1", name: "Test 1", file: "data/topics/ilk-yardim-t1.json" },
    ],
  },
  {
    id: "motor-ve-arac-bilgisi",
    name: "Motor ve Araç Bilgisi",
    icon: "🔧",
    tests: [
      { id: "t1", name: "Test 1", file: "data/topics/motor-ve-arac-bilgisi-t1.json" },
    ],
  },
];

// ── State
const state = {
  quiz: {
    topic: null, test: null,
    questions: [], current: 0,
    correct: 0, wrong: 0,
    answered: false,
  },
  stats: JSON.parse(localStorage.getItem("surio_stats") || "{}"),
};

// ── Views
const views = {
  home:   document.getElementById("view-home"),
  topics: document.getElementById("view-topics"),
  quiz:   document.getElementById("view-quiz"),
  result: document.getElementById("view-result"),
  stats:  document.getElementById("view-stats"),
};

function showView(name) {
  Object.values(views).forEach(v => v.classList.add("hidden"));
  views[name].classList.remove("hidden");
  document.querySelectorAll(".nav-item, .tab-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === name);
  });
}

// ── Nav wiring
document.querySelectorAll(".nav-item, .tab-item").forEach(btn => {
  btn.addEventListener("click", () => {
    const v = btn.dataset.view;
    if (!v) return;
    if (v === "home")   renderHome();
    if (v === "topics") renderTopics();
    if (v === "stats")  renderStats();
    showView(v);
  });
});

/* ============================================================
   HOME
   ============================================================ */
function renderHome() {
  let totalSolved = 0, totalCorrect = 0, testsDone = 0;
  TOPICS.forEach(topic => {
    const ts = state.stats[topic.id] || {};
    topic.tests.forEach(test => {
      const r = ts[test.id];
      if (!r) return;
      totalSolved  += r.total;
      totalCorrect += r.correct;
      testsDone++;
    });
  });

  document.getElementById("stat-solved").textContent   = totalSolved;
  document.getElementById("stat-done").textContent     = testsDone;
  document.getElementById("stat-accuracy").textContent =
    totalSolved > 0 ? `%${Math.round((totalCorrect / totalSolved) * 100)}` : "—";

  renderTopicCards(document.getElementById("home-topics"), TOPICS);
}

/* ============================================================
   TOPICS
   ============================================================ */
function renderTopics() {
  renderTopicCards(document.getElementById("all-topics"), TOPICS);
}

function renderTopicCards(container, topics) {
  container.innerHTML = "";
  topics.forEach(topic => {
    const ts = state.stats[topic.id] || {};
    const done = topic.tests.filter(t => ts[t.id]).length;
    const pct  = Math.round((done / topic.tests.length) * 100);

    const card = document.createElement("div");
    card.className = "topic-card";
    card.innerHTML = `
      <div class="topic-card-top">
        <div class="topic-icon-wrap">${topic.icon}</div>
        <div class="topic-card-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9,18 15,12 9,6"/>
          </svg>
        </div>
      </div>
      <div class="topic-name">${topic.name}</div>
      <div class="topic-meta">${topic.tests.length} test · ${done} tamamlandı</div>
      <div class="topic-progress-row">
        <div class="topic-progress-track">
          <div class="topic-progress-fill ${pct === 100 ? 'done' : ''}" style="width:${pct}%"></div>
        </div>
        <span class="topic-progress-pct">${pct}%</span>
      </div>
    `;
    card.addEventListener("click", () => openTestSelect(topic));
    container.appendChild(card);
  });
}

/* ============================================================
   TEST SELECT MODAL
   ============================================================ */
function openTestSelect(topic) {
  document.getElementById("modalTopicIcon").textContent  = topic.icon;
  document.getElementById("modalTopicTitle").textContent = topic.name;

  const ts = state.stats[topic.id] || {};
  const list = document.getElementById("testList");
  list.innerHTML = "";

  topic.tests.forEach(test => {
    const r = ts[test.id];
    const scoreTxt = r ? `%${Math.round((r.correct / r.total) * 100)} · ${r.total} soru` : "Henüz çözülmedi";
    const pill = r
      ? `<span class="test-item-pill done">%${Math.round((r.correct / r.total) * 100)}</span>`
      : `<span class="test-item-pill new">Başla</span>`;

    const item = document.createElement("div");
    item.className = "test-item";
    item.innerHTML = `
      <div class="test-item-left">
        <div class="test-item-name">${test.name}</div>
        <div class="test-item-sub">${scoreTxt}</div>
      </div>
      ${pill}
    `;
    item.addEventListener("click", () => { closeTestSelect(); startQuiz(topic, test); });
    list.appendChild(item);
  });

  document.getElementById("testSelectModal").classList.remove("hidden");
}

function closeTestSelect() {
  document.getElementById("testSelectModal").classList.add("hidden");
}

document.getElementById("modalClose").addEventListener("click", closeTestSelect);
document.getElementById("testSelectModal").addEventListener("click", e => {
  if (e.target === document.getElementById("testSelectModal")) closeTestSelect();
});

/* ============================================================
   QUIZ
   ============================================================ */
async function startQuiz(topic, test) {
  let questions;
  try {
    const res = await fetch(test.file);
    if (!res.ok) throw new Error();
    questions = await res.json();
  } catch {
    alert(`"${test.file}" yüklenemedi.\n\nJSON dosyasının var olduğundan emin ol.`);
    return;
  }

  state.quiz = { topic, test, questions: shuffle(questions), current: 0, correct: 0, wrong: 0, answered: false };
  document.getElementById("quizTopicLabel").textContent = topic.name;
  document.getElementById("quizTestLabel").textContent  = test.name;
  showView("quiz");
  renderQuestion();
}

function renderQuestion() {
  const { questions, current } = state.quiz;
  const q = questions[current];
  const total = questions.length;
  const letters = ["A", "B", "C", "D", "E"];

  document.getElementById("progressBar").style.width = `${(current / total) * 100}%`;
  document.getElementById("progressText").textContent = `${current + 1} / ${total}`;
  document.getElementById("questionNumber").textContent = `Soru ${current + 1}`;
  document.getElementById("questionText").textContent = q.question;

  const list = document.getElementById("optionsList");
  list.innerHTML = "";
  q.options.forEach((opt, i) => {
    const li = document.createElement("li");
    li.className = "option-item";
    li.dataset.index = i;
    li.innerHTML = `<div class="option-key">${letters[i]}</div><div class="option-text">${opt}</div>`;
    li.addEventListener("click", () => handleAnswer(i));
    list.appendChild(li);
  });

  const fb = document.getElementById("questionFeedback");
  fb.className = "question-feedback hidden";
  fb.textContent = "";
  document.getElementById("btnNext").classList.add("hidden");
  state.quiz.answered = false;
}

function handleAnswer(idx) {
  if (state.quiz.answered) return;
  state.quiz.answered = true;

  const q = state.quiz.questions[state.quiz.current];
  const correct = q.correct;
  const letters = ["A", "B", "C", "D", "E"];
  const items = document.querySelectorAll(".option-item");
  items.forEach(el => el.classList.add("disabled"));

  const fb = document.getElementById("questionFeedback");

  if (idx === correct) {
    items[idx].classList.add("is-correct");
    fb.className = "question-feedback is-correct";
    fb.textContent = "✓  Doğru!";
    state.quiz.correct++;
  } else {
    items[idx].classList.add("is-wrong");
    items[correct].classList.add("is-correct");
    fb.className = "question-feedback is-wrong";
    fb.textContent = `✗  Yanlış — Doğru cevap: ${letters[correct]}`;
    state.quiz.wrong++;
  }

  document.getElementById("btnNext").classList.remove("hidden");
}

document.getElementById("btnNext").addEventListener("click", () => {
  state.quiz.current++;
  if (state.quiz.current >= state.quiz.questions.length) finishQuiz();
  else renderQuestion();
});

document.getElementById("btnBack").addEventListener("click", () => {
  if (confirm("Testi bırakmak istediğinden emin misin?")) {
    renderTopics(); showView("topics");
  }
});

/* ============================================================
   RESULT
   ============================================================ */
function finishQuiz() {
  const { topic, test, correct, wrong, questions } = state.quiz;
  const total = questions.length;
  const pct   = Math.round((correct / total) * 100);
  const pass  = pct >= 70;

  if (!state.stats[topic.id]) state.stats[topic.id] = {};
  state.stats[topic.id][test.id] = { correct, wrong, total };
  localStorage.setItem("surio_stats", JSON.stringify(state.stats));

  const circle = document.getElementById("resultCircle");
  circle.className = `result-score-circle ${pass ? "pass" : "fail"}`;
  document.getElementById("resultPct").textContent   = `%${pct}`;
  document.getElementById("resultTitle").textContent  = pass ? "Harika iş!" : pct >= 50 ? "İyi bir başlangıç!" : "Daha fazla çalış!";
  document.getElementById("resultSub").textContent    = pass ? "Bu konuyu gayet iyi biliyorsun." : "Yanlışlarını gözden geçirmeyi unutma.";
  document.getElementById("resCorrect").textContent   = correct;
  document.getElementById("resWrong").textContent     = wrong;
  document.getElementById("resTotal").textContent     = total;

  showView("result");
}

document.getElementById("btnRetry").addEventListener("click", () => startQuiz(state.quiz.topic, state.quiz.test));
document.getElementById("btnBackToTopic").addEventListener("click", () => { renderTopics(); showView("topics"); });

/* ============================================================
   STATS
   ============================================================ */
function renderStats() {
  const container = document.getElementById("statsContent");
  const rows = [];

  TOPICS.forEach(topic => {
    const ts = state.stats[topic.id] || {};
    topic.tests.forEach(test => {
      const r = ts[test.id];
      if (!r) return;
      rows.push({ topic, test, r });
    });
  });

  if (!rows.length) {
    container.innerHTML = `<p style="color:var(--text-2);padding:48px 0;text-align:center;">Henüz hiç test çözmedin.</p>`;
    return;
  }

  const table = document.createElement("div");
  table.className = "stats-table";
  table.innerHTML = `
    <div class="stats-table-header">
      <span>Konu / Test</span>
      <span>Doğru</span>
      <span>Yanlış</span>
      <span>Başarı</span>
    </div>
  `;

  rows.forEach(({ topic, test, r }) => {
    const pct = Math.round((r.correct / r.total) * 100);
    const row = document.createElement("div");
    row.className = "stats-row-item";
    row.innerHTML = `
      <div>
        <div class="stats-row-name">${topic.icon} ${topic.name}</div>
        <div class="stats-row-sub">${test.name} · ${r.total} soru</div>
      </div>
      <div class="stats-row-cell green">${r.correct}</div>
      <div class="stats-row-cell red">${r.wrong}</div>
      <div class="stats-row-cell score">%${pct}</div>
    `;
    table.appendChild(row);
  });

  container.innerHTML = "";
  container.appendChild(table);
}

/* ============================================================
   UTILS
   ============================================================ */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── Init ── */
renderHome();
showView("home");
