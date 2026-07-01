// ui.js — small DOM + formatting helpers

/** Escape text for safe HTML interpolation. */
export function esc(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Build a DOM node from an HTML string. */
export function html(str) {
  const t = document.createElement("template");
  t.innerHTML = str.trim();
  return t.content.firstElementChild;
}

/** Render an HTML string into the #app root. */
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

export function errorState(msg = "İçerik yüklenemedi.") {
  return `<div class="wrap"><div class="empty">
    <div class="empty-emoji">⚠️</div>
    <div class="empty-title">Bir şeyler ters gitti</div>
    <p>${esc(msg)}</p>
  </div></div>`;
}

export const CHECK = `<svg viewBox="0 0 24 24" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>`;
export const CROSS = `<svg viewBox="0 0 24 24" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
export const CHEVRON = `<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>`;
export const ARROW_L = `<svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`;

/** Clamp + round a ratio to a whole percentage. */
export function pct(n, d) {
  if (!d) return 0;
  return Math.round((n / d) * 100);
}
