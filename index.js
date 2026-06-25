/* ============================================================
   SÜRIO — index.js
   Vanilla JS SPA — GitHub Pages uyumlu
   ============================================================ */

// ── Konu tanımları (JSON dosyaları data/topics/ altında)
const TOPICS = [
  {
    id: "trafik-isaret-levhalari",
    name: "Trafik İşaret Levhaları",
    icon: "🚦",
    tests: [
      { id: "test-1", name: "Test 1", file: "data/topics/trafik-isaret-levhalari-t1.json" },
      { id: "test-2", name: "Test 2", file: "data/topics/trafik-isaret-levhalari-t2.json" },
    ],
  },
  {
    id: "trafik-kurallari",
    name: "Trafik Kuralları",
    icon: "📋",
    tests: [
      { id: "test-1", name: "Test 1", file: "data/topics/trafik-kurallari-t1.json" },
    ],
  },
  {
    id: "ilk-yardim",
    name: "İlk Yardım",
    icon: "🏥",
    tests: [
      { id: "test-1", name: "Test 1", file: "data/topics/ilk-yardim-t1.json" },
    ],
  },
  {
    id: "motor-ve-arac-bilgisi",
    name: "Motor ve Araç Bilgisi",
    icon: "🔧",
    tests: [
      { id: "test-1", name: "Test 1", file: "data/topics/motor-ve-arac-bilgisi-t1.json" },
    ],
  },
];

// ── State
const state = {
  currentView: "home",
  quiz: {
    topic: null,
    test: null,
    questions: [],
    current: 0,
    correct: 0,
    wrong: 0,
    answered: false,
  },
  stats: JSON.parse(localStorage.getItem("surio_stats") || "{}"),
  // stats shape: { [topicId]: { [testId]: { correct, wrong, total } } }
};

// ── DOM refs
const views = {
  home:   document.getElementById("view-home"),
  topics: document.getElementById("view-topics"),
  quiz:   document.getElementById("view-quiz"),
  result: document.getElementById("view-result"),
  stats:  document.getElementById("view-stats"),
};

// ============================================================
// NAVIGATION
// ============================================================
function showView(name) {
  Object.values(views).forEach(v => v.classList.add("hidden"));
  views[name].classList.remove("hidden");
  state.currentView = name;

  // Sync nav active states
  document.querySelectorAll(".nav-item, .tab-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === name);
  });
}

// Sidebar & bottom tab navigation
document.querySelectorAll(".nav-item, .tab-item").forEach(btn => {
  btn.addEventListener("click", () => {
    const view = btn.dataset.view;
    if (!view) return;
    if (view === "home") renderHome();
    if (view === "topics") renderTopics();
    if (view === "stats") renderStats();
    showView(view);
  });
});

// ============================================================
// HOME
// ============================================================
function renderHome() {
  // Global stats
  let totalSolved = 0, totalCorrect = 0, topicsDone = 0;
  TOPICS.forEach(topic => {
    const ts = state.stats[topic.id];
    if (!ts) return;
    let topicHasDone = false;
    topic.tests.forEach(test => {
      const r = ts[test.id];
      if (!r) return;
      totalSolved += r.total;
      totalCorrect += r.correct;
      topicHasDone = true;
    });
    if (topicHasDone) topicsDone++;
  });

  document.getElementById("stat-total-solved").textContent = totalSolved;
  document.getElementById("stat-accuracy").textContent =
    totalSolved > 0 ? `%${Math.round((totalCorrect / totalSolved) * 100)}` : "—";
  document.getElementById("stat-topics-done").textContent = topicsDone;

  renderTopicCards(document.getElementById("home-topics"), TOPICS.slice(0, 4));
}

// ============================================================
// TOPICS
// ============================================================
function renderTopics() {
  renderTopicCards(document.getElementById("all-topics"), TOPICS);
}

