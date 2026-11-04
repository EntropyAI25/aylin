
// Reads the shop from the /api routes, which read Cloudflare D1.

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
function merge(base, over) {
  const out = { ...base };
  for (const k of Object.keys(over || {})) {
    out[k] = isObj(base[k]) && isObj(over[k]) ? merge(base[k], over[k]) : over[k];
  }
  return out;
}

async function api(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return res.json();
}

let settingsCache;
async function getSettings() {
  if (settingsCache) return settingsCache;
  try {
    return (settingsCache = merge(DEFAULT_SETTINGS, await api("/api/settings")));
  } catch (e) {
    console.error("settings", e);
    return DEFAULT_SETTINGS; // not cached, so the next page view tries again
  }
}

async function getCategories() {
  try {
    return await api("/api/categories");
  } catch (e) {
    console.error("categories", e);
    return [];
  }
}

function norm(p) {
  return { ...p, images: p.images || [], sizes: p.sizes || [], colors: p.colors || [] };
}

async function getProducts() {
  try {
    return (await api("/api/products")).map(norm);
  } catch (e) {
    console.error("products", e);
    return [];
  }
}

async function getProduct(slug) {
  return (await getProducts()).find((p) => p.slug === slug) || null;
}
