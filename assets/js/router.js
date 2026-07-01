// router.js — tiny hash-based router
//
// Routes are registered as patterns like "/ders/:id". The matching handler
// receives an object of named params.

const routes = [];
let notFound = null;

/** Register a route. pattern e.g. "/", "/ders", "/ders/:id". */
export function route(pattern, handler) {
  const keys = [];
  const rx = new RegExp(
    "^" +
      pattern
        .replace(/\/$/, "")
        .replace(/:[^/]+/g, (m) => {
          keys.push(m.slice(1));
          return "([^/]+)";
        }) +
      "/?$"
  );
  routes.push({ rx, keys, handler });
}

export function setNotFound(handler) {
  notFound = handler;
}

export function navigate(path) {
  if (location.hash.slice(1) === path) resolve();
  else location.hash = path;
}

function currentPath() {
  const h = location.hash.slice(1) || "/";
  return h.startsWith("/") ? h : "/" + h;
}

async function resolve() {
  const path = currentPath();
  const [pathname] = path.split("?");
  syncNav(pathname);

  for (const { rx, keys, handler } of routes) {
    const m = pathname.match(rx);
    if (m) {
      const params = {};
      keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
      try {
        await handler(params);
      } catch (err) {
        console.error("route handler failed", err);
      }
      return;
    }
  }
  if (notFound) notFound();
}

/** Highlight active sidebar/tab items by their top-level segment. */
function syncNav(pathname) {
  const seg = pathname.split("/")[1] || "home";
  document.querySelectorAll("[data-match]").forEach((el) => {
    el.classList.toggle("active", el.dataset.match === seg);
  });
}

export function startRouter() {
  window.addEventListener("hashchange", resolve);
  if (!location.hash) location.replace("#/");
  else resolve();
}
