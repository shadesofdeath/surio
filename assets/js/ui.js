// ui.js — small DOM + formatting helpers

import { icon } from "./icons.js";

/** Escape text for safe HTML interpolation. */
export function esc(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Render an HTML string into the #app root and scroll to top. */
export function render(str) {
  const app = document.getElementById("app");
  app.innerHTML = str;
  app.scrollTop = 0;
  window.scrollTo(0, 0);
  return app;
}

export function loading() {
  return `<div class="wrap"><div class="loading"><div class="spinner"></div>Yükleniyor…</div></div>`;
}

/** Generic centered empty/placeholder state with an icon. */
export function emptyState(iconName, title, msg = "") {
  return `<div class="empty">
    <span class="empty-ic">${icon(iconName)}</span>
    <div class="empty-title">${esc(title)}</div>
    ${msg ? `<p>${esc(msg)}</p>` : ""}
  </div>`;
}

export function errorState(msg = "İçerik yüklenemedi. Lütfen sayfayı yenile.") {
  return `<div class="wrap">${emptyState("alert", "Bir şeyler ters gitti", msg)}</div>`;
}

/** Clamp + round a ratio to a whole percentage. */
export function pct(n, d) {
  if (!d) return 0;
  return Math.round((n / d) * 100);
}
