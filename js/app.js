
const $ = (s, r = document) => r.querySelector(s);
const esc = (v = "") => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const paras = (t = "") => t.split(/\n{2,}/).filter(Boolean).map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
const page = document.body.dataset.page;
const params = new URLSearchParams(location.search);
let S; // settings

const money = (n) => `${S.site.currency}${Number(n).toLocaleString("en-IN")}`;
const waNumber = () => S.whatsapp.number.replace(/\D/g, "");
const waLink = (text) => `https://wa.me/${waNumber()}?text=${encodeURIComponent(text)}`;

function placeholder(seedText = "") {
  const hue = [...seedText].reduce((a, c) => a + c.charCodeAt(0), 0) % 3;
  const [a, b] = [["#f1ddd9", "#e3e6ec"], ["#e6e2ee", "#f4e8e3"], ["#dfe5e0", "#efe6dc"]][hue];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='300' height='400' fill='url(#g)'/><path d='M168 120a62 62 0 1 0 0 120a50 50 0 1 1 0-120z' fill='#ffffff' opacity='.55'/></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
const img = (p, i = 0) => p.images?.[i] || placeholder(p.name);

function applyTheme() {
  const q = params.get("theme");
  if (q === "luxe" || q === "midnight") sessionStorage.setItem("aylin-theme", q);
  const t = sessionStorage.getItem("aylin-theme") || S.site.theme || "luxe";
  document.documentElement.dataset.theme = t === "midnight" ? "midnight" : "luxe";
}

function layout(cats) {
  const nav = [["/shop", "Shop"], ["/about", "Our Story"], ["/contact", "Contact"]];
  const here = location.pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/";
  const general = waLink(S.whatsapp.generalMessage);
  const waIcon = `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C9 3 3.3 8.6 3.3 15.5c0 2.3.6 4.4 1.7 6.3L3 29l7.4-1.9c1.8 1 3.8 1.500 5.900 1.500 7 0 12.700-5.600 12.700-12.500S23 3 16 3zm0 22.900c-1.900 0-3.700-.5-5.300-1.500l-.4-.2-4.400 1.100 1.200-4.200-.3-.4a10.200 10.200 0 0 1-1.600-5.500C5.200 9.800 10 5.200 16 5.200s10.800 4.600 10.800 10.300S21.900 25.900 16 25.900zm5.900-7.600c-.3-.2-1.900-.9-2.200-1s-.5-.2-.7.200-.8 1-1 1.200-.4.200-.7.100a8.600 8.600 0 0 1-4.300-3.700c-.3-.6.300-.6.900-1.800.1-.2 0-.4 0-.5s-.7-1.700-1-2.300c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.100-.8.400s-1 1-1 2.500 1.100 2.900 1.200 3.100c.2.200 2.100 3.300 5.200 4.500 1.900.8 2.700.9 3.600.7.600-.1 1.900-.8 2.200-1.500.3-.7.300-1.400.2-1.500s-.3-.2-.6-.4z"/></svg>`;

  const header = `
    ${S.announcement.enabled && S.announcement.text ? `<div class="announce">${esc(S.announcement.text)}</div>` : ""}
    <header class="site"><div class="wrap nav">
      <a class="brand" href="/" aria-label="${esc(S.site.name)} home">${esc(S.site.name)}</a>
      <nav class="menu" id="menu">
        ${nav.map(([h, l]) => `<a href="${h}" class="${here === h ? "on" : ""}">${l}</a>`).join("")}
      </nav>
      <div class="nav-r">
        <a class="icon-btn" href="${esc(S.social.instagram)}" target="_blank" rel="noopener" aria-label="Instagram">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>
        </a>
        <button class="icon-btn burger" id="burger" aria-label="Menu"><svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path d="M3 7h18M3 12h18M3 17h18"/></svg></button>
      </div>
    </div></header>`;

  const footer = `
    <footer class="site"><div class="wrap">
      <div class="foot">
        <div><img class="logo" src="${esc(S.site.logo)}" alt="${esc(S.site.name)}"><p style="color:var(--muted)">${esc(S.site.tagline)}</p></div>
        <div><h4>Help</h4><ul>
          <li><a href="/shipping">Shipping</a></li>
          <li><a href="/returns">Returns &amp; exchanges</a></li>
          <li><a href="/size-guide">Size guide</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul></div>
      </div>
      <p class="legal">${esc(S.footer.text)}</p>
    </div></footer>
    <a class="fab" href="${general}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${waIcon}</a>
    ${CONFIG.SHOW_THEME_TOGGLE ? `<div class="theme-toggle" id="tt"><button data-t="luxe">Luxe</button><button data-t="midnight">Midnight</button></div>` : ""}`;

  $("#top").innerHTML = header;
  $("#bottom").innerHTML = footer;
  $("#burger").onclick = () => $("#menu").classList.toggle("open");
  const tt = $("#tt");
  if (tt) {
    const sync = () => tt.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.t === document.documentElement.dataset.theme));
    tt.onclick = (e) => { const t = e.target.dataset.t; if (t) { sessionStorage.setItem("aylin-theme", t); document.documentElement.dataset.theme = t; sync(); } };
    sync();
  }
}

