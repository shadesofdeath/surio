// data.js — loads subject registry + individual subject content, with caching

const REGISTRY_URL = "data/subjects.json";
const subjectUrl = (id) => `data/subjects/${id}.json`;

let registryPromise = null;
const subjectCache = new Map();

/** List of subjects with lightweight meta (id, title, icon, counts…). */
export function getRegistry() {
  if (!registryPromise) {
    registryPromise = fetch(REGISTRY_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`registry ${r.status}`);
        return r.json();
      })
      .catch((err) => {
        registryPromise = null; // allow retry
        throw err;
      });
  }
  return registryPromise;
}

/** Full content (lessons + questions) for one subject. */
export async function getSubject(id) {
  if (subjectCache.has(id)) return subjectCache.get(id);
  const p = fetch(subjectUrl(id))
    .then((r) => {
      if (!r.ok) throw new Error(`subject ${id} ${r.status}`);
      return r.json();
    })
    .catch((err) => {
      subjectCache.delete(id);
      throw err;
    });
  subjectCache.set(id, p);
  return p;
}

/** Look up one registry entry by id. */
export async function getMeta(id) {
  const reg = await getRegistry();
  return reg.find((s) => s.id === id) || null;
}
