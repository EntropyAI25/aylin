
const $ = (s, r = document) => r.querySelector(s);
const root = $("#root");
const esc = (v = "") => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function toast(msg, err) {
  const t = $("#toast"); t.textContent = msg; t.className = "toast show" + (err ? " err" : "");
  clearTimeout(toast.t); toast.t = setTimeout(() => (t.className = "toast"), 2800);
}

/* What can be edited under each tab. Add a field here and it appears in the admin. */
const SECTIONS = {
  hero: { label: "Homepage banner", fields: [
    ["eyebrow", "Small heading", "text"], ["title", "Headline", "text"], ["subtitle", "Sub-text", "textarea"],
    ["image", "Background image (optional)", "image"], ["ctaText", "Button text", "text"], ["ctaLink", "Button link", "text"]] },
  announcement: { label: "Announcement bar", fields: [["enabled", "Show the bar", "toggle"], ["text", "Text", "text"]] },
  values: { label: "Homepage highlights", fields: [0, 1, 2].flatMap((i) => [
    [`items.${i}.title`, `Highlight ${i + 1} title`, "text"], [`items.${i}.text`, `Highlight ${i + 1} text`, "textarea"]]) },
  journey: { label: "Homepage timeline", fields: [0, 1, 2, 3].flatMap((i) => [
    [`items.${i}.mark`, `Step ${i + 1} big word (e.g. 120+)`, "text"], [`items.${i}.title`, `Step ${i + 1} title`, "text"], [`items.${i}.text`, `Step ${i + 1} text`, "textarea"]]) },
  story: { label: "Homepage story", fields: [["title", "Title", "text"], ["text", "Text", "textarea"], ["image", "Image", "image"]] },
  about: { label: "About page", fields: [["title", "Title", "text"], ["body", "Body (blank line = new paragraph)", "textarea"], ["image", "Image", "image"]] },
  whatsapp: { label: "WhatsApp", fields: [
    ["number", "WhatsApp number (with country code)", "text"],
    ["template", "Order message. Use {product} {size} {colour} {price} {link}", "textarea"],
    ["generalMessage", "General chat message", "text"]] },
  contact: { label: "Contact details", fields: [["phone", "Phone", "text"], ["email", "Email", "text"], ["address", "Address", "text"], ["hours", "Hours", "text"]] },
  social: { label: "Social", fields: [["instagram", "Instagram URL", "text"]] },
  policies: { label: "Policies", fields: [["shipping", "Shipping", "textarea"], ["returns", "Returns & exchanges", "textarea"], ["sizeGuide", "Size guide", "textarea"]] },
  site: { label: "Appearance & brand", fields: [
    ["theme", "Website theme", "select:auto=Auto (phone dark = Midnight, light = Luxe),luxe=Soft luxe (ivory, blush),midnight=Midnight (black, silver)"],
    ["name", "Brand name", "text"], ["tagline", "Tagline", "text"], ["logo", "Logo", "image"], ["currency", "Currency symbol", "text"],
    ["shippingNote", "Note under the price (e.g. plus shipping). Leave blank to hide", "text"]] },
  footer: { label: "Footer", fields: [["text", "Footer text", "text"]] },
};

const get = (o, p) => p.split(".").reduce((a, k) => a?.[k], o);
function set(o, p, v) { const ks = p.split("."); const l = ks.pop(); ks.reduce((a, k) => (a[k] ??= {}), o)[l] = v; }

let cats = [], products = [], settings, tab = "visual", editing = null;