const card = (p) => {
  const onSale = p.sale_price && p.sale_price < p.price;
  return `<a class="card fade" href="/product/${encodeURIComponent(p.slug)}">
    <div class="thumb"><img loading="lazy" src="${esc(img(p))}" alt="${esc(p.name)}">
      ${!p.in_stock ? `<span class="badge out">Sold out</span>` : onSale ? `<span class="badge">Sale</span>` : ""}</div>
    <div><h3>${esc(p.name)}</h3>
      <div class="price">${onSale ? `<s>${money(p.price)}</s>${money(p.sale_price)}` : money(p.price)}</div>
      ${p.colors.length ? `<div class="swatches">${p.colors.map((c) => `<span class="sw" title="${esc(c.name)}" style="background:${esc(c.hex)}"></span>`).join("")}</div>` : ""}
    </div></a>`;
};

/* ---------- Pages ---------- */
function home(cats, products) {
  const h = S.hero;
  const feat = products.filter((p) => p.featured).slice(0, 8);
  const shown = feat.length ? feat : products.slice(0, 8);
  $("#app").innerHTML = `
  <section class="hero ${h.image ? "has-img" : ""}" ${h.image ? `style="background-image:url('${esc(h.image)}')"` : ""}>
    <div class="wrap hero-in fade">
      ${h.image ? "" : `<img class="hero-mark" src="${esc(S.site.logo)}" alt="">`}
      <span class="eyebrow">${esc(h.eyebrow)}</span>
      <h1>${esc(h.title)}</h1>
      <p>${esc(h.subtitle)}</p>
      <a class="btn" href="${esc(h.ctaLink)}">${esc(h.ctaText)}</a>
    </div>
  </section>
  <section class="section alt"><div class="wrap">
    <div class="section-head"><span class="eyebrow">Featured</span><h2>Just for you</h2></div>
    ${shown.length ? `<div class="grid">${shown.map(card).join("")}</div>` : `<p class="empty">New pieces arriving soon.</p>`}
    <p class="center" style="margin-top:40px"><a class="btn ghost" href="/shop">View all</a></p>
  </div></section>
  <section class="section"><div class="wrap split solo">
    <div class="txt"><span class="eyebrow">${esc(S.site.tagline)}</span><h2>${esc(S.story.title)}</h2><p>${esc(S.story.text)}</p><a class="btn ghost" href="/about">Read more</a></div>
  </div></section>
  <section class="section alt"><div class="wrap values">
    ${S.values.items.map((v) => `<div><h3>${esc(v.title)}</h3><p>${esc(v.text)}</p></div>`).join("")}
  </div></section>`;
  document.title = `${S.site.name} · ${S.site.tagline}`;
}

function shop(cats, products) {
  $("#app").innerHTML = `<div class="wrap">
    <div class="page-head"><span class="eyebrow">The collection</span><h1>Shop</h1></div>
    ${products.length ? `<div class="grid">${products.map(card).join("")}</div>` : `<p class="empty">Nothing here yet. Check back soon.</p>`}
    <div style="height:80px"></div></div>`;
  document.title = `Shop · ${S.site.name}`;
}

