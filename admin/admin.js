
const $ = (s, r = document) => r.querySelector(s);
const root = $("#root");
const esc = (v = "") => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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
    ["theme", "Website theme", "select:luxe=Soft luxe (ivory, blush),midnight=Midnight (black, silver)"],
    ["name", "Brand name", "text"], ["tagline", "Tagline", "text"], ["logo", "Logo", "image"], ["currency", "Currency symbol", "text"]] },
  footer: { label: "Footer", fields: [["text", "Footer text", "text"]] },
};

const get = (o, p) => p.split(".").reduce((a, k) => a?.[k], o);
function set(o, p, v) { const ks = p.split("."); const l = ks.pop(); ks.reduce((a, k) => (a[k] ??= {}), o)[l] = v; }

let sb, cats = [], products = [], settings, tab = "products", editing = null;

/* ---------- Auth ---------- */
async function boot() {
  if (!live) {
    root.innerHTML = `<div class="login"><div class="box"><h1>AYLIN Admin</h1>
      <div class="note"><b>Supabase is not connected yet.</b><br>Follow the steps in README.md, then paste the project URL and anon key into <code>js/config.js</code>.</div></div></div>`;
    return;
  }
  sb = await client();
  const { data } = await sb.auth.getSession();
  data.session ? await loadAll() : loginView();
}

function loginView() {
  root.innerHTML = `<div class="login"><form class="box" id="f"><h1>AYLIN Admin</h1>
    <label>Email<input type="email" name="email" required autocomplete="username"></label>
    <label>Password<input type="password" name="password" required autocomplete="current-password"></label>
    <button class="btn">Sign in</button></form></div>`;
  $("#f").onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const { error } = await sb.auth.signInWithPassword({ email: f.get("email"), password: f.get("password") });
    error ? toast(error.message, true) : loadAll();
  };
}

async function loadAll() {
  const [c, p, s, admin] = await Promise.all([
    sb.from("categories").select("*").order("sort"),
    sb.from("products").select("*").order("sort").order("created_at", { ascending: false }),
    getSettings(),
    sb.rpc("is_admin"),
  ]);
  if (admin.data !== true) {
    await sb.auth.signOut();
    toast("This account is not an admin.", true);
    return loginView();
  }
  cats = c.data || []; products = p.data || []; settings = s;
  shell();
}

/* ---------- Shell ---------- */
function shell() {
  const items = [["products", "Products"], ["categories", "Categories"], ...Object.entries(SECTIONS).map(([k, v]) => [k, v.label])];
  root.innerHTML = `<div class="shell"><aside><h2>AYLIN</h2>
    ${items.map(([k, l]) => `<button data-t="${k}" class="${k === tab ? "on" : ""}">${l}</button>`).join("")}
    <div class="spacer"></div><button id="view">View website ↗</button><button id="out">Sign out</button></aside>
    <main id="main"></main></div>`;
  root.querySelector("aside").onclick = (e) => { const t = e.target.dataset.t; if (t) { tab = t; editing = null; shell(); } };
  $("#view").onclick = () => window.open("../index.html", "_blank");
  $("#out").onclick = async () => { await sb.auth.signOut(); loginView(); };
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
      try { const url = await upload(inp.files[0]); $("#" + inp.dataset.up).value = url; toast("Uploaded. Don't forget to save."); }
      catch (e) { toast(e.message, true); }
    };
  });
}

async function upload(file) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await sb.storage.from("media").upload(path, file, { cacheControl: "31536000" });
  if (error) throw error;
  return sb.storage.from("media").getPublicUrl(path).data.publicUrl;
}

