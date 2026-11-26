
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
  // In the admin and in its preview (iframe), skip caches: edits must show straight away, and a save
  // built on a cached copy would undo the one before it.
  const fresh = window.AYLIN_ADMIN || window.parent !== window;
  const res = await fetch(fresh ? `${path}${path.includes("?") ? "&" : "?"}t=${Date.now()}` : path, fresh ? { cache: "no-store" } : undefined);
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
  return { ...p, images: p.images || [], sizes: p.sizes || [], sizes_out: p.sizes_out || [], colors: p.colors || [] };
}

async function getProducts() {
  try {
    return (await api("/api/products")).map(norm);
  } catch (e) {
    console.error("products", e);
    return [];
  }
}

// Home banner: the order chosen in /admin, else featured products first. Products added after
// the order was chosen come at the end. hero.hidden lists the ones left out of the banner.
function heroOrder(products, hero) {
  const order = hero.order || [], at = (p) => (order.includes(p.id) ? order.indexOf(p.id) : order.length);
  return [...products].sort((a, b) => b.featured - a.featured).sort((a, b) => at(a) - at(b));
}
const heroList = (products, hero) => heroOrder(products, hero).filter((p) => !(hero.hidden || []).includes(p.id)).slice(0, 8);

async function getProduct(slug) {
  return (await getProducts()).find((p) => p.slug === slug) || null;
}