async function product(cats) {
  const p = await getProduct((location.pathname.split("/").filter(Boolean).pop() || "").replace(/\.html$/, ""));
  if (!p) { $("#app").innerHTML = `<div class="wrap"><p class="empty">Product not found. <a href="/shop" style="text-decoration:underline">Back to shop</a></p></div>`; return; }
  const cat = cats.find((c) => c.id === p.category_id);
  const onSale = p.sale_price && p.sale_price < p.price;
  const eff = onSale ? p.sale_price : p.price;
  const n = Math.max(p.images.length, 1);
  let cur = 0, size = p.sizes.length ? "" : "n/a", colour = p.colors.length === 1 ? p.colors[0].name : p.colors.length ? "" : "n/a";

  $("#app").innerHTML = `<div class="wrap">
    <div class="crumbs"><a href="/shop">Shop</a>${cat ? ` / <a href="/shop?cat=${esc(cat.slug)}">${esc(cat.name)}</a>` : ""}</div>
    <div class="pdp">
      <div class="gallery"><div class="main"><img id="main" src="${esc(img(p))}" alt="${esc(p.name)}"></div>
        ${n > 1 ? `<div class="thumbs" id="thumbs">${p.images.map((u, i) => `<button data-i="${i}" class="${i ? "" : "on"}"><img src="${esc(u)}" alt=""></button>`).join("")}</div>` : ""}
      </div>
      <div class="info">
        <div><h1 style="font-size:clamp(30px,4vw,44px)">${esc(p.name)}</h1></div>
        <div class="price">${onSale ? `<s>${money(p.price)}</s>${money(p.sale_price)}` : money(p.price)}</div>
        ${p.description ? `<div class="details">${paras(p.description)}</div>` : ""}
        ${p.colors.length > 1 || (p.colors.length === 1) ? `<div class="opt"><h4>Colour</h4><div class="row" id="colours">${p.colors.map((c) => `<button class="cdot ${p.colors.length === 1 ? "on" : ""}" data-n="${esc(c.name)}"><i style="background:${esc(c.hex)}"></i>${esc(c.name)}</button>`).join("")}</div></div>` : ""}
        ${p.sizes.length ? `<div class="opt"><h4>Size</h4><div class="row" id="sizes">${p.sizes.map((s) => `<button class="size" data-s="${esc(s)}">${esc(s)}</button>`).join("")}</div></div>` : ""}
        <div class="hint" id="hint"></div>
        ${p.in_stock ? `<button class="btn wa" id="order">Order on WhatsApp</button>` : `<button class="btn" disabled>Sold out</button><a class="btn ghost" id="ask" target="_blank" rel="noopener">Ask about restock</a>`}
        ${p.details ? `<div class="details"><h4 class="eyebrow" style="margin-bottom:8px">Details</h4><ul>${p.details.split("\n").filter(Boolean).map((d) => `<li>${esc(d)}</li>`).join("")}</ul></div>` : ""}
      </div>
    </div></div>`;

  const link = () => new URL(`/product/${encodeURIComponent(p.slug)}`, location.href).href;
  const message = () => S.whatsapp.template
    .replaceAll("{product}", p.name).replaceAll("{size}", size || "-").replaceAll("{colour}", colour || "-")
    .replaceAll("{price}", money(eff)).replaceAll("{link}", link())
    .replace(/^.*(Size|Colour): (n\/a|-)\n?/gm, "");

  $("#thumbs")?.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    cur = +b.dataset.i; $("#main").src = img(p, cur);
    document.querySelectorAll("#thumbs button").forEach((x, i) => x.classList.toggle("on", i === cur));
  });
  $("#sizes")?.addEventListener("click", (e) => {
    if (!e.target.dataset.s) return; size = e.target.dataset.s;
    document.querySelectorAll("#sizes .size").forEach((x) => x.classList.toggle("on", x.dataset.s === size));
  });
  $("#colours")?.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return; colour = b.dataset.n;
    document.querySelectorAll("#colours .cdot").forEach((x) => x.classList.toggle("on", x === b));
  });
  $("#order")?.addEventListener("click", () => {
    if (!size) return ($("#hint").textContent = "Please choose a size.");
    if (!colour) return ($("#hint").textContent = "Please choose a colour.");
    window.open(waLink(message()), "_blank", "noopener");
  });
  const ask = $("#ask");
  if (ask) ask.href = waLink(`Hi AYLIN! Is "${p.name}" coming back in stock?\n${link()}`);
  document.title = `${p.name} · ${S.site.name}`;
}

