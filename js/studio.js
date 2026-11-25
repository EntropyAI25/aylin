// Motion and interaction for the storefront: intro, colour hero, stacking cards, thread story.
const Studio = (() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  let ctl = new AbortController(), cleanups = [];

  // The admin preview re-renders the page often, so every listener and timer is dropped first.
  function reset() {
    ctl.abort(); ctl = new AbortController();
    cleanups.forEach((f) => f()); cleanups = [];
  }
  const on = (el, type, fn, opts = {}) => el.addEventListener(type, fn, { ...opts, signal: ctl.signal });
  const observe = (els, fn, opts) => {
    const io = new IntersectionObserver((list) => list.forEach((e) => fn(e, io)), opts);
    els.forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());
  };
  const onScroll = (fn) => {
    let queued = false;
    const run = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; if (!ctl.signal.aborted) fn(); }); };
    on(window, "scroll", run, { passive: true }); on(window, "resize", run);
    run();
  };

  /* ---------- Intro: a motif is stitched, then the name arrives letter by letter ---------- */
  function intro(name) {
    try { if (sessionStorage.getItem("aylin-intro")) return; sessionStorage.setItem("aylin-intro", "1"); } catch (e) { return; }
    if (reduce) return;
    const petals = (cx, cy, r) => [0, 60, 120, 180, 240, 300]
      .map((a) => `<path pathLength="1" transform="rotate(${a} ${cx} ${cy})" d="M${cx} ${cy}c-${r * .55} -${r * .35} -${r * .5} -${r} 0 -${r}s${r * .55} ${r * .65} 0 ${r}z"/>`).join("");
    const el = document.createElement("div");
    el.className = "intro";
    el.innerHTML = `<svg viewBox="0 0 160 200" aria-hidden="true">
        <path pathLength="1" d="M80 192C78 160 82 128 80 82"/>
        <path pathLength="1" d="M80 82C52 66 62 34 80 8c18 26 28 58 0 74z"/>
        <path pathLength="1" d="M80 84C66 62 40 58 24 66c10 20 32 30 56 18z"/>
        <path pathLength="1" d="M80 84c14-22 40-26 56-18-10 20-32 30-56 18z"/>
        <path pathLength="1" d="M80 128C66 122 54 116 46 108M80 128c14-6 26-12 34-20"/>
        ${petals(42, 105, 24)}${petals(118, 105, 24)}
        <path pathLength="1" d="M80 164c-18 4-36-4-44-18 20-4 36 2 44 18zM80 164c18 4 36-4 44-18-20-4-36 2-44 18z"/>
      </svg>
      <div class="intro-name" aria-label="${name.replace(/"/g, "")}">${[...name].map((c, i) => `<span style="--i:${i}">${c === "<" ? "" : c}</span>`).join("")}</div>
      <button type="button" class="intro-skip">Skip</button>`;
    document.body.append(el);
    const done = () => { el.classList.add("go"); setTimeout(() => el.remove(), 600); removeEventListener("keydown", done); };
    el.onclick = done;
    addEventListener("keydown", done);
    setTimeout(done, 1900);
  }

  /* ---------- Reveal on scroll ---------- */
  function reveal(root = document) {
    const els = [...root.querySelectorAll(".rv")];
    if (reduce || EDIT) return els.forEach((el) => el.classList.add("in"));
    observe(els, (e, io) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }, { rootMargin: "0px 0px -8% 0px" });
  }

  /* ---------- Hero: pick a colour, flip to the back, look closer ---------- */
  function hero() {
    const root = $(".studio");
    if (!root) return;
    const stage = $(".stage", root), looks = [...root.querySelectorAll(".hang")], dots = [...root.querySelectorAll(".dot")];
    const info = $("#heroInfo"), flip = $("#flip"), lens = $("#lens");
    let cur = 0, timer;
    const show = (i, byUser) => {
      cur = (i + looks.length) % looks.length;
      looks.forEach((l, n) => { l.classList.toggle("on", n === cur); l.classList.remove("flipped"); });
      dots.forEach((d, n) => { d.classList.toggle("on", n === cur); d.setAttribute("aria-pressed", n === cur); });
      const d = dots[cur];
      ["--tl", "--td", "--acc"].forEach((v) => root.style.setProperty(v, d.style.getPropertyValue(v)));
      info.href = d.dataset.href;
      $("b", info).textContent = d.dataset.name;
      $("span", info).innerHTML = d.querySelector("template").innerHTML;
      if (flip) { flip.hidden = !looks[cur].querySelector(".back"); flip.textContent = "See the back"; }
      // load the neighbours ahead of time so a change is instant
      [cur, cur + 1].forEach((n) => looks[n % looks.length].querySelectorAll("img[data-src]").forEach((im) => { im.src = im.dataset.src; delete im.dataset.src; }));
      if (byUser) stop();
    };
    const stop = () => { clearInterval(timer); timer = null; };
    dots.forEach((d, i) => on(d, "click", () => show(i, true)));
    if (flip) on(flip, "click", () => { stop(); const f = looks[cur].classList.toggle("flipped"); flip.textContent = f ? "See the front" : "See the back"; });
    show(0);
    if (!reduce && !EDIT && looks.length > 1) {
      let visible = true;
      timer = setInterval(() => { if (visible && !document.hidden) show(cur + 1); }, 4200);
      observe([root], (e) => (visible = e.isIntersecting));
      cleanups.push(stop);
    }

    // swipe between colours on touch screens
    let x0 = null;
    on(stage, "touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
    on(stage, "touchend", (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1), true); x0 = null; });

    // magnifying glass over the embroidery
    if (canHover && lens) {
      on(stage, "pointermove", (e) => {
        const hang = looks[cur], im = hang.querySelector(hang.classList.contains("flipped") ? ".back" : ".front");
        const r = im.getBoundingClientRect(), s = stage.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        const inside = x > r.width * .08 && x < r.width * .92 && y > r.height * .03 && y < r.height * .97;
        stage.classList.toggle("looking", inside);
        if (!inside) return;
        stop();
        const z = 2.4, half = lens.offsetWidth / 2;
        lens.style.left = `${e.clientX - s.left - half}px`; lens.style.top = `${e.clientY - s.top - half}px`;
        lens.style.backgroundImage = `url("${im.src}")`;
        lens.style.backgroundSize = `${r.width * z}px ${r.height * z}px`;
        lens.style.backgroundPosition = `${half - x * z}px ${half - y * z}px`;
      });
      on(stage, "pointerleave", () => stage.classList.remove("looking"));
    }
  }

  /* ---------- Collection: cards slide over each other ---------- */
  function stack() {
    const cards = [...document.querySelectorAll(".stack-card")];
    if (!cards.length || reduce || EDIT) return;
    onScroll(() => {
      cards.forEach((c, i) => {
        const next = cards[i + 1];
        if (!next) return;
        const a = c.getBoundingClientRect(), b = next.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, 1 - (b.top - a.top) / a.height));
        c.firstElementChild.style.transform = `scale(${1 - p * .06})`;
        c.firstElementChild.style.filter = p > .01 ? `brightness(${1 - p * .22})` : "";
      });
    });
  }

  /* ---------- Story: a thread draws itself past each chapter ---------- */
  function thread() {
    const box = $(".journey");
    if (!box) return;
    const svg = $("svg", box), base = $(".t-base", svg), live = $(".t-live", svg), stops = [...box.querySelectorAll(".stop")];
    let len = 0, drawnFor = "";
    const build = () => {
      const w = box.clientWidth, h = box.clientHeight;
      if (drawnFor === `${w}x${h}`) return;
      drawnFor = `${w}x${h}`;
      const narrow = w < 700, mid = narrow ? 20 : w / 2, sway = narrow ? 12 : 46;
      let d = `M${mid} 0`, y = 0;
      stops.forEach((s, i) => {
        const ny = s.offsetTop + s.offsetHeight / 2, side = i % 2 ? 1 : -1;
        d += ` C${mid + sway * side} ${y + (ny - y) * .35} ${mid - sway * side} ${y + (ny - y) * .65} ${mid} ${ny}`;
        s.style.setProperty("--x", `${mid}px`);
        y = ny;
      });
      d += ` C${mid + sway} ${y + (h - y) * .35} ${mid - sway} ${y + (h - y) * .65} ${mid} ${h}`;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      base.setAttribute("d", d); live.setAttribute("d", d);
      len = live.getTotalLength();
      live.style.strokeDasharray = len;
    };
    onScroll(() => {
      build();
      const r = box.getBoundingClientRect();
      const p = reduce || EDIT ? 1 : Math.min(1, Math.max(0, (innerHeight * .65 - r.top) / r.height));
      live.style.strokeDashoffset = len * (1 - p);
      stops.forEach((s) => s.classList.toggle("lit", p * r.height >= s.offsetTop + s.offsetHeight / 2 - 4));
    });
    if (document.fonts) document.fonts.ready.then(() => { if (!ctl.signal.aborted) { drawnFor = ""; dispatchEvent(new Event("resize")); } });
  }

  /* ---------- Shop on touch screens: the card in the middle shows its embroidery ---------- */
  function peek() {
    if (canHover || reduce || EDIT) return;
    const cards = [...document.querySelectorAll(".card")];
    observe(cards, (e) => {
      clearTimeout(e.target.peekT);
      if (e.isIntersecting) e.target.peekT = setTimeout(() => e.target.classList.add("peek"), 900);
      else e.target.classList.remove("peek");
    }, { rootMargin: "-44% 0px -44% 0px" });
  }

  return { reset, on, observe, reveal, hero, stack, thread, peek, intro, canHover };
})();
