
const live = Boolean(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY);

let clientPromise;
function client() {
  if (!live) return Promise.resolve(null);
  clientPromise ||= import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm").then((m) =>
    m.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)
  );
  return clientPromise;
}

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
function merge(base, over) {
  const out = { ...base };
  for (const k of Object.keys(over || {})) {
    out[k] = isObj(base[k]) && isObj(over[k]) ? merge(base[k], over[k]) : over[k];
  }
  return out;
}

let settingsCache;
async function getSettings() {
  if (settingsCache) return settingsCache;
  let s = DEFAULT_SETTINGS;
  const sb = await client();
  if (sb) {
    const { data, error } = await sb.from("settings").select("key,value");
    if (error) console.error("settings", error);
    else s = merge(DEFAULT_SETTINGS, Object.fromEntries(data.map((r) => [r.key, r.value])));
  }
  return (settingsCache = s);
}

async function getCategories() {
  const sb = await client();
  if (!sb) return SEED_CATEGORIES;
  const { data, error } = await sb.from("categories").select("*").order("sort");
  if (error) { console.error("categories", error); return []; }
  return data;
}

function norm(p) {
  return { ...p, images: p.images || [], sizes: p.sizes || [], colors: p.colors || [] };
}

async function getProducts() {
  const sb = await client();
  if (!sb) return SEED_PRODUCTS.map(norm);
  const { data, error } = await sb.from("products").select("*").eq("active", true).order("sort").order("created_at", { ascending: false });
  if (error) { console.error("products", error); return []; }
  return data.map(norm);
}

async function getProduct(slug) {
  return (await getProducts()).find((p) => p.slug === slug) || null;
}
