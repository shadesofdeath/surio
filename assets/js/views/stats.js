// views/stats.js — progress table across all subjects

import { getRegistry } from "../data.js";
import { getTest, isRead, summary, reset } from "../store.js";
import { PASS_SCORE, NEAR_SCORE } from "../config.js";
import { icon } from "../icons.js";
import { render, errorState, loading, emptyState, esc } from "../ui.js";

function statCard(iconName, value, label) {
  return `<div class="hero-stat">
    <span class="hero-stat-ic">${icon(iconName)}</span>
    <span class="hero-stat-value tnum">${value}</span>
    <span class="hero-stat-label">${label}</span>
  </div>`;
}

export async function statsView() {
  render(loading());
  let reg;
  try {
    reg = await getRegistry();
  } catch {
    render(errorState());
    return;
  }

  const s = summary();
  const hasData = s.attempts > 0 || s.readCount > 0;

  const rows = reg
    .map((sub) => {
      const t = getTest(sub.id);
      const read = isRead(sub.id);
      const best = t ? `%${t.best}` : "—";
      const last = t ? `%${t.last}` : "—";
      const attempts = t ? t.attempts : 0;
      const scoreCls = t
        ? t.best >= PASS_SCORE ? "green" : t.best >= NEAR_SCORE ? "" : "red"
        : "";
      return `<div class="stats-row">
        <div class="stats-row-main">
          <span class="subject-ic sm" style="--c:${sub.color}">${icon(sub.icon)}</span>
          <div>
            <div class="stats-row-name">${esc(sub.title)}</div>
            <div class="stats-row-sub">${read ? "Ders okundu" : "Ders okunmadı"} · ${attempts} deneme</div>
          </div>
        </div>
        <div class="stats-cell score ${scoreCls}">${best}</div>
        <div class="stats-cell">${last}</div>
        <div class="stats-cell tnum">${attempts}</div>
      </div>`;
    })
    .join("");

  render(`<div class="wrap">
    <div class="page-head">
      <h1 class="page-title">İstatistikler</h1>
      <p class="page-sub">Konu bazında ilerlemeni ve test sonuçlarını buradan takip et.</p>
    </div>

    <div class="hero-strip" style="margin-bottom:28px">
      ${statCard("clipboard-check", s.solved, "Çözülen Soru")}
      ${statCard("repeat", s.attempts, "Toplam Deneme")}
      ${statCard("target", s.avgBest ? "%" + s.avgBest : "—", "Ortalama Başarı")}
    </div>

    ${
      hasData
        ? `<div class="stats-table">
            <div class="stats-row head"><span>Konu</span><span>En iyi</span><span>Son</span><span>Deneme</span></div>
            ${rows}
          </div>
          <div class="stats-foot">
            <button class="btn btn-ghost" data-reset>${icon("refresh")} İlerlemeyi sıfırla</button>
          </div>`
        : `<div class="wrap">${emptyState(
            "chart",
            "Henüz veri yok",
            "Bir konu çalışıp test çözdüğünde ilerlemen burada görünecek."
          )}</div>`
    }
  </div>`);

  const rb = document.querySelector("[data-reset]");
  if (rb) {
    rb.addEventListener("click", () => {
      if (confirm("Tüm ilerlemen silinecek. Emin misin?")) {
        reset();
        statsView();
      }
    });
  }
}
