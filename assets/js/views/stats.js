// views/stats.js — progress table across all subjects

import { getRegistry } from "../data.js";
import { getTest, isRead, summary, reset } from "../store.js";
import { render, errorState, loading, esc } from "../ui.js";

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
      const scoreCls = t ? (t.best >= 70 ? "green" : t.best >= 50 ? "" : "red") : "";
      return `<div class="stats-row">
        <div>
          <div class="stats-row-name">${sub.icon} ${esc(sub.title)}</div>
          <div class="stats-row-sub">${read ? "Ders okundu" : "Ders okunmadı"} · ${attempts} deneme</div>
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
      <div class="hero-stat"><span class="hero-stat-value tnum">${s.solved}</span><span class="hero-stat-label">Çözülen Soru</span><span class="hero-stat-icon">📝</span></div>
      <div class="hero-stat"><span class="hero-stat-value tnum">${s.attempts}</span><span class="hero-stat-label">Toplam Deneme</span><span class="hero-stat-icon">🔁</span></div>
      <div class="hero-stat"><span class="hero-stat-value tnum">${s.avgBest ? "%" + s.avgBest : "—"}</span><span class="hero-stat-label">Ortalama Başarı</span><span class="hero-stat-icon">🎯</span></div>
    </div>

    ${
      hasData
        ? `<div class="stats-table">
            <div class="stats-row head"><span>Konu</span><span>En iyi</span><span>Son</span><span>Deneme</span></div>
            ${rows}
          </div>
          <div style="margin-top:20px;text-align:center">
            <button class="btn btn-ghost" data-reset>İlerlemeyi Sıfırla</button>
          </div>`
        : `<div class="empty">
            <div class="empty-emoji">📊</div>
            <div class="empty-title">Henüz veri yok</div>
            <p>Bir konu çalışıp test çözdüğünde ilerlemen burada görünecek.</p>
          </div>`
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
