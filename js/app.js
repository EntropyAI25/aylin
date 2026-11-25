
const $ = (s, r = document) => r.querySelector(s);
const esc = (v = "") => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const paras = (t = "") => t.split(/\n{2,}/).filter(Boolean).map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
const page = document.body.dataset.page;
const params = new URLSearchParams(location.search);
let S; // settings
// Inside the admin's visual editor (same-origin iframe) the page tags editable blocks and can re-render from draft settings.
const EDIT = (() => { try { return window.parent !== window && !!window.parent.AYLIN_ADMIN; } catch (e) { return false; } })();
const ed = (key, fields = "", id = "") => (EDIT ? ` data-edit="${key}"${fields ? ` data-fields="${fields}"` : ""}${id ? ` data-id="${esc(id)}"` : ""}` : "");

const money = (n) => `${S.site.currency}${Number(n).toLocaleString("en-IN")}`;
const waNumber = () => S.whatsapp.number.replace(/\D/g, "");
const waLink = (text) => `https://wa.me/${waNumber()}?text=${encodeURIComponent(text)}`;

function placeholder(seedText = "") {
  const hue = [...seedText].reduce((a, c) => a + c.charCodeAt(0), 0) % 3;
  const [a, b] = [["#f1ddd9", "#e3e6ec"], ["#e6e2ee", "#f4e8e3"], ["#dfe5e0", "#efe6dc"]][hue];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='300' height='400' fill='url(#g)'/><path d='M168 120a62 62 0 1 0 0 120a50 50 0 1 1 0-120z' fill='#ffffff' opacity='.55'/></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
const abs = (u) => (/^(https?:|\/|data:)/.test(u) ? u : "/" + u); // root-relative, so it works on /product/... too
const pct = (p) => Math.round((1 - p.sale_price / p.price) * 100);
const priceHtml = (p) => (!p.price ? "" : p.sale_price && p.sale_price < p.price ? `<s>${money(p.price)}</s>${money(p.sale_price)}` : money(p.price));
const img = (p, i = 0) => p.images?.[i] || (i === 0 && p.colors?.find((c) => c.images?.length)?.images[0]) || placeholder(p.name);

// "auto" follows the phone/browser setting: dark -> midnight, light -> luxe.
function applyTheme() {
  const q = params.get("theme");
  if (!EDIT) {
    if (q === "luxe" || q === "midnight") sessionStorage.setItem("aylin-theme", q);
    else if (q === "auto") sessionStorage.removeItem("aylin-theme");
    try { localStorage.setItem("aylin-site-theme", S.site.theme || "auto"); } catch (e) {}
  }
  const dark = matchMedia("(prefers-color-scheme: dark)");
  const set = () => {
    const t = (!EDIT && sessionStorage.getItem("aylin-theme")) || S.site.theme || "auto";
    document.documentElement.dataset.theme = t === "auto" ? (dark.matches ? "midnight" : "luxe") : t === "midnight" ? "midnight" : "luxe";
    document.querySelectorAll("#tt button").forEach((b) => b.classList.toggle("on", b.dataset.t === (sessionStorage.getItem("aylin-theme") || "auto")));
  };
  if (!applyTheme.bound) { dark.addEventListener("change", set); applyTheme.bound = true; }
  window.applyThemeNow = set;
  set();
}

function layout(cats) {
  const nav = [["/shop", "Shop"], ["/about", "Our Story"], ["/contact", "Contact"]];
  const here = location.pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/";
  const general = waLink(S.whatsapp.generalMessage);
  const waIcon = `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C9 3 3.3 8.6 3.3 15.5c0 2.3.6 4.4 1.7 6.3L3 29l7.4-1.9c1.8 1 3.8 1.500 5.900 1.500 7 0 12.700-5.600 12.700-12.500S23 3 16 3zm0 22.900c-1.900 0-3.700-.5-5.300-1.500l-.4-.2-4.400 1.100 1.200-4.200-.3-.4a10.200 10.200 0 0 1-1.600-5.500C5.200 9.800 10 5.200 16 5.200s10.800 4.600 10.800 10.300S21.900 25.900 16 25.900zm5.900-7.600c-.3-.2-1.900-.9-2.200-1s-.5-.2-.7.200-.8 1-1 1.200-.4.200-.7.100a8.600 8.600 0 0 1-4.300-3.700c-.3-.6.300-.6.900-1.800.1-.2 0-.4 0-.5s-.7-1.700-1-2.300c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.100-.8.400s-1 1-1 2.500 1.100 2.900 1.200 3.100c.2.200 2.100 3.300 5.200 4.500 1.900.8 2.700.9 3.600.7.600-.1 1.900-.8 2.200-1.500.3-.7.300-1.400.2-1.500s-.3-.2-.6-.4z"/></svg>`;

  const header = `
    ${S.announcement.enabled && S.announcement.text ? `<div class="announce"${ed("announcement")}>${esc(S.announcement.text)}</div>`
      : EDIT ? `<div class="announce" style="opacity:.55"${ed("announcement")}>Announcement bar is off. Tap to add one.</div>` : ""}
    <header class="site"><div class="wrap nav">
      <a class="brand" href="/"${ed("site")} aria-label="${esc(S.site.name)} home">${esc(S.site.name)}</a>
      <nav class="menu" id="menu">
        ${nav.map(([h, l]) => `<a href="${h}" class="${here === h ? "on" : ""}">${l}</a>`).join("")}
      </nav>
      <div class="nav-r">
        <a class="icon-btn" href="${esc(S.social.instagram)}"${ed("social")} target="_blank" rel="noopener" aria-label="Instagram">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>
        </a>
        <button class="icon-btn burger" id="burger" aria-label="Menu"><svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path d="M3 7h18M3 12h18M3 17h18"/></svg></button>
      </div>
    </div></header>`;

  const footer = `
    <footer class="site"><div class="wrap">
      <div class="foot">
        <div${ed("site")}><span class="emblem" aria-hidden="true" style="color:var(--accent)"></span><p style="color:var(--muted)">${esc(S.site.tagline)}</p></div>
        <div><h4>Help</h4><ul>
          <li><a href="/shipping">Shipping</a></li>
          <li><a href="/returns">Returns &amp; exchanges</a></li>
          <li><a href="/size-guide">Size guide</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul></div>
      </div>
      <div class="wordmark" aria-hidden="true">${[...S.site.name].map((c) => `<span>${esc(c)}</span>`).join("")}</div>
      <p class="legal"${ed("footer")}>${esc(S.footer.text)}</p>
      <p class="credit"><a href="https://entropyai.hello-entropyai.workers.dev/" target="_blank" rel="noopener" aria-label="An Entropy AI creation"><img src="${esc(abs("/assets/entropy-ai.png"))}" alt="" width="16" height="17"><span>An Entropy AI creation</span></a></p>
    </div></footer>
    <a class="fab" href="${general}"${ed("whatsapp", "number,generalMessage")} target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${waIcon}</a>
    ${CONFIG.SHOW_THEME_TOGGLE ? `<div class="theme-toggle" id="tt"><button data-t="auto">Auto</button><button data-t="luxe">Luxe</button><button data-t="midnight">Midnight</button></div>` : ""}`;

  $("#top").innerHTML = header;
  $("#bottom").innerHTML = footer;
  $("#burger").onclick = () => $("#menu").classList.toggle("open");
  const tt = $("#tt");
  if (tt) {
    tt.onclick = (e) => { const t = e.target.dataset.t; if (!t) return; if (t === "auto") sessionStorage.removeItem("aylin-theme"); else sessionStorage.setItem("aylin-theme", t); window.applyThemeNow(); };
    window.applyThemeNow();
  }
}

const lookOf = (p) => LOOKS[p?.images?.[0]];
const lookVars = (l) => (l ? `--tl:${l.tl};--td:${l.td};--acc:${l.acc}` : "--tl:#efe2da;--td:#1a1c28;--acc:#9c6b73");
const sizesFree = (p) => p.sizes.filter((s) => !p.sizes_out.includes(s));
const productUrl = (p) => `/product/${encodeURIComponent(p.slug)}`;
const sizeButtons = (p) => p.sizes.map((s) => `<button type="button" class="size${p.sizes_out.includes(s) ? " out" : ""}" data-s="${esc(s)}"${p.sizes_out.includes(s) ? ` disabled title="Currently unavailable"` : ""}>${esc(s)}</button>`).join("");
const emblem = `<span class="emblem" aria-hidden="true"></span>`;
const featuredFirst = (list) => [...list].sort((a, b) => b.featured - a.featured);

function orderMessage(p, size, colour) {
  const eff = p.sale_price && p.sale_price < p.price ? p.sale_price : p.price;
  const tpl = S.whatsapp.template;
  return tpl
    .replace("your collection", "your {product}") // older saved templates had no product name
    .replaceAll("{product}", p.name + (size && size !== "n/a" && !tpl.includes("{size}") ? ` (size ${size})` : "")).replaceAll("{size}", size || "-").replaceAll("{colour}", colour || "-")
    .replaceAll("{price}", p.price ? money(eff) : "-").replaceAll("{link}", new URL(productUrl(p), location.href).href)
    .replace(/^.*(Size|Colour|Price): (n\/a|-)\n?/gm, "");
}
// Draws attention to a picker when someone tries to order without choosing from it.
function ask(row, hint, text = "Please choose your size first.") {
  hint.textContent = text;
  row.classList.remove("shake"); void row.offsetWidth; row.classList.add("shake");
}

const card = (p) => {
  const onSale = p.sale_price && p.sale_price < p.price;
  const l = lookOf(p);
  const second = l ? l.detail : p.images?.[1];
  return `<a class="card rv look" style="${lookVars(l)}" href="${productUrl(p)}"${ed("product", "", p.id)}>
    <div class="thumb">${second ? `<img class="close" loading="lazy" src="${esc(second)}" alt="">` : ""}<img class="${l ? "cut" : "front"}" loading="lazy" src="${esc(l ? l.front : img(p))}" alt="${esc(p.name)}">
      ${!p.in_stock ? `<span class="badge out">Sold out</span>` : onSale ? `<span class="badge">${pct(p)}% off</span>` : ""}</div>
    <div class="meta"><h3>${esc(p.name)}</h3>
      <div class="price">${priceHtml(p)}</div>
      ${p.sizes.length ? `<div class="szs">${p.sizes.map((x) => (p.sizes_out.includes(x) ? `<s>${esc(x)}</s>` : esc(x))).join(" &middot; ")}</div>` : ""}
      ${p.colors.length ? `<div class="swatches">${p.colors.map((c) => `<span class="sw" title="${esc(c.name)}" style="background:${esc(c.hex)}"></span>`).join("")}</div>` : ""}
    </div></a>`;
};

/* ---------- Pages ---------- */
function heroHtml(products) {
  const h = S.hero;
  // A banner photo chosen in /admin wins over the colour stage.
  if (h.image || !products.length) return `
  <section class="hero ${h.image ? "has-img" : ""}"${ed("hero")} ${h.image ? `style="background-image:url('${esc(h.image)}')"` : ""}>
    <div class="wrap hero-in fade">
      <span class="eyebrow">${esc(h.eyebrow)}</span>
      <h1>${esc(h.title)}</h1>
      <p>${esc(h.subtitle)}</p>
      <a class="btn" href="${esc(h.ctaLink)}">${esc(h.ctaText)}</a>
    </div>
  </section>`;
  const list = featuredFirst(products).slice(0, 8);
  const lines = h.title.split(/(?<=[.!?])\s+/).filter(Boolean);
  return `
  <section class="studio look" style="${lookVars(lookOf(list[0]))}"${ed("hero")}>
    ${[8, 31, 57, 78, 93].map((x, i) => `<span class="emblem petal" aria-hidden="true" style="left:${x}%;animation-delay:${i * 3.1}s"></span>`).join("")}
    <div class="wrap studio-in">
      <div class="studio-copy">
        <span class="eyebrow">${esc(h.eyebrow)}</span>
        <h1>${lines.map((t) => `<span><i>${esc(t)}</i></span>`).join(" ")}</h1>
        <p>${esc(h.subtitle)}</p>
        <div class="dots" role="group" aria-label="Choose a colour">${list.map((p) => `<button type="button" class="dot" style="${lookVars(lookOf(p))}" aria-label="${esc(p.name)}" title="${esc(p.name)}" data-name="${esc(p.name)}" data-href="${productUrl(p)}"><template>${priceHtml(p)}</template></button>`).join("")}</div>
        <a class="hero-info" id="heroInfo" href="${productUrl(list[0])}"><b></b><span></span><em>View &rarr;</em></a>
        <div class="studio-cta"><a class="btn" href="${esc(h.ctaLink)}">${esc(h.ctaText)}</a></div>
      </div>
      <div class="stage">
        <div class="rail"></div>
        <span class="emblem behind" aria-hidden="true"></span>
        ${list.map((p, i) => {
          const l = lookOf(p), at = i < 2 ? "src" : "data-src";
          return `<div class="hang${l ? "" : " photo"}">${l
            ? `<img class="front" ${at}="${l.front}" alt="${esc(p.name)}"><img class="back" ${at}="${l.back}" alt="${esc(p.name)}, back">`
            : `<img class="front" ${at}="${esc(img(p))}" alt="${esc(p.name)}">`}</div>`;
        }).join("")}
        <div class="lens" id="lens" aria-hidden="true"></div>
        <button type="button" class="flip" id="flip">See the back</button>
      </div>
    </div>
  </section>`;
}

function stackHtml(products) {
  const list = featuredFirst(products).slice(0, 6);
  if (!list.length) return "";
  return `
  <section class="wrap">
    <div class="stack-head rv">${emblem}<span class="eyebrow">The collection</span><h2>Pick your colour</h2></div>
    <div class="stack">${list.map((p, i) => {
      const l = lookOf(p), second = l ? l.detail : p.images?.[1] || img(p);
      return `<article class="stack-card look" style="--i:${i};${lookVars(l)}" data-id="${esc(p.id)}"><div class="stack-body"${ed("product", "", p.id)}>
        <div class="stack-text">
          <span class="num">${String(i + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}</span>
          <h3>${esc(p.name)}</h3>
          ${p.description ? `<p>${esc(p.description.split("\n")[0])}</p>` : ""}
          <div class="price">${priceHtml(p)}</div>
          ${p.sizes.length && p.in_stock ? `<div class="sizes-row"><small>Size</small>${sizeButtons(p)}</div>` : ""}
          <div class="hint" aria-live="polite"></div>
          <div class="stack-actions">${p.in_stock ? `<button type="button" class="btn wa" data-order>Order on WhatsApp</button>` : `<button type="button" class="btn" disabled>Sold out</button>`}<a class="link" href="${productUrl(p)}">Details</a></div>
        </div>
        <a class="stack-art${l ? "" : " photo"}" href="${productUrl(p)}" aria-label="${esc(p.name)}"><img loading="lazy" src="${esc(l ? l.front : img(p))}" alt="${esc(p.name)}"></a>
        <a class="stack-detail" href="${productUrl(p)}" tabindex="-1" aria-hidden="true"><img loading="lazy" src="${esc(second)}" alt=""></a>
      </div></article>`;
    }).join("")}</div>
    <p class="center" style="padding:24px 0 0"><a class="btn ghost" href="/shop">See everything</a></p>
  </section>`;
}

// Size choice and ordering straight from a card on the home page.
function wireStack(products) {
  document.querySelectorAll(".stack-card").forEach((c) => {
    const p = products.find((x) => x.id === c.dataset.id);
    if (!p) return;
    let size = sizesFree(p).length === 1 ? sizesFree(p)[0] : "";
    const mark = () => c.querySelectorAll(".size").forEach((x) => x.classList.toggle("on", x.dataset.s === size));
    mark();
    Studio.on(c, "click", (e) => {
      const b = e.target.closest(".size");
      if (b) { size = b.dataset.s; mark(); $(".hint", c).textContent = ""; return; }
      if (!e.target.closest("[data-order]")) return;
      if (p.sizes.length && !size) return ask($(".sizes-row", c), $(".hint", c));
      window.open(waLink(orderMessage(p, size)), "_blank", "noopener");
    });
  });
}

function home(cats, products) {
  const words = [S.site.tagline, "Kashmiri embroidery", "A legacy of 120+ years", "Order on WhatsApp"];
  const run = words.map((w) => `<span>${esc(w)}${emblem}</span>`).join("");
  $("#app").innerHTML = `
  ${heroHtml(products)}
  <div class="ticker" aria-hidden="true"><div>${run}${run}${run}${run}</div></div>
  ${stackHtml(products)}
  <section class="section"><div class="wrap">
    <div class="story-head rv"${ed("story")}><span class="eyebrow">${esc(S.site.tagline)}</span><h2>${esc(S.story.title)}</h2><p>${esc(S.story.text)}</p></div>
    <div class="journey"><svg aria-hidden="true"><path class="t-base"/><path class="t-live"/></svg>
      ${S.journey.items.map((x, i) => `<div class="stop"${ed("journey", `items.${i}.`)}><div class="mark">${esc(x.mark)}</div><div class="say"><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div></div>`).join("")}
    </div>
    <p class="center"><a class="btn ghost" href="/about">Read the full story</a></p>
  </div></section>
  <section class="section alt"><div class="wrap promises">
    ${S.values.items.map((v, i) => `<div class="rv"${ed("values", `items.${i}.`)}>${emblem}<h3>${esc(v.title)}</h3><p>${esc(v.text)}</p></div>`).join("")}
  </div></section>`;
  document.title = `${S.site.name} · ${S.site.tagline}`;
  wireStack(products);
  Studio.hero(); Studio.stack(); Studio.thread();
}

function shop(cats, products) {
  const cat = cats.find((c) => c.slug === params.get("cat"));
  const list = cat ? products.filter((p) => p.category_id === cat.id) : products;
  $("#app").innerHTML = `<div class="wrap">
    <div class="page-head">${emblem}<span class="eyebrow">The collection</span><h1>${esc(cat ? cat.name : "Shop")}</h1></div>
    ${list.length || EDIT ? `<div class="grid spot">${list.map(card).join("")}${EDIT ? `<div class="card"${ed("newproduct")} style="align-self:start;aspect-ratio:3/4;border:2px dashed #b5838a;border-radius:6px;display:grid;place-items:center;text-align:center;color:#b5838a;font-size:20px;cursor:pointer">＋ Add product</div>` : ""}</div>` : `<p class="empty">Nothing here yet. Check back soon.</p>`}
    <div style="height:80px"></div></div>`;
  document.title = `${cat ? cat.name : "Shop"} · ${S.site.name}`;
  Studio.peek();
}

async function product(cats, products) {
  const p = await getProduct((location.pathname.split("/").filter(Boolean).pop() || "").replace(/\.html$/, ""));
  if (!p) { $("#app").innerHTML = `<div class="wrap"><p class="empty">Product not found. <a href="/shop" style="text-decoration:underline">Back to shop</a></p></div>`; return; }
  const cat = cats.find((c) => c.id === p.category_id);
  const onSale = p.sale_price && p.sale_price < p.price;
  const l = lookOf(p);
  const shots = (list) => list.map((u) => ({ src: u }));
  // With studio artwork: cut-out front, close-up, side, cut-out back, then any extra uploads.
  const studio = () => [{ src: l.front, cut: true }, ...shots(p.images.slice(1, 3)), { src: l.back, cut: true }, ...shots(p.images.slice(4))];
  const colourShots = p.colors.find((c) => c.images?.length)?.images;
  let gal = colourShots ? shots(colourShots) : l ? studio() : shots(p.images.length ? p.images : [img(p)]); // gallery follows the chosen colour
  const wanted = params.get("size");
  let cur = 0, colour = p.colors.length === 1 ? p.colors[0].name : p.colors.length ? "" : "n/a";
  let size = !p.sizes.length ? "n/a" : sizesFree(p).includes(wanted) ? wanted : sizesFree(p).length === 1 ? sizesFree(p)[0] : "";
  const others = products.filter((x) => x.id !== p.id).slice(0, 8);

  $("#app").innerHTML = `<div class="wrap look" style="${lookVars(l)}">
    <div class="crumbs"><a href="/shop">Shop</a>${cat ? ` / <a href="/shop?cat=${esc(cat.slug)}">${esc(cat.name)}</a>` : ""}</div>
    <div class="pdp"${ed("product", "", p.id)}>
      <div class="gallery"><div class="main${Studio.canHover ? " zoom" : ""}" id="frame"><img id="main" alt="${esc(p.name)}"></div>
        <div class="thumbs" id="thumbs"></div>
      </div>
      <div class="info">
        <div><h1 style="font-size:clamp(34px,4.4vw,54px)">${esc(p.name)}</h1></div>
        <div class="price">${priceHtml(p)}${onSale ? ` <span class="pill">${pct(p)}% off</span>` : ""}</div>${p.price && (p.shipping_note || S.site.shippingNote) ? `<div class="ship">${esc(p.shipping_note || S.site.shippingNote)}</div>` : ""}
        ${onSale && p.sale_label ? `<div class="sale-note">${esc(p.sale_label)}</div>` : ""}
        ${p.description ? `<div class="details">${paras(p.description)}</div>` : ""}
        <div class="wave" aria-hidden="true"></div>
        ${p.colors.length ? `<div class="opt"><h4>Colour</h4><div class="row" id="colours">${p.colors.map((c) => `<button class="cdot ${p.colors.length === 1 ? "on" : ""}" data-n="${esc(c.name)}"><i style="background:${esc(c.hex)}"></i>${esc(c.name)}</button>`).join("")}</div></div>` : ""}
        ${p.sizes.length ? `<div class="opt"><h4>Size</h4><div class="row" id="sizes">${sizeButtons(p)}</div></div>` : ""}
        <div class="hint" id="hint" aria-live="polite"></div>
        ${p.in_stock ? `<button class="btn wa" id="order"${ed("whatsapp", "template")}>Order on WhatsApp</button>` : `<button class="btn" disabled>Sold out</button><a class="btn ghost" id="ask"${ed("whatsapp", "number")} target="_blank" rel="noopener">Ask about restock</a>`}
        <a class="link" href="/size-guide" style="justify-self:center">Need help with size?</a>
        ${p.details ? `<div class="details"><h4 class="eyebrow" style="margin-bottom:8px">Details</h4><ul>${p.details.split("\n").filter(Boolean).map((d) => `<li>${esc(d)}</li>`).join("")}</ul></div>` : ""}
      </div>
    </div>
    ${others.length ? `<div class="more rv"><span class="eyebrow">More from the collection</span><div class="more-row">${others.map((x) => { const o = lookOf(x); return `<a class="look" style="${lookVars(o)}" href="${productUrl(x)}"><i><img loading="lazy" class="${o ? "cut" : ""}" src="${esc(o ? o.front : img(x))}" alt=""></i>${esc(x.name)}</a>`; }).join("")}</div></div>` : ""}
    </div>
    ${p.in_stock ? `<div class="buybar" id="buybar"><div class="price"><span>${priceHtml(p)}</span><small id="barsize"></small></div><button type="button" class="btn wa" id="order2">Order on WhatsApp</button></div>` : ""}`;

  const frame = $("#frame");
  const show = (i) => {
    cur = i;
    $("#main").src = gal[cur]?.src || img(p);
    frame.classList.toggle("cut", !!gal[cur]?.cut);
    document.querySelectorAll("#thumbs button").forEach((x, n) => x.classList.toggle("on", n === cur));
  };
  const drawThumbs = () => {
    $("#thumbs").innerHTML = gal.length > 1 ? gal.map((g, i) => `<button data-i="${i}" class="${g.cut ? "cut" : ""}" aria-label="Photo ${i + 1}"><img src="${esc(g.src)}" alt=""></button>`).join("") : "";
  };
  drawThumbs(); show(0);
  Studio.on($("#thumbs"), "click", (e) => { const b = e.target.closest("button"); if (b) show(+b.dataset.i); });
  let x0 = null;
  Studio.on(frame, "touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
  Studio.on(frame, "touchend", (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show((cur + (dx < 0 ? 1 : -1) + gal.length) % gal.length); x0 = null; });
  if (Studio.canHover) {
    Studio.on(frame, "pointermove", (e) => { const r = frame.getBoundingClientRect(); $("#main").style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`; frame.classList.add("zooming"); });
    Studio.on(frame, "pointerleave", () => frame.classList.remove("zooming"));
  }

  const markSize = () => {
    document.querySelectorAll("#sizes .size").forEach((x) => x.classList.toggle("on", x.dataset.s === size));
    const note = $("#barsize"); if (note && p.sizes.length) note.textContent = size ? `Size ${size}` : "Choose a size";
  };
  markSize();
  $("#sizes")?.addEventListener("click", (e) => {
    if (!e.target.dataset.s) return; size = e.target.dataset.s; $("#hint").textContent = ""; markSize();
  });
  $("#colours")?.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return; colour = b.dataset.n; $("#hint").textContent = "";
    const imgs = p.colors.find((c) => c.name === colour)?.images;
    if (imgs?.length) { gal = shots(imgs); drawThumbs(); show(0); }
    document.querySelectorAll("#colours .cdot").forEach((x) => x.classList.toggle("on", x === b));
  });
  const order = () => {
    const missing = p.sizes.length && !size ? ["#sizes", "Please choose your size first."] : !colour ? ["#colours", "Please choose a colour first."] : null;
    if (missing) { ask($(missing[0]), $("#hint"), missing[1]); $(missing[0]).scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    window.open(waLink(orderMessage(p, size, colour)), "_blank", "noopener");
  };
  $("#order")?.addEventListener("click", order);
  $("#order2")?.addEventListener("click", order);
  if ($("#buybar") && !EDIT) {
    document.body.classList.add("has-buybar");
    Studio.observe([$("#order")], (e) => $("#buybar").classList.toggle("show", !e.isIntersecting));
  }
  const restock = $("#ask");
  if (restock) restock.href = waLink(`Hi AYLIN! Is "${p.name}" coming back in stock?\n${new URL(productUrl(p), location.href).href}`);
  document.title = `${p.name} · ${S.site.name}`;
}

function about() {
  $("#app").innerHTML = `<div class="wrap section">
    <div class="split solo">
      <div class="txt"${ed("about")}><span class="eyebrow">Our story</span><h1 style="color:var(--ink);font-size:clamp(32px,4.5vw,54px)">${esc(S.about.title)}</h1>${paras(S.about.body)}</div>
    </div></div>`;
  document.title = `Our story · ${S.site.name}`;
}

function contact() {
  const c = S.contact;
  $("#app").innerHTML = `<div class="wrap section">
    <div class="section-head"><span class="eyebrow">We'd love to hear from you</span><h1>Contact</h1></div>
    <div class="contact-grid">
      <div${ed("whatsapp", "number,generalMessage")}><h3>WhatsApp</h3><a href="${waLink(S.whatsapp.generalMessage)}" target="_blank" rel="noopener">${esc(S.whatsapp.number)}</a></div>
      <div${ed("social")}><h3>Instagram</h3><a href="${esc(S.social.instagram)}" target="_blank" rel="noopener">@theaylinlabel</a></div>
      ${c.email ? `<div${ed("contact")}><h3>Email</h3><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div>` : ""}
    </div>
    <p class="center" style="margin-top:36px"><a class="btn wa"${ed("whatsapp", "generalMessage")} href="${waLink(S.whatsapp.generalMessage)}" target="_blank" rel="noopener">Chat on WhatsApp</a></p></div>`;
  document.title = `Contact · ${S.site.name}`;
}

function policies() {
  const map = { shipping: ["Shipping", S.policies.shipping, "shipping"], returns: ["Returns & exchanges", S.policies.returns, "returns"], "size-guide": ["Size guide", S.policies.sizeGuide, "sizeGuide"] };
  const [title, body, field] = map[({ "/shipping": "shipping", "/returns": "returns", "/size-guide": "size-guide" }[location.pathname.replace(/\/$/, "")] || params.get("p"))] || map.shipping;
  $("#app").innerHTML = `<div class="wrap section"><div class="section-head"><span class="eyebrow">Help</span><h1>${esc(title)}</h1></div><div class="prose"${ed("policies", field)}>${paras(body)}</div></div>`;
  document.title = `${title} · ${S.site.name}`;
}

/* ---------- Boot ---------- */
(async () => {
try {
  if (page === "home" && !EDIT) Studio.intro("AYLIN"); // covers the short wait for shop data
  S = await getSettings();
  applyTheme();
  const [cats, products] = await Promise.all([getCategories(), getProducts()]);
  const render = async () => {
    Studio.reset();
    document.body.classList.remove("has-buybar");
    layout(cats);
    await ({ home: () => home(cats, products), shop: () => shop(cats, products), product: () => product(cats, products), about, contact, policies }[page])?.();
    Studio.reveal();
  };
  await render();
  if (EDIT) window.aylinRerender = (next) => { S = next; applyTheme(); return render(); };
} catch (e) {
  console.error(e);
  $("#app").innerHTML = `<p class="empty">Something went wrong loading the page. Please refresh.</p>`;
}
})();

/* Twinkling starfield for the midnight theme (from the coming-soon page) */
(function () {
  const c = document.createElement("canvas"); c.id = "sky"; c.setAttribute("aria-hidden", "true");
  document.body.prepend(c);
  const x = c.getContext("2d"); let w, h, stars;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function size() { w = c.width = innerWidth; h = c.height = innerHeight; stars = Array.from({ length: Math.floor(w * h / 9000) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.2 + .2, p: Math.random() * 6.28, s: Math.random() * .02 + .005 })); }
  size(); addEventListener("resize", size);
  (function draw() {
    x.clearRect(0, 0, w, h);
    if (document.documentElement.dataset.theme === "midnight") {
      for (const s of stars) {
        if (!reduce) { s.p += s.s; s.y -= .03; if (s.y < 0) s.y = h; }
        x.globalAlpha = .25 + .55 * Math.abs(Math.sin(s.p));
        x.fillStyle = "#dfe3ea";
        x.beginPath(); x.arc(s.x, s.y, s.r, 0, 6.28); x.fill();
      }
    }
    requestAnimationFrame(draw);
  })();
})();