function sectionForm(m, key) {
  const sec = SECTIONS[key];
  const cur = settings[key] || DEFAULT_SETTINGS[key];
  m.innerHTML = `<div class="bar"><h1>${esc(sec.label)}</h1><button class="btn" id="save">Save changes</button></div>
    <div class="card">${sec.fields.map((f) => fieldHTML(f, get(cur, f[0]))).join("")}</div>`;
  wireUploads(m);
  $("#save").onclick = async () => {
    const val = JSON.parse(JSON.stringify(cur));
    m.querySelectorAll("[data-p]").forEach((el) => set(val, el.dataset.p, el.type === "checkbox" ? el.checked : el.value));
    const { error } = await sb.from("settings").upsert({ key, value: val });
    if (error) return toast(error.message, true);
    settings[key] = val; toast("Saved. Live on the website.");
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
    const { error } = await sb.from("categories").insert({ name, slug: slugify(name), sort: cats.length + 1 });
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
        const { error } = await sb.from("categories").delete().eq("id", tr.dataset.id);
        return error ? toast(error.message, true) : (await reloadCats(), shell());
      }
      const name = tr.querySelector("[data-k=name]").value.trim();
      const { error } = await sb.from("categories").update({
        name, slug: slugify(name), image: tr.querySelector("[data-k=image]").value, sort: +tr.querySelector("[data-k=sort]").value || 0,
      }).eq("id", tr.dataset.id);
      error ? toast(error.message, true) : (toast("Saved."), reloadCats());
    };
  });
}
async function reloadCats() { cats = (await sb.from("categories").select("*").order("sort")).data || []; }

/* ---------- Products ---------- */
function productList(m) {
  const money = (n) => `${settings.site.currency}${Number(n).toLocaleString("en-IN")}`;
  m.innerHTML = `<div class="bar"><h1>Products</h1><button class="btn" id="add">+ Add product</button></div>
    ${products.length ? `<table><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Status</th><th></th></tr>
    ${products.map((p) => `<tr><td>${p.images?.[0] ? `<img src="${esc(p.images[0])}" alt="">` : ""}</td>
      <td>${esc(p.name)}</td><td>${esc(cats.find((c) => c.id === p.category_id)?.name || "-")}</td>
      <td>${p.sale_price ? `<s>${money(p.price)}</s> ${money(p.sale_price)}` : money(p.price)}</td>
      <td>${p.active ? "" : `<span class="tag no">Hidden</span> `}${p.in_stock ? `<span class="tag ok">In stock</span>` : `<span class="tag no">Sold out</span>`}${p.featured ? ` <span class="tag">Featured</span>` : ""}</td>
      <td><button class="btn sm ghost" data-id="${p.id}">Edit</button></td></tr>`).join("")}</table>`
      : `<div class="note">No products yet. Click <b>Add product</b> to create your first one.</div>`}`;
  $("#add").onclick = () => { editing = { _new: true, name: "", price: 0, images: [], sizes: ["S", "M", "L"], colors: [], in_stock: true, featured: false, active: true, description: "", details: "", category_id: cats[0]?.id || null }; shell(); };
  m.onclick = (e) => { const id = e.target.dataset.id; if (id) { editing = structuredClone(products.find((p) => p.id === id)); shell(); } };
}