function renderTopicCards(container, topics) {
  container.innerHTML = "";
  topics.forEach(topic => {
    const card = document.createElement("div");
    card.className = "topic-card";

    // Calculate progress across all tests
    const ts = state.stats[topic.id] || {};
    const doneTests = topic.tests.filter(t => ts[t.id]).length;
    const pct = Math.round((doneTests / topic.tests.length) * 100);

    card.innerHTML = `
      <div class="topic-icon">${topic.icon}</div>
      <div class="topic-name">${topic.name}</div>
      <div class="topic-info">${topic.tests.length} Test · ${doneTests} Tamamlandı</div>
      <div class="topic-progress-wrap">
        <div class="topic-progress-fill" style="width: ${pct}%"></div>
      </div>
    `;

    card.addEventListener("click", () => openTestSelect(topic));
    container.appendChild(card);
  });
}

// ============================================================
// TEST SELECT MODAL
// ============================================================
function openTestSelect(topic) {
  document.getElementById("modalTopicTitle").textContent = topic.name;

  const testList = document.getElementById("testList");
  testList.innerHTML = "";

  const ts = state.stats[topic.id] || {};

  topic.tests.forEach(test => {
    const result = ts[test.id];
    const item = document.createElement("div");
    item.className = "test-item";

    const score = result
      ? `%${Math.round((result.correct / result.total) * 100)}`
      : null;

    item.innerHTML = `
      <div>
        <div class="test-item-name">${test.name}</div>
        <div class="test-item-info">${result ? `${result.total} soru çözüldü` : "Henüz çözülmedi"}</div>
      </div>
      ${score
        ? `<span class="test-item-badge done">%${Math.round((result.correct / result.total) * 100)}</span>`
        : `<span class="test-item-badge">Başla</span>`
      }
    `;

    item.addEventListener("click", () => {
      closeTestSelect();
      startQuiz(topic, test);
    });

    testList.appendChild(item);
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

// ============================================================
// QUIZ
// ============================================================
async function startQuiz(topic, test) {
  // Load questions from JSON
  let questions;
  try {
    const res = await fetch(test.file);
    if (!res.ok) throw new Error("Dosya bulunamadı");
    questions = await res.json();
  } catch (err) {
    alert(`Test yüklenemedi: ${test.file}\n\nDemo için örnek JSON dosyalarını oluşturduğunuzdan emin olun.`);
    return;
  }

  state.quiz = {
    topic,
    test,
    questions: shuffle(questions),
    current: 0,
    correct: 0,
    wrong: 0,
    answered: false,
  };

  document.getElementById("quizTopicLabel").textContent = topic.name;
  document.getElementById("quizTestLabel").textContent = test.name;

  showView("quiz");
  renderQuestion();
}

function renderQuestion() {
  const { questions, current } = state.quiz;
  const q = questions[current];
  const total = questions.length;

  // Progress
  const pct = (current / total) * 100;
  document.getElementById("progressBar").style.width = `${pct}%`;
  document.getElementById("progressText").textContent = `${current + 1} / ${total}`;

  document.getElementById("questionNumber").textContent = `Soru ${current + 1}`;
  document.getElementById("questionText").textContent = q.question;

  const optionsList = document.getElementById("optionsList");
  optionsList.innerHTML = "";
  const letters = ["A", "B", "C", "D", "E"];

  q.options.forEach((opt, i) => {
    const li = document.createElement("li");
    li.className = "option-item";
    li.dataset.index = i;
    li.innerHTML = `
      <div class="option-letter">${letters[i]}</div>
      <div class="option-text">${opt}</div>
    `;
    li.addEventListener("click", () => handleAnswer(i));
    optionsList.appendChild(li);
  });

  // Reset feedback & next button
  const feedback = document.getElementById("questionFeedback");
  feedback.className = "question-feedback hidden";
  feedback.textContent = "";
  document.getElementById("btnNext").classList.add("hidden");

  state.quiz.answered = false;
}

function handleAnswer(selectedIndex) {
  if (state.quiz.answered) return;
  state.quiz.answered = true;

  const q = state.quiz.questions[state.quiz.current];
  const correct = q.correct; // 0-based index
  const options = document.querySelectorAll(".option-item");
  const feedback = document.getElementById("questionFeedback");

  options.forEach(opt => opt.classList.add("disabled"));

  if (selectedIndex === correct) {
    options[selectedIndex].classList.add("correct");
    feedback.className = "question-feedback correct-msg";
    feedback.textContent = "✓ Doğru!";
    state.quiz.correct++;
  } else {
    options[selectedIndex].classList.add("selected-wrong");
    options[correct].classList.add("correct");
    feedback.className = "question-feedback wrong-msg";
    feedback.textContent = `✗ Yanlış. Doğru cevap: ${["A","B","C","D","E"][correct]}`;
    state.quiz.wrong++;
  }

  feedback.classList.remove("hidden");
  document.getElementById("btnNext").classList.remove("hidden");
}

document.getElementById("btnNext").addEventListener("click", () => {
  state.quiz.current++;
  if (state.quiz.current >= state.quiz.questions.length) {
    finishQuiz();
  } else {
    renderQuestion();
  }
});

document.getElementById("btnBack").addEventListener("click", () => {
  if (confirm("Testi bırakmak istediğinden emin misin?")) {
    showView("topics");
    renderTopics();
  }
});

// ============================================================
// RESULT
// ============================================================
function finishQuiz() {
  const { topic, test, correct, wrong, questions } = state.quiz;
  const total = questions.length;
  const score = Math.round((correct / total) * 100);

  // Save to localStorage
  if (!state.stats[topic.id]) state.stats[topic.id] = {};
  state.stats[topic.id][test.id] = { correct, wrong, total };
  localStorage.setItem("surio_stats", JSON.stringify(state.stats));

  // Result UI
  document.getElementById("resCorrect").textContent = correct;
  document.getElementById("resWrong").textContent = wrong;
  document.getElementById("resScore").textContent = `%${score}`;

  const icon = score >= 70 ? "🎉" : score >= 50 ? "😅" : "😔";
  const title = score >= 70 ? "Harika iş!" : score >= 50 ? "İyi bir başlangıç!" : "Daha fazla çalış!";
  const sub = score >= 70
    ? "Bu konuyu gayet iyi biliyorsun."
    : "Yanlışlarını gözden geçirmeyi unutma.";

  document.getElementById("resultIcon").textContent = icon;
  document.getElementById("resultTitle").textContent = title;
  document.getElementById("resultSub").textContent = sub;

  showView("result");
}

document.getElementById("btnRetry").addEventListener("click", () => {
  startQuiz(state.quiz.topic, state.quiz.test);
});

document.getElementById("btnBackToTopic").addEventListener("click", () => {
  renderTopics();
  showView("topics");
});

// ============================================================
// STATS VIEW
// ============================================================
function renderStats() {
  const container = document.getElementById("statsDetail");
  container.innerHTML = "";

  let hasAny = false;

  TOPICS.forEach(topic => {
    const ts = state.stats[topic.id];
    if (!ts) return;

    topic.tests.forEach(test => {
      const r = ts[test.id];
      if (!r) return;
      hasAny = true;

      const score = Math.round((r.correct / r.total) * 100);
      const el = document.createElement("div");
      el.className = "stat-row-item";
      el.innerHTML = `
        <div>
          <div class="stat-row-name">${topic.name} — ${test.name}</div>
        </div>
        <div class="stat-row-vals">
          <span class="stat-row-val">✓ ${r.correct} &nbsp; ✗ ${r.wrong}</span>
          <span class="stat-row-score">%${score}</span>
        </div>
      `;
      container.appendChild(el);
    });
  });

  if (!hasAny) {
    container.innerHTML = `<p style="color:var(--text-2);text-align:center;padding:40px 0;">Henüz hiç test çözmedin.</p>`;
  }
}

// ============================================================
// UTILS
// ============================================================
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============================================================
// INIT
// ============================================================
renderHome();
showView("home");