function about() {
  $("#app").innerHTML = `<div class="wrap section">
    <div class="split solo">
      <div class="txt"><span class="eyebrow">Our story</span><h1 style="color:var(--ink);font-size:clamp(32px,4.5vw,54px)">${esc(S.about.title)}</h1>${paras(S.about.body)}</div>
    </div></div>`;
  document.title = `Our story · ${S.site.name}`;
}

function contact() {
  const c = S.contact;
  $("#app").innerHTML = `<div class="wrap section">
    <div class="section-head"><span class="eyebrow">We'd love to hear from you</span><h1>Contact</h1></div>
    <div class="contact-grid">
      <div><h3>WhatsApp</h3><a href="${waLink(S.whatsapp.generalMessage)}" target="_blank" rel="noopener">${esc(S.whatsapp.number)}</a></div>
      <div><h3>Instagram</h3><a href="${esc(S.social.instagram)}" target="_blank" rel="noopener">@theaylinlabel</a></div>
      ${c.email ? `<div><h3>Email</h3><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div>` : ""}
    </div>
    <p class="center" style="margin-top:36px"><a class="btn wa" href="${waLink(S.whatsapp.generalMessage)}" target="_blank" rel="noopener">Chat on WhatsApp</a></p></div>`;
  document.title = `Contact · ${S.site.name}`;
}

function policies() {
  const map = { shipping: ["Shipping", S.policies.shipping], returns: ["Returns & exchanges", S.policies.returns], "size-guide": ["Size guide", S.policies.sizeGuide] };
  const [title, body] = map[({ "/shipping": "shipping", "/returns": "returns", "/size-guide": "size-guide" }[location.pathname.replace(/\/$/, "")] || params.get("p"))] || map.shipping;
  $("#app").innerHTML = `<div class="wrap section"><div class="section-head"><span class="eyebrow">Help</span><h1>${esc(title)}</h1></div><div class="prose">${paras(body)}</div></div>`;
  document.title = `${title} · ${S.site.name}`;
}

/* ---------- Boot ---------- */
(async () => {
try {
  S = await getSettings();
  applyTheme();
  const [cats, products] = await Promise.all([getCategories(), getProducts()]);
  layout(cats);
  ({ home: () => home(cats, products), shop: () => shop(cats, products), product: () => product(cats), about, contact, policies }[page])?.();
} catch (e) {
  console.error(e);
  $("#app").innerHTML = `<p class="empty">Something went wrong loading the page. Please refresh.</p>`;
}
})();

/* Ambient backdrop from the coming-soon page: silver stars in midnight, drifting rose-gold dust in luxe */
(function () {
  const c = document.createElement("canvas"); c.id = "sky"; c.setAttribute("aria-hidden", "true");
  document.body.prepend(c);
  const x = c.getContext("2d"); let w, h, stars;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function size() { w = c.width = innerWidth; h = c.height = innerHeight; stars = Array.from({ length: Math.floor(w * h / 9000) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.2 + .2, p: Math.random() * 6.28, s: Math.random() * .02 + .005 })); }
  size(); addEventListener("resize", size);
  (function draw() {
    const luxe = document.documentElement.dataset.theme !== "midnight";
    x.clearRect(0, 0, w, h);
    for (const s of stars) {
      if (!reduce) { s.p += s.s; s.y -= luxe ? .05 : .03; if (s.y < 0) s.y = h; }
      x.globalAlpha = (luxe ? .15 : .25) + (luxe ? .4 : .55) * Math.abs(Math.sin(s.p));
      x.fillStyle = luxe ? "#c9949b" : "#dfe3ea";
      x.beginPath(); x.arc(s.x, s.y, luxe ? s.r * 1.3 : s.r, 0, 6.28); x.fill();
    }
    requestAnimationFrame(draw);
  })();
})();