/* ---------- API ---------- */
// Calls the /api routes and returns { data, error }, so every caller checks errors the same way.
async function rpc(method, path, body) {
  const form = body instanceof FormData;
  try {
    const res = await fetch(path, {
      method,
      headers: body === undefined || form ? {} : { "content-type": "application/json" },
      body: body === undefined ? undefined : form ? body : JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { data: null, error: { message: data?.error || `Request failed (${res.status})`, status: res.status } };
    return { data, error: null };
  } catch (e) {
    return { data: null, error: { message: e.message } };
  }
}

/* ---------- Sign in ---------- */
function loginView() {
  root.innerHTML = `<div class="login"><form class="box" id="f"><h1>AYLIN Admin</h1>
    <label>Password<input type="password" name="password" required autofocus autocomplete="current-password"></label>
    <button class="btn">Enter</button></form></div>`;
  $("#f").onsubmit = async (e) => {
    e.preventDefault();
    const { error } = await rpc("POST", "/api/admin/login", { password: new FormData(e.target).get("password") });
    error ? toast(error.message, true) : loadAll();
  };
}

/* ---------- Load ---------- */
async function loadAll() {
  const [c, p, s] = await Promise.all([rpc("GET", "/api/categories"), rpc("GET", "/api/admin/products"), getSettings()]);
  if (p.error?.status === 401) return loginView();
  if (p.error) {
    root.innerHTML = `<div class="login"><div class="box"><h1>AYLIN Admin</h1><div class="note">${esc(p.error.message)}</div></div></div>`;
    return;
  }
  cats = c.data || []; products = p.data || []; settings = s;
  shell();
}

/* ---------- Shell ---------- */
function shell() {
  if (tab === "visual") return visual();
  const items = [["visual", "✎ Edit the website"], ["products", "Products"], ["categories", "Categories"], ...Object.entries(SECTIONS).map(([k, v]) => [k, v.label])];
  root.innerHTML = `<div class="shell"><aside><h2>AYLIN</h2>
    ${items.map(([k, l]) => `<button data-t="${k}" class="${k === tab ? "on" : ""}">${l}</button>`).join("")}
    <div class="spacer"></div><button id="view">View website ↗</button><button id="out">Sign out</button></aside>
    <main id="main"></main></div>`;
  root.querySelector("aside").onclick = (e) => { const t = e.target.dataset.t; if (t && leavePhotos()) { tab = t; editing = null; shell(); } };
  $("#view").onclick = () => window.open("/", "_blank");
  $("#out").onclick = async () => { if (!leavePhotos()) return; await rpc("POST", "/api/admin/logout"); loginView(); };
  const m = $("#main");
  if (tab === "products") editing ? productForm(m) : productList(m);
  else if (tab === "categories") categoryView(m);
  else sectionForm(m, tab);
}

/* ---------- Generic settings sections ---------- */
function fieldHTML([path, label, type], value) {
  const id = `f_${path.replace(/\./g, "_")}`;
  if (type === "textarea") return `<label>${esc(label)}<textarea id="${id}" data-p="${path}">${esc(value)}</textarea></label>`;
  if (type === "toggle") return `<label class="check"><input type="checkbox" id="${id}" data-p="${path}" ${value ? "checked" : ""}> ${esc(label)}</label>`;
  if (type === "image") return `<label>${esc(label)}<div class="imgs">${value ? `<img src="${esc(value)}" alt="">` : ""}</div>
      <input type="text" id="${id}" data-p="${path}" value="${esc(value)}" placeholder="Image URL or upload below">
      <input type="file" accept="image/*" data-up="${id}"></label>`;
  if (type.startsWith("select:")) return `<label>${esc(label)}<select id="${id}" data-p="${path}">${type.slice(7).split(",").map((o) => { const [v, l] = o.split("="); return `<option value="${v}" ${v === value ? "selected" : ""}>${esc(l)}</option>`; }).join("")}</select></label>`;
  return `<label>${esc(label)}<input type="text" id="${id}" data-p="${path}" value="${esc(value)}"></label>`;
}

function wireUploads(scope) {
  scope.querySelectorAll("input[data-up]").forEach((inp) => {
    inp.onchange = async () => {
      if (!inp.files[0]) return;
      try { const url = await upload(inp.files[0]); const t = $("#" + inp.dataset.up); t.value = url; t.dispatchEvent(new Event("input", { bubbles: true })); toast("Uploaded. Don't forget to save."); }
      catch (e) { toast(e.message, true); }
    };
  });
}

async function upload(file) {
  const form = new FormData();
  form.append("file", file);
  const { data, error } = await rpc("POST", "/api/admin/upload", form);
  if (error) throw new Error(error.message);
  return data.url;
}

function sectionForm(m, key, { only, onInput, onSaved } = {}) {
  const sec = SECTIONS[key];
  const cur = settings[key] || DEFAULT_SETTINGS[key];
  const fields = only ? sec.fields.filter(([p]) => only.split(",").some((o) => p.startsWith(o))) : sec.fields;
  const draft = () => {
    const val = JSON.parse(JSON.stringify(cur));
    m.querySelectorAll("[data-p]").forEach((el) => set(val, el.dataset.p, el.type === "checkbox" ? el.checked : el.value));
    return val;
  };
  m.innerHTML = `<div class="bar"><h1>${esc(sec.label)}</h1><button class="btn" id="save">Save changes</button></div>
    <div class="card">${fields.map((f) => fieldHTML(f, get(cur, f[0]))).join("")}</div>`;
  wireUploads(m);
  m.oninput = onInput ? () => onInput(draft()) : null;
  $("#save").onclick = async () => {
    const val = draft();
    const { error } = await rpc("PUT", `/api/admin/settings/${key}`, { value: val });
    if (error) return toast(error.message, true);
    settings[key] = val; toast("Saved. Live on the website.");
    onSaved?.(val);
  };
}

/* ---------- Categories ---------- */
function categoryView(m) {
  m.innerHTML = `<div class="bar"><h1>Categories</h1><button class="btn" id="add">+ Add category</button></div>
    <table><tr><th>Name</th><th>Image</th><th>Order</th><th></th></tr>
    ${cats.map((c) => `<tr data-id="${c.id}"><td><input type="text" data-k="name" value="${esc(c.name)}"></td>
      <td><input type="text" data-k="image" value="${esc(c.image)}" placeholder="URL"><input type="file" accept="image/*" data-k="file"></td>
      <td style="width:90px"><input type="number" data-k="sort" value="${c.sort ?? 0}"></td>
      <td style="width:150px"><button class="btn sm" data-a="save">Save</button> <button class="btn sm danger" data-a="del">Delete</button></td></tr>`).join("")}</table>
    ${cats.length ? "" : `<p class="muted" style="margin-top:12px">No categories yet. Add one to start organising products.</p>`}`;
  $("#add").onclick = async () => {
    const name = prompt("Category name?"); if (!name) return;
    const { error } = await rpc("POST", "/api/admin/categories", { name, sort: cats.length + 1 });
    if (error) return toast(error.message, true);
    await reloadCats(); shell();
  };
  m.querySelectorAll("tr[data-id]").forEach((tr) => {
    tr.querySelector("[data-k=file]").onchange = async (e) => {
      try { tr.querySelector("[data-k=image]").value = await upload(e.target.files[0]); toast("Uploaded. Press Save."); } catch (x) { toast(x.message, true); }
    };
    tr.onclick = async (e) => {
      const a = e.target.dataset.a; if (!a) return;
      if (a === "del") {
        if (!confirm("Delete this category? Its products stay but become uncategorised.")) return;
        const { error } = await rpc("DELETE", `/api/admin/categories/${tr.dataset.id}`);
        return error ? toast(error.message, true) : (await reloadCats(), shell());
      }
      const name = tr.querySelector("[data-k=name]").value.trim();
      const { error } = await rpc("PUT", `/api/admin/categories/${tr.dataset.id}`, {
        name, image: tr.querySelector("[data-k=image]").value, sort: +tr.querySelector("[data-k=sort]").value || 0,
      });
      error ? toast(error.message, true) : (toast("Saved."), reloadCats());
    };
  });
}
async function reloadCats() { cats = (await rpc("GET", "/api/categories")).data || []; }

/* ---------- Products ---------- */
const newProduct = () => ({ _new: true, name: "", price: 0, images: [], sizes: ["S", "M", "L"], colors: [], in_stock: true, featured: false, active: true, description: "", details: "", category_id: cats[0]?.id || null });

function productList(m) {
  const coverHTML = (p) => { const u = p.images?.[0] || p.colors?.find((c) => c.images?.length)?.images[0]; return u ? thumbHTML(u, toneOf(p)) : ""; };
  const money = (n) => `${settings.site.currency}${Number(n).toLocaleString("en-IN")}`;
  m.innerHTML = `<div class="bar"><h1>Products</h1><button class="btn" id="add">+ Add product</button></div>
    ${products.length ? `<table><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Status</th><th></th></tr>
    ${products.map((p) => `<tr><td>${coverHTML(p)}</td>
      <td>${esc(p.name)}</td><td>${esc(cats.find((c) => c.id === p.category_id)?.name || "-")}</td>
      <td>${p.sale_price ? `<s>${money(p.price)}</s> ${money(p.sale_price)}` : money(p.price)}</td>
      <td>${p.active ? "" : `<span class="tag no">Hidden</span> `}${p.in_stock ? `<span class="tag ok">In stock</span>` : `<span class="tag no">Sold out</span>`}${p.featured ? ` <span class="tag">Featured</span>` : ""}</td>
      <td><button class="btn sm ghost" data-id="${p.id}">Edit</button></td></tr>`).join("")}</table>`
      : `<div class="note">No products yet. Click <b>Add product</b> to create your first one.</div>`}`;
  $("#add").onclick = () => { editing = newProduct(); shell(); };
  m.onclick = (e) => { const id = e.target.dataset.id; if (id) { editing = structuredClone(products.find((p) => p.id === id)); shell(); } };
}

/* ---------- Product photos: background removal, Edited or Original ---------- */
// Picked photos wait in product._jobs until the owner taps "Add". Each job remembers the exact
// image list it belongs to, so redraws, reordering or opening another product cannot misplace it.
const SHOTS = ["Front (cover)", "Close-up", "Side", "Back"];
let jobSeq = 0, cutQueue = Promise.resolve();

const mediaName = (u) => u.split("#")[0].replace(/^\/media\//, "");
const cutRef = (cut, tone, og) => `/media/${mediaName(cut)}#cut=${tone}&og=${mediaName(og)}`;
const altRef = (og, cut) => `/media/${mediaName(og)}#alt=${mediaName(cut)}`;
const imageLists = (p) => [p.images || [], ...(p.colors || []).map((c) => c.images || [])];
// Chosen colour, else what the website will use: the cover's studio artwork, else the first cut photo's,
// else a photo still waiting to be added, else whatever this kaftan had before.
function toneOf(p) {
  const urls = imageLists(p).flat(), saved = products.find((x) => x.id === p.id);
  const artName = (list) => { const t = list.map((u) => ART[u]?.tone).find(Boolean); return Object.keys(TONES).find((k) => TONES[k] === t); };
  const t = p._tone || artName(urls.slice(0, 1)) || urls.map((u) => u.match(/#cut=([^&]+)/)?.[1]).find(Boolean)
    || p._jobs?.find((j) => j.tone)?.tone || artName([...urls, ...(saved ? imageLists(saved).flat() : [])]);
  return Object.hasOwn(TONES, t) ? t : Object.keys(TONES)[0];
}
// The background that suits an edited photo, judged by its strongest colour: red behind red, blue behind blue.
// Plain white, grey or black clothes get the neutral one.
async function suggestTone(file) {
  const img = await createImageBitmap(file), c = Object.assign(document.createElement("canvas"), { width: 80, height: 80 });
  const g = c.getContext("2d", { willReadFrequently: true });
  g.drawImage(img, 0, 0, 80, 80); img.close();
  const d = g.getImageData(0, 0, 80, 80).data, n = { ruby: 0, rose: 0, yellow: 0, sky: 0, indigo: 0 };
  let solid = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 200) continue;
    solid++;
    const r = d[i], gr = d[i + 1], b = d[i + 2], max = Math.max(r, gr, b), range = max - Math.min(r, gr, b);
    const sat = max ? range / max : 0, light = max / 255;
    if (sat < 0.25 || light < 0.12) continue;
    const hue = (60 * (max === r ? (gr - b) / range : max === gr ? (b - r) / range + 2 : (r - gr) / range + 4) + 360) % 360;
    if (hue >= 190 && hue < 290) n[light < 0.45 || hue >= 255 ? "indigo" : "sky"]++;
    else if (hue >= 42 && hue < 70 && sat > 0.4) n.yellow++;
    else if (hue >= 290 || hue < 18) n[sat > 0.65 && (hue >= 340 || hue < 18) ? "ruby" : "rose"]++; // 18-42 is the wooden hanger
  }
  const [tone, count] = Object.entries(n).sort((a, b) => b[1] - a[1])[0];
  return count > solid * 0.05 ? tone : "ash";
}
function setTone(p, tone) {
  p._tone = tone;
  imageLists(p).forEach((list) => list.forEach((u, i) => (list[i] = u.replace(/#cut=[^&]*/, `#cut=${tone}`))));
}
// Switches an added photo between its edited and original versions.
function setVersion(url, edited, tone) {
  const q = new URLSearchParams(url.split("#")[1]);
  if (edited && q.has("alt")) return cutRef(q.get("alt"), tone, url);
  if (!edited && q.has("og")) return altRef(q.get("og"), url);
  return url;
}

function pickPhotos(p, list, files) {
  for (const file of files) {
    const job = { id: ++jobSeq, file, list, src: URL.createObjectURL(file) };
    (p._jobs ||= []).push(job);
    // A picture the browser cannot show would be broken on the website too, so it is not kept.
    Object.assign(new Image(), { src: job.src, onerror: () => {
      if (job.state === "gone") return;
      dropJobs(p, (j) => j === job); p._paint();
      toast(`${file.name} could not be opened. Please use a JPG, PNG or WebP picture.`, true);
    } });
    queueCut(p, job);
  }
  p._paint();
}
function queueCut(p, job) {
  Object.assign(job, { state: "wait", choice: "og", text: "Waiting for its turn…", error: "", failed: false });
  job.stopped = new Promise((r) => (job.stop = r));
  cutQueue = cutQueue.then(() => removeBackground(p, job)); // one at a time, so phones can cope
}
// A skipped photo may still be running inside the editor, so its progress is shown on the photo now waiting.
let showProgress = () => {};
async function removeBackground(p, job) {
  if (job.state !== "wait") return;
  job.state = "work"; job.text = "Removing the background…"; p._paint();
  showProgress = (text) => {
    if (job.state !== "work") return;
    job.text = text;
    const el = document.querySelector(`[data-prog="${job.id}"]`); if (el) el.textContent = text;
  };
  try {
    if (!window.Cutout) throw new Error("The photo editor did not load. Refresh the page to try again.");
    // Cutout gives up by itself if it stops making progress, however long a slow download takes.
    const cut = await Promise.race([Cutout.remove(job.file, (text) => showProgress(text)), job.stopped]);
    if (job.state !== "work") return;
    const tone = await suggestTone(cut).catch(() => undefined);
    if (job.state !== "work") return;
    job.tone = tone; job.cut = cut; job.cutSrc = URL.createObjectURL(cut); job.choice = "cut";
  } catch (e) {
    if (job.state !== "work") return;
    job.error = e.message; job.failed = true;
  }
  job.state = "ready"; p._paint();
}
function useOriginal(job) {
  if (job.state !== "wait" && job.state !== "work") return;
  job.state = "ready"; job.choice = "og"; job.stop();
}
function dropJobs(p, which) {
  p._jobs = (p._jobs || []).filter((job) => {
    if (!which(job)) return true;
    job.state = "gone"; job.stop();
    URL.revokeObjectURL(job.src); if (job.cutSrc) URL.revokeObjectURL(job.cutSrc);
    return false;
  });
}
// Uploads both versions of every photo waiting for one list, in the order they were picked.
async function addPhotos(p, list) {
  const jobs = (p._jobs || []).filter((j) => j.list === list);
  if (jobs.some((j) => j.state !== "ready")) return;
  jobs.forEach((j) => { j.state = "up"; j.error = ""; });
  p._paint();
  const failed = [];
  let added = 0;
  for (const job of jobs) {
    if (job.state !== "up") continue; // removed meanwhile
    try {
      job.ogUrl ||= await upload(window.Cutout ? await Cutout.fit(job.file) : job.file);
      if (job.cut && job.state === "up") {
        try { job.cutUrl ||= await upload(job.cut); } catch (e) { if (job.choice === "cut") throw e; }
      }
      if (job.state !== "up") continue;
      const url = !job.cutUrl ? job.ogUrl : job.choice === "cut" ? cutRef(job.cutUrl, p._tone || job.tone || toneOf(p), job.ogUrl) : altRef(job.ogUrl, job.cutUrl);
      const at = list.indexOf(job.before); // a retried photo goes back in front of the ones picked after it
      at < 0 ? list.push(url) : list.splice(at, 0, url);
      failed.forEach((f) => (f.before ||= url));
      dropJobs(p, (j) => j === job); added++;
    } catch (e) {
      if (job.state !== "up") continue;
      job.state = "ready"; job.error = `Upload failed. ${e.message} Tap Add to try again.`; failed.push(job);
    }
    p._paint();
  }
  p._paint();
  if (failed.length) toast(failed[0].error, true);
  else if (added) toast("Photos added. Tap Save product to publish.");
}
// Asks before throwing away photos that were picked but not added yet.
function leavePhotos(ask = true) {
  if (!editing?._jobs?.length) return true;
  if (ask && !confirm("Some photos are not added yet. Leave without them?")) return false;
  dropJobs(editing, () => true);
  return true;
}
window.addEventListener("beforeunload", (e) => { if (editing?._jobs?.length) e.preventDefault(); });

// Previews use the light or the dark shade, whichever the website shows on this device.
function toneStyle(tone) {
  const theme = settings.site.theme, dark = theme === "midnight" || (theme !== "luxe" && matchMedia("(prefers-color-scheme: dark)").matches);
  return `style="background:${TONES[tone][dark ? "td" : "tl"]}"`;
}
const thumbHTML = (u, tone) => `<img src="${esc(u)}" alt="" ${u.includes("#cut=") ? `class="cut" ${toneStyle(tone)}` : ""}>`;

// The added photos of one list, followed by the ones still waiting. key is "p" or a colour number.
function photosHTML(p, list, key) {
  const tone = toneOf(p), act = key === "p" ? "data-m" : "data-cm", pre = key === "p" ? "" : `${key}:`;
  const saved = list.map((u, i) => {
    const edited = u.includes("#cut=");
    return `<figure>${thumbHTML(u, tone)}<figcaption>${i + 1}${SHOTS[i] ? ` · ${SHOTS[i]}` : ""}</figcaption>
      ${edited || u.includes("#alt=") ? `<div class="ver"><button data-v="${key}:${i}:cut" class="${edited ? "on" : ""}" aria-pressed="${edited}">Edited</button><button data-v="${key}:${i}:og" class="${edited ? "" : "on"}" aria-pressed="${!edited}">Original</button></div>` : ""}
      <div class="acts"><button ${act}="${pre}${i}:-1" aria-label="Move earlier">←</button><button ${act}="${pre}${i}:x" aria-label="Remove">✕</button><button ${act}="${pre}${i}:1" aria-label="Move later">→</button></div></figure>`;
  }).join("");
  const jobs = (p._jobs || []).filter((j) => j.list === list);
  const busy = jobs.filter((j) => j.state === "wait" || j.state === "work").length;
  const uploading = jobs.some((j) => j.state === "up");
  const pick = (j, v, label, inner) => `<button class="choice ${j.choice === v ? "on" : ""}" data-pick="${j.id}:${v}" aria-pressed="${j.choice === v}" ${(v === "cut" && !j.cut) || j.state !== "ready" ? "disabled" : ""}>${inner}<b>${label}</b></button>`;
  const pending = jobs.map((j, i) => {
    const n = list.length + i, working = j.state === "wait" || j.state === "work";
    const edited = j.cut ? `<img src="${j.cutSrc}" alt="" class="cut" ${toneStyle(p._tone || j.tone || tone)}>`
      : working ? `<span class="wait-box"><i class="spin"></i><span data-prog="${j.id}">${esc(j.text)}</span></span>`
      : `<span class="wait-box">Not edited</span>`;
    return `<div class="job"><div class="jobhead"><span>Photo ${n + 1}${SHOTS[n] ? ` · ${SHOTS[n]}` : ""}</span><button class="btn sm danger" data-drop="${j.id}">✕ Remove</button></div>
      <div class="choices">${pick(j, "cut", "Edited", edited)}${pick(j, "og", "Original", `<img src="${j.src}" alt="">`)}</div>
      ${j.error ? `<p class="err">${esc(j.error)}</p>` : ""}
      ${working ? `<button class="btn sm ghost" data-skip="${j.id}">Use original</button>` : ""}
      ${j.failed && j.state === "ready" ? `<button class="btn sm ghost" data-retry="${j.id}">Try editing again</button>` : ""}
      ${j.state === "up" ? `<p class="muted">Uploading…</p>` : ""}</div>`;
  }).join("");
  const count = jobs.length > 1 ? `${jobs.length} photos` : "photo";
  return `${saved ? `<div class="imgs">${saved}</div>` : ""}${jobs.length ? `<div class="jobs">${pending}</div>
    <p class="muted">${busy ? "Please wait, or use the original." : "Choose Edited or Original, then tap Add."}</p>
    <div class="jobbar"><button class="btn" data-add="${key}" ${busy || uploading ? "disabled" : ""}>${uploading ? "Uploading…" : busy ? "Preparing…" : `Add ${count}`}</button>
    ${busy > 1 ? `<button class="btn ghost" data-skipall="${key}">Use all originals</button>` : ""}</div>` : ""}`;
}
function tonesHTML(p) {
  if (!imageLists(p).flat().some((u) => u.includes("#cut=")) && !p._jobs?.some((j) => j.cut)) return "";
  const cur = toneOf(p);
  return `<span class="muted">Background colour for edited photos</span><div class="tones">${Object.entries(TONES).map(([id, t]) => `<button data-tone="${id}" class="${id === cur ? "on" : ""}" aria-pressed="${id === cur}"><i style="background:${t.tl}"></i>${esc(t.label)}</button>`).join("")}</div>`;
}

function productForm(m, onDone = shell) {
  const p = editing;
  const draw = () => {
    m.innerHTML = `<div class="bar"><h1>${p._new ? "New product" : "Edit product"}</h1>
      <div><button class="btn ghost" id="back">← Back</button> <button class="btn" id="save">Save product</button></div></div>
      <div class="card">
        <label>Name<input type="text" id="name" value="${esc(p.name)}"></label>
        <div class="row2">
          <label>Category<select id="cat"><option value="">None</option>${cats.map((c) => `<option value="${c.id}" ${c.id === p.category_id ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></label>
          <label>Display order (lower first)<input type="number" id="sort" value="${p.sort ?? 0}"></label>
        </div>
        <div class="row2">
          <label>Price<input type="number" id="price" value="${p.price}" min="0"></label>
          <label>Sale price (optional)<input type="number" id="sale" value="${p.sale_price ?? ""}" min="0"></label>
        </div>
        <div class="muted" id="off"></div>
        <label>Sale message (optional), e.g. Product launch discount<input type="text" id="slabel" value="${esc(p.sale_label || "")}"></label>
        <label>Description<textarea id="desc">${esc(p.description)}</textarea></label>
        <label>Details (one per line)<textarea id="details">${esc(p.details)}</textarea></label>
      </div>
      <div class="card"><b>Photos</b><p class="muted">Add photos in this order: 1 Front (cover), 2 Embroidery close-up, 3 Side, 4 Back. Use ← → to reorder.<br>The background is removed for you, and you choose Edited or Original.</p>
        <div id="tones"></div>
        <div class="photos" data-area="p"></div>
        <input type="file" id="files" accept="image/*" multiple></div>
      <div class="card"><div><b>Sizes</b><p class="muted">Add sizes one by one and mark each as in stock or out of stock. Out of stock sizes show crossed out on the website.</p><div id="szs" style="margin-top:8px">${p.sizes.map((s, i) => `<div class="colorrow"><input type="text" data-sn="${i}" value="${esc(s)}" placeholder="Size, e.g. M"><select data-ss="${i}"><option value="in">In stock</option><option value="out" ${(p.sizes_out || []).includes(s) ? "selected" : ""}>Out of stock</option></select><button class="btn sm danger" data-sd="${i}">✕</button></div>`).join("")}</div>
          <button class="btn sm ghost" id="addsize">+ Add size</button></div>
        <div><b>Colours</b><p class="muted">Add photos to a colour and the product page switches to them when that colour is chosen.</p><div id="cols" style="margin-top:8px">${p.colors.map((c, i) => `<div style="margin-bottom:14px"><div class="colorrow"><input type="color" data-ch="${i}" value="${esc(c.hex)}"><input type="text" data-cn="${i}" value="${esc(c.name)}" placeholder="Colour name"><button class="btn sm danger" data-cd="${i}">✕</button></div>
          <div class="photos" data-area="${i}"></div>
          <input type="file" data-cf="${i}" accept="image/*" multiple></div>`).join("")}</div>
          <button class="btn sm ghost" id="addcol">+ Add colour</button></div></div>
      <div class="card">
        <label class="check"><input type="checkbox" id="stock" ${p.in_stock ? "checked" : ""}> In stock</label>
        <label class="check"><input type="checkbox" id="feat" ${p.featured ? "checked" : ""}> Featured on homepage</label>
        <label class="check"><input type="checkbox" id="active" ${p.active ? "checked" : ""}> Visible on website</label>
        ${p._new ? "" : `<button class="btn danger" id="del" style="justify-self:start">Delete product</button>`}
      </div>`;
    wire();
    const shown = m.firstElementChild; // no longer on screen once something else replaces this form
    p._paint = () => {
      if (!shown.isConnected) return;
      m.querySelectorAll("[data-area]").forEach((el) => (el.innerHTML = photosHTML(p, listFor(el.dataset.area), el.dataset.area)));
      $("#tones").innerHTML = tonesHTML(p);
      $("#save").classList.toggle("wait", Boolean(p._jobs?.length));
    };
    p._paint();
    const off = () => { const a = +$("#price").value, b = +$("#sale").value; $("#off").textContent = b && a && b < a ? `Shown on the website as ${Math.round((1 - b / a) * 100)}% off` : ""; };
    $("#price").oninput = $("#sale").oninput = off; off();
  };
  const collect = () => {
    p.name = $("#name").value.trim(); p.category_id = $("#cat").value || null; p.sort = +$("#sort").value || 0;
    p.price = +$("#price").value || 0; p.sale_price = $("#sale").value === "" ? null : +$("#sale").value;
    p.sale_label = $("#slabel").value.trim();
    p.description = $("#desc").value; p.details = $("#details").value;
    const rows = [...document.querySelectorAll("[data-sn]")].map((el, i) => ({ n: el.value.trim(), out: document.querySelector(`[data-ss="${i}"]`).value === "out" })).filter((r) => r.n);
    p.sizes = rows.map((r) => r.n); p.sizes_out = rows.filter((r) => r.out).map((r) => r.n);
    p.colors = [...document.querySelectorAll("[data-ch]")].map((el, i) => ({ hex: el.value, name: document.querySelector(`[data-cn="${i}"]`).value.trim() || "Colour", images: p.colors[i]?.images || [] }));
    p.in_stock = $("#stock").checked; p.featured = $("#feat").checked; p.active = $("#active").checked;
  };
  const listFor = (key) => key === "p" ? p.images : (p.colors[+key].images ||= []);
  const wire = () => {
    $("#back").onclick = () => { if (!leavePhotos()) return; editing = null; onDone(); };
    const syncStock = () => {
      const rows = [...document.querySelectorAll("[data-sn]")].map((el, i) => ({ n: el.value.trim(), out: document.querySelector(`[data-ss="${i}"]`).value === "out" })).filter((r) => r.n);
      if (rows.length && rows.every((r) => r.out)) $("#stock").checked = false;
    };
    document.querySelectorAll("[data-ss]").forEach((el) => el.onchange = syncStock);
    $("#addsize").onclick = () => { collect(); p.sizes.push(""); draw(); document.querySelectorAll("[data-sn]")[p.sizes.length - 1]?.focus(); };
    $("#addcol").onclick = () => { collect(); p.colors.push({ name: "", hex: "#d9a9a6" }); draw(); };
    m.onclick = (e) => {
      const d = e.target.closest("button")?.dataset;
      if (!d) return;
      const job = (id) => p._jobs?.find((j) => j.id === +id);
      if (d.skip) { const j = job(d.skip); if (j) useOriginal(j); p._paint(); }
      if (d.retry) { const j = job(d.retry); if (j?.failed) queueCut(p, j); p._paint(); }
      if (d.skipall) { const list = listFor(d.skipall); p._jobs.filter((j) => j.list === list).forEach(useOriginal); p._paint(); }
      if (d.drop) { dropJobs(p, (j) => j.id === +d.drop); p._paint(); }
      if (d.pick) { const [id, v] = d.pick.split(":"); const j = job(id); if (j) j.choice = v; p._paint(); }
      if (d.add) addPhotos(p, listFor(d.add));
      if (d.tone) { setTone(p, d.tone); p._paint(); }
      if (d.v) { const [key, i, v] = d.v.split(":"); const list = listFor(key); list[+i] = setVersion(list[+i], v === "cut", toneOf(p)); p._paint(); }
      if (d.sd !== undefined) { collect(); p.sizes.splice(+d.sd, 1); draw(); }
      if (d.cd !== undefined) { collect(); const [gone] = p.colors.splice(+d.cd, 1); dropJobs(p, (j) => j.list === gone.images); draw(); }
      if (d.cm) {
        collect(); const [ci, j, a] = d.cm.split(":"); const arr = p.colors[+ci].images; const idx = +j;
        if (a === "x") arr.splice(idx, 1);
        else { const k = idx + +a; if (k >= 0 && k < arr.length) [arr[idx], arr[k]] = [arr[k], arr[idx]]; }
        draw();
      }
      if (d.m) {
        collect(); const [i, a] = d.m.split(":"); const idx = +i;
        if (a === "x") p.images.splice(idx, 1);
        else { const j = idx + +a; if (j >= 0 && j < p.images.length) [p.images[idx], p.images[j]] = [p.images[j], p.images[idx]]; }
        draw();
      }
    };
    const picked = (inp, key) => { pickPhotos(p, listFor(key), [...inp.files]); inp.value = ""; };
    document.querySelectorAll("[data-cf]").forEach((inp) => inp.onchange = () => picked(inp, inp.dataset.cf));
    $("#files").onchange = (e) => picked(e.target, "p");
    $("#del")?.addEventListener("click", async () => {
      if (!confirm(`Delete "${p.name}" permanently?`)) return;
      dropJobs(p, () => true);
      const { error } = await rpc("DELETE", `/api/admin/products/${p.id}`);
      if (error) return toast(error.message, true);
      products = products.filter((x) => x.id !== p.id); editing = null; toast("Deleted."); onDone(true);
    });
    $("#save").onclick = async () => {
      collect();
      if (p._jobs?.length) return toast("Some photos are not added yet. Tap Add (or remove them), then save.", true);
      if (!p.name) return toast("Please enter a name.", true);
      const row = {
        name: p.name, category_id: p.category_id, price: p.price, sale_price: p.sale_price, sale_label: p.sale_label || null,
        description: p.description, details: p.details,
        images: p.images, sizes: p.sizes, sizes_out: p.sizes_out || [], colors: p.colors, in_stock: p.in_stock, featured: p.featured, active: p.active, sort: p.sort,
      };
      const pickers = [...m.querySelectorAll("input[type=file]")];
      pickers.forEach((el) => (el.disabled = true)); // photos picked while saving would be lost
      const res = p._new ? await rpc("POST", "/api/admin/products", row) : await rpc("PUT", `/api/admin/products/${p.id}`, row);
      pickers.forEach((el) => (el.disabled = false));
      if (res.error) return toast(res.error.message, true);
      const i = products.findIndex((x) => x.id === res.data.id);
      i >= 0 ? (products[i] = res.data) : products.unshift(res.data);
      toast("Saved. Live on the website.");
      if (editing && editing !== p) return; // another product was opened while this one was saving
      editing = null; onDone(true, res.data);
    };
  };
  draw();
}

/* ---------- Visual editor: the real website, tap a part to edit it ---------- */
window.AYLIN_ADMIN = true; // lets the site (in the iframe) know it is being edited

const STATIC_PAGES = [["/", "Home"], ["/shop", "Shop"], ["/about", "Our story"], ["/contact", "Contact"], ["/shipping", "Shipping"], ["/returns", "Returns"], ["/size-guide", "Size guide"]];

function visual() {
  let sel = null, dirty = false, timer;
  root.innerHTML = `<div class="vis" id="vis">
    <div class="vtop"><button id="menu" aria-label="All settings">☰</button><select id="pages"></select><button id="addp">＋ Add product</button></div>
    <div class="vframe"><iframe id="frame" title="Website"></iframe><div class="vhint" id="hint">Tap anything with a dotted outline to edit it</div></div>
    <div class="sheet" id="sheet"><div class="grab"><button id="tall" aria-label="Resize">⇅</button><span id="stitle"></span><button id="close" aria-label="Close">✕</button></div><div class="sbody" id="sbody"></div></div></div>`;
  const frame = $("#frame"), sheet = $("#sheet"), body = $("#sbody"), vis = $("#vis");
  const win = () => frame.contentWindow, doc = () => frame.contentDocument;

  const buildPages = (cur) => {
    const opts = [...STATIC_PAGES, ...products.filter((p) => p.active).map((p) => [`/product/${p.slug}`, `Product: ${p.name}`])];
    $("#pages").innerHTML = opts.map(([v, l]) => `<option value="${esc(v)}" ${v === cur ? "selected" : ""}>${esc(l)}</option>`).join("");
  };
  const here = () => { try { return win().location.pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/"; } catch (e) { return "/"; } };

  const matches = (el) => sel && el.dataset.edit === sel.edit && (el.dataset.fields || "") === sel.fields && (el.dataset.id || "") === sel.id;
  const mark = (scroll) => {
    const d = doc(); if (!d) return;
    d.querySelectorAll(".ed-sel").forEach((x) => x.classList.remove("ed-sel"));
    const el = sel && [...d.querySelectorAll("[data-edit]")].find(matches);
    if (el) { el.classList.add("ed-sel"); if (scroll) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 150); }
  };
  const preview = (over) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!win()?.aylinRerender) return;
      const next = structuredClone(settings); if (over) next[over.key] = over.val;
      win().aylinRerender(next).then(() => mark(false));
    }, 150);
  };

  const closeSheet = (force) => {
    if (!force && dirty && !confirm("Discard your unsaved changes?")) return false;
    if (!leavePhotos(!force)) return false;
    if (dirty && !force) preview(); // put the page back to what is saved
    dirty = false; sel = null; editing = null; body.innerHTML = ""; body.oninput = body.onclick = null;
    sheet.classList.remove("open"); vis.classList.remove("sheet-open"); mark(false); return true;
  };
  const open = (title) => { sheet.classList.add("open"); vis.classList.add("sheet-open"); $("#stitle").textContent = title; $("#hint").style.display = "none"; mark(true); };
  const refreshFrame = (to) => {
    const cur = to || here();
    const ok = Boolean(to) || STATIC_PAGES.some(([v]) => v === cur) || products.some((p) => p.active && cur === `/product/${p.slug}`);
    buildPages(ok ? cur : "/");
    if (to || !ok) frame.src = ok ? cur : "/"; else win().location.reload();
  };
  const productDone = (saved, row) => { closeSheet(true); if (saved) refreshFrame(row ? `/product/${row.slug}` : undefined); };

  const addProduct = () => {
    if (!closeSheet()) return;
    editing = newProduct(); sel = { edit: "new", fields: "", id: "" }; open("New product");
    productForm(body, productDone);
  };
  const edit = (s) => {
    if (s.edit === "newproduct") return addProduct();
    if (sel && sel.edit === s.edit && sel.fields === s.fields && sel.id === s.id) return;
    if (!closeSheet()) return;
    if (s.edit === "product") {
      const p = products.find((x) => x.id === s.id); if (!p) return;
      sel = s; editing = structuredClone(p);
      open("Product");
      productForm(body, productDone);
      return;
    }
    const sec = SECTIONS[s.edit]; if (!sec) return;
    sel = s;
    open(sec.label);
    sectionForm(body, s.edit, {
      only: s.fields,
      onInput: (val) => { dirty = true; preview({ key: s.edit, val }); },
      onSaved: () => { dirty = false; closeSheet(true); preview(); },
    });
  };

  const hook = () => {
    const d = doc(); if (!d || !d.body) return;
    const st = d.createElement("style");
    st.textContent = `[data-edit]{outline:1.5px dashed rgba(181,131,138,.95)!important;outline-offset:-2px;cursor:pointer;-webkit-tap-highlight-color:transparent}
      [data-edit].ed-sel{outline:3px solid #b5838a!important;box-shadow:inset 0 0 0 9999px rgba(181,131,138,.14)}
      .fade{animation:none!important}`;
    d.head.appendChild(st);
    d.addEventListener("click", (e) => {
      const el = e.target.closest?.("[data-edit]");
      if (el) { e.preventDefault(); e.stopPropagation(); edit({ edit: el.dataset.edit, fields: el.dataset.fields || "", id: el.dataset.id || "" }); return; }
      const a = e.target.closest?.("a[href]");
      if (a && (a.target === "_blank" || new URL(a.href, d.baseURI).origin !== location.origin)) e.preventDefault();
    }, true);
    const cur = here();
    $("#pages").value = [...$("#pages").options].some((o) => o.value === cur) ? cur : "/";
    mark(false);
  };

  frame.addEventListener("load", hook);
  $("#pages").onchange = (e) => { if (closeSheet()) frame.src = e.target.value; else e.target.value = here(); };
  $("#close").onclick = () => closeSheet();
  $("#tall").onclick = () => vis.classList.toggle("tall");
  $("#addp").onclick = addProduct;
  $("#menu").onclick = () => { if (closeSheet()) { tab = "products"; shell(); } };
  setTimeout(() => ($("#hint").style.display = "none"), 5000);
  buildPages("/"); frame.src = "/";
}

loadAll();
