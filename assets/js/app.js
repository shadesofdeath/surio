// app.js — bootstrap: register routes and start the router

import { route, setNotFound, startRouter } from "./router.js";
import { homeView } from "./views/home.js";
import { studyListView, studyDetailView } from "./views/study.js";
import { testListView } from "./views/tests.js";
import { quizView } from "./views/quiz.js";
import { statsView } from "./views/stats.js";
import { render } from "./ui.js";

route("/", homeView);

route("/ders", studyListView);
route("/ders/:id", studyDetailView);

route("/test", testListView);
route("/test/:id", quizView);

route("/istatistik", statsView);

setNotFound(() => {
  render(`<div class="wrap"><div class="empty">
    <div class="empty-emoji">🧭</div>
    <div class="empty-title">Sayfa bulunamadı</div>
    <p>Aradığın sayfa taşınmış olabilir. <a class="section-link" href="#/" data-link>Ana sayfaya dön</a>.</p>
  </div></div>`);
});

startRouter();