function productForm(m) {
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
        <label>Description<textarea id="desc">${esc(p.description)}</textarea></label>
        <label>Details (one per line)<textarea id="details">${esc(p.details)}</textarea></label>
      </div>
      <div class="card"><b>Photos</b><p class="muted">The first photo is the cover. Use ← → to reorder.</p>
        <div class="imgs">${p.images.map((u, i) => `<figure><img src="${esc(u)}" alt=""><div class="acts">
          <button data-m="${i}:-1">←</button><button data-m="${i}:x">✕</button><button data-m="${i}:1">→</button></div></figure>`).join("")}</div>
        <input type="file" id="files" accept="image/*" multiple></div>
      <div class="card"><label>Sizes (comma separated, leave empty if not applicable)<input type="text" id="sizes" value="${esc(p.sizes.join(", "))}"></label>
        <div><b>Colours</b><div id="cols" style="margin-top:8px">${p.colors.map((c, i) => `<div class="colorrow"><input type="color" data-ch="${i}" value="${esc(c.hex)}"><input type="text" data-cn="${i}" value="${esc(c.name)}" placeholder="Colour name"><button class="btn sm danger" data-cd="${i}">✕</button></div>`).join("")}</div>
          <button class="btn sm ghost" id="addcol">+ Add colour</button></div></div>
      <div class="card">
        <label class="check"><input type="checkbox" id="stock" ${p.in_stock ? "checked" : ""}> In stock</label>
        <label class="check"><input type="checkbox" id="feat" ${p.featured ? "checked" : ""}> Featured on homepage</label>
        <label class="check"><input type="checkbox" id="active" ${p.active ? "checked" : ""}> Visible on website</label>
        ${p._new ? "" : `<button class="btn danger" id="del" style="justify-self:start">Delete product</button>`}
      </div>`;
    wire();
  };
  const collect = () => {
    p.name = $("#name").value.trim(); p.category_id = $("#cat").value || null; p.sort = +$("#sort").value || 0;
    p.price = +$("#price").value || 0; p.sale_price = $("#sale").value === "" ? null : +$("#sale").value;
    p.description = $("#desc").value; p.details = $("#details").value;
    p.sizes = $("#sizes").value.split(",").map((s) => s.trim()).filter(Boolean);
    p.colors = [...document.querySelectorAll("[data-ch]")].map((el, i) => ({ hex: el.value, name: document.querySelector(`[data-cn="${i}"]`).value.trim() || "Colour" }));
    p.in_stock = $("#stock").checked; p.featured = $("#feat").checked; p.active = $("#active").checked;
  };
  const wire = () => {
    $("#back").onclick = () => { editing = null; shell(); };
    $("#addcol").onclick = () => { collect(); p.colors.push({ name: "", hex: "#d9a9a6" }); draw(); };
    m.onclick = (e) => {
      const d = e.target.dataset;
      if (d.cd !== undefined) { collect(); p.colors.splice(+d.cd, 1); draw(); }
      if (d.m) {
        collect(); const [i, a] = d.m.split(":"); const idx = +i;
        if (a === "x") p.images.splice(idx, 1);
        else { const j = idx + +a; if (j >= 0 && j < p.images.length) [p.images[idx], p.images[j]] = [p.images[j], p.images[idx]]; }
        draw();
      }
    };
    $("#files").onchange = async (e) => {
      collect(); toast("Uploading…");
      try { for (const f of e.target.files) p.images.push(await upload(f)); toast("Photos added."); } catch (x) { toast(x.message, true); }
      draw();
    };
    $("#del")?.addEventListener("click", async () => {
      if (!confirm(`Delete "${p.name}" permanently?`)) return;
      const { error } = await sb.from("products").delete().eq("id", p.id);
      if (error) return toast(error.message, true);
      products = products.filter((x) => x.id !== p.id); editing = null; toast("Deleted."); shell();
    });
    $("#save").onclick = async () => {
      collect();
      if (!p.name) return toast("Please enter a name.", true);
      const row = {
        name: p.name, category_id: p.category_id, price: p.price, sale_price: p.sale_price, description: p.description, details: p.details,
        images: p.images, sizes: p.sizes, colors: p.colors, in_stock: p.in_stock, featured: p.featured, active: p.active, sort: p.sort,
      };
      let res;
      if (p._new) {
        let slug = slugify(p.name), n = 1;
        while (products.some((x) => x.slug === slug)) slug = `${slugify(p.name)}-${++n}`;
        res = await sb.from("products").insert({ ...row, slug }).select().single();
      } else res = await sb.from("products").update(row).eq("id", p.id).select().single();
      if (res.error) return toast(res.error.message, true);
      const i = products.findIndex((x) => x.id === res.data.id);
      i >= 0 ? (products[i] = res.data) : products.unshift(res.data);
      editing = null; toast("Saved. Live on the website."); shell();
    };
  };
  draw();
}

boot();
