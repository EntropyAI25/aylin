// Removes the background from a product photo, entirely on this device (the photo is never sent anywhere).
// Library: onnxruntime-web (MIT). Model: BiRefNet_lite (MIT, github.com/ZhengPeng7/BiRefNet), 512px ONNX
// export from huggingface.co/studioludens/birefnet-lite-512 (MIT). Both are fetched from a public CDN on first
// use only. This file runs twice: in the page as window.Cutout, and as its own worker for the heavy work.
(() => {
  const ORT = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/";
  const MODEL = "https://huggingface.co/studioludens/birefnet-lite-512/resolve/962e67969ec6acec9c19fab76acee4f5e22e990c/onnx/model_fp16.onnx";
  const SIZE = 512, LIMIT = 880 * 1024, STALL = 300000;

  /* ---------- Worker: download the model, run it, clean the mask ---------- */
  if (typeof document === "undefined") {
    let session, ep;
    const status = (text) => postMessage({ text });

    async function modelBytes() {
      let cache;
      try { cache = await caches.open("cutout-model"); const hit = await cache.match(MODEL); if (hit) return new Uint8Array(await hit.arrayBuffer()); } catch {}
      const res = await fetch(MODEL);
      if (!res.ok) throw new Error(`Model download failed (${res.status}).`);
      const total = +res.headers.get("content-length") || 98484532, reader = res.body.getReader(), parts = [];
      for (let got = 0, shown = -1; ;) {
        const { done, value } = await reader.read();
        if (done) break;
        parts.push(value);
        const pct = Math.min(99, Math.floor((got += value.length) / total * 100));
        if (pct !== shown) status(`Downloading the tool, first time only: ${(shown = pct)}% of ${Math.round(total / 1e6)} MB`);
      }
      const blob = new Blob(parts);
      try { await cache.put(MODEL, new Response(blob, { headers: { "content-length": String(blob.size) } })); } catch {}
      return new Uint8Array(await blob.arrayBuffer());
    }

    async function load(gpu) {
      ep = "wasm";
      try { if (gpu && (await navigator.gpu.requestAdapter()).features.has("shader-f16")) ep = "webgpu"; } catch {}
      status("Starting the background remover…");
      importScripts(ORT + (ep === "webgpu" ? "ort.webgpu.min.js" : "ort.wasm.min.js"));
      ort.env.wasm.wasmPaths = ORT;
      ort.env.logLevel = "error";
      const bytes = await modelBytes();
      status("Preparing…");
      return ort.InferenceSession.create(bytes, { executionProviders: [ep] });
    }

    const n = SIZE * SIZE, label = new Int32Array(n), stack = new Int32Array(n);
    // Labels each connected patch of foreground (on) or background; `edge` says which patches reach the border.
    function flood(a, on, topCounts = true) {
      label.fill(0);
      const areas = [0], edge = [false];
      for (let s = 0; s < n; s++) {
        if (label[s] || (a[s] > 0.5) !== on) continue;
        const id = areas.length;
        let top = 0, area = 0, border = false;
        const add = (j) => { if (!label[j] && (a[j] > 0.5) === on) { label[j] = id; stack[top++] = j; } };
        add(s);
        while (top) {
          const i = stack[--top], x = i % SIZE, y = (i / SIZE) | 0;
          area++;
          if (!x || (!y && topCounts) || x === SIZE - 1 || y === SIZE - 1) border = true;
          if (x) add(i - 1);
          if (x < SIZE - 1) add(i + 1);
          if (y) add(i - SIZE);
          if (y < SIZE - 1) add(i + SIZE);
        }
        areas.push(area); edge.push(border);
      }
      return { areas, edge };
    }
    function grow(m, r) {
      for (let k = 0; k < r; k++) {
        const p = m.slice();
        for (let i = 0; i < n; i++) if (!p[i] && ((i % SIZE && p[i - 1]) || (i % SIZE < SIZE - 1 && p[i + 1]) || p[i - SIZE] || p[i + SIZE])) m[i] = 1;
      }
      return m;
    }

    // alpha: 0..1 probabilities. Drops stray specks, closes pinholes and makes the inside fully solid.
    function clean(a) {
      const fg = flood(a, true), biggest = fg.areas.reduce((m, v) => Math.max(m, v), 0);
      if (biggest < n * 0.02) return null;
      // Keep the garment and anything sizeable, plus the soft pixels right next to it.
      const keep = new Uint8Array(n);
      for (let i = 0; i < n; i++) keep[i] = label[i] && fg.areas[label[i]] > biggest * 0.03 ? 1 : 0;
      grow(keep, 3);
      for (let i = 0; i < n; i++) if (!keep[i]) a[i] = 0;
      const bg = flood(a, false);
      for (let i = 0; i < n; i++) if (label[i] && !bg.edge[label[i]] && bg.areas[label[i]] < biggest * 0.005) a[i] = 1;
      const outside = grow(Uint8Array.from(a, (v) => (v < 0.5 ? 1 : 0)), 3);
      for (let i = 0; i < n; i++) if (!outside[i]) a[i] = 1;
      return a;
    }

    // For the close look at the hanger: how much to cut out of each sizeable patch of wall that is
    // closed in on the sides and below (it may run off the top). Nothing else is touched.
    function holes(a) {
      const bg = flood(a, false, false);
      const m = grow(Uint8Array.from(label, (l) => (l && !bg.edge[l] && bg.areas[l] > n * 0.005 ? 1 : 0)), 3);
      return a.map((v, i) => (m[i] ? 1 - v : 0));
    }

    onmessage = async ({ data: { pixels, gpu, closeUp } }) => {
      try {
        session = session || (await load(gpu));
        status(ep === "webgpu" ? "Removing the background…" : "Removing the background… this can take a minute");
        const input = new Float32Array(3 * SIZE * SIZE), mean = [0.485, 0.456, 0.406], std = [0.229, 0.224, 0.225];
        for (let i = 0; i < SIZE * SIZE; i++) for (let c = 0; c < 3; c++) input[c * SIZE * SIZE + i] = (pixels[i * 4 + c] / 255 - mean[c]) / std[c];
        const out = await session.run({ input_image: new ort.Tensor("float32", input, [1, 3, SIZE, SIZE]) });
        const raw = await out.output_image.getData(), alpha = new Float32Array(SIZE * SIZE);
        for (let i = 0; i < alpha.length; i++) alpha[i] = 1 / (1 + Math.exp(-raw[i]));
        // A broken GPU driver tends to answer with NaN instead of failing.
        if (alpha.some(Number.isNaN)) throw new Error("The model returned no result.");
        postMessage({ done: true, alpha: closeUp ? holes(alpha) : clean(alpha) });
      } catch (e) {
        postMessage({ error: String((e && e.message) || e), gpu: ep === "webgpu" });
      }
    };
    return;
  }

  /* ---------- Page ---------- */
  const SRC = document.currentScript.src;
  let worker, idle, useGPU = true, queue = Promise.resolve();

  const stop = () => { if (worker) worker.terminate(); worker = null; };

  function infer(pixels, onProgress, closeUp) {
    return new Promise((resolve, reject) => {
      worker = worker || new Worker(SRC);
      let timer;
      const fail = (detail, gpu) => {
        clearTimeout(timer);
        stop();
        console.warn("Cutout:", detail);
        if (gpu && useGPU) { useGPU = false; infer(pixels, onProgress, closeUp).then(resolve, reject); return; }
        reject(new Error("Could not remove the background on this device. Check the internet connection and try again, or choose Original."));
      };
      // No time limit on a slow download that keeps moving; only a long silence gives up.
      const wait = () => { clearTimeout(timer); timer = setTimeout(() => fail("no progress"), STALL); };
      worker.onerror = (e) => fail(e.message || "worker stopped", useGPU);
      worker.onmessage = ({ data }) => {
        if (data.text) { wait(); onProgress(data.text); }
        else if (data.done) { clearTimeout(timer); resolve(data.alpha); }
        else fail(data.error, data.gpu);
      };
      wait();
      worker.postMessage({ pixels, gpu: useGPU, closeUp });
    });
  }

  const canvas = (w, h) => Object.assign(document.createElement("canvas"), { width: w, height: h });
  const encode = (c, type, quality) => new Promise((done) => c.toBlob(done, type, quality));
  const rename = (file, blob) => new File([blob], `${file.name.replace(/\.[^.]*$/, "") || "photo"}.${blob.type.split("/")[1].replace("jpeg", "jpg")}`, { type: blob.type });

  // The photo on a canvas, the right way up and no longer than `max` pixels.
  async function draw(file, max, fill) {
    let img;
    try { img = await createImageBitmap(file, { imageOrientation: "from-image" }); }
    catch { throw new Error("This photo could not be opened. Please use a JPG, PNG or WebP picture."); }
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const c = canvas(Math.max(1, Math.round(img.width * k)), Math.max(1, Math.round(img.height * k)));
    const g = c.getContext("2d", { willReadFrequently: true });
    if (fill) { g.fillStyle = fill; g.fillRect(0, 0, c.width, c.height); }
    g.imageSmoothingQuality = "high";
    g.drawImage(img, 0, 0, c.width, c.height);
    img.close();
    return c;
  }

  // Encodes, lowering the quality and then the size until the upload API will take it.
  async function shrink(c, type, qualities) {
    for (;;) {
      for (const q of qualities) {
        const blob = await encode(c, type, q);
        if (!blob) throw new Error("This device could not save the edited photo.");
        if (blob.size <= LIMIT) return blob;
      }
      const small = canvas(Math.round(c.width * 0.85), Math.round(c.height * 0.85)), g = small.getContext("2d");
      g.imageSmoothingQuality = "high";
      g.drawImage(c, 0, 0, small.width, small.height);
      c = small;
    }
  }

  // Close-ups: the photo's top edge cuts through the hanger, and the model leaves the wall between its arms.
  // Starting from the top edge and from wall already removed, this spreads over wall-coloured pixels near the
  // top and stops at any edge (hanger, collar). `m` is the mask, `d` the photo, both RGBA of w x h.
  function clearTopWall(m, d, w, h) {
    const band = Math.round(h * 0.2), wall = [0, 0, 0];
    let samples = 0;
    for (let i = 0; i < w * band; i++) if (m[i * 4 + 3] < 20) { for (let c = 0; c < 3; c++) wall[c] += d[i * 4 + c]; samples++; }
    if (samples < w * band * 0.03) return; // not enough bare wall to know its colour
    for (let c = 0; c < 3; c++) wall[c] /= samples;
    const apart = (i, r, g, b) => Math.hypot(d[i * 4] - r, d[i * 4 + 1] - g, d[i * 4 + 2] - b);
    const seen = new Uint8Array(w * band), todo = [];
    for (let i = 0; i < w * band; i++) if (m[i * 4 + 3] < 20 || (i < w * 3 && apart(i, ...wall) < 40)) { seen[i] = 1; todo.push(i); }
    while (todo.length) {
      const i = todo.pop(), x = i % w;
      m[i * 4 + 3] = 0;
      for (const j of [x ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) {
        if (j < 0 || j >= w * band || seen[j] || apart(j, ...wall) > 40 || apart(j, d[i * 4], d[i * 4 + 1], d[i * 4 + 2]) > 10) continue;
        seen[j] = 1; todo.push(j);
      }
    }
    // Sweep up the thin pale rim left along the edges: a few pixels more, only where still close to the wall.
    const far = Math.max(2, Math.round(w / 300));
    for (let k = 0; k < far; k++) {
      const rim = [];
      for (let i = 0; i < w * band; i++) if (!seen[i] && apart(i, ...wall) < 55 && (seen[i - 1] || seen[i + 1] || seen[i - w] || seen[i + w])) rim.push(i);
      for (const i of rim) { seen[i] = 1; m[i * 4 + 3] = 0; }
    }
  }

  async function cut(file, onProgress) {
    onProgress("Reading the photo…");
    const photo = await draw(file, 1600), w = photo.width, h = photo.height;
    const small = canvas(SIZE, SIZE), sg = small.getContext("2d", { willReadFrequently: true });
    sg.imageSmoothingQuality = "high";
    const putMask = (values) => {
      const mask = sg.createImageData(SIZE, SIZE);
      for (let i = 0; i < values.length; i++) mask.data.set([255, 255, 255, Math.round(values[i] * 255)], i * 4);
      sg.putImageData(mask, 0, 0);
    };
    // Now and then the model sees nothing next to a rail and props; a second look at just the middle finds it.
    let alpha, left, span;
    for (const trim of [0, 0.15]) {
      left = Math.round(w * trim);
      span = w - left * 2;
      sg.drawImage(photo, left, 0, span, h, 0, 0, SIZE, SIZE);
      if ((alpha = await infer(sg.getImageData(0, 0, SIZE, SIZE).data, onProgress))) break;
    }
    if (!alpha) throw new Error("No garment was found in this photo. Try a clearer photo, or choose Original.");
    onProgress("Tidying the edges…");
    // Scale the mask up to the photo, then tighten the soft edge so no pale wall shows around it.
    putMask(alpha);
    const big = canvas(w, h), bg = big.getContext("2d", { willReadFrequently: true });
    bg.imageSmoothingQuality = "high";
    bg.drawImage(small, left, 0, span, h);
    // The wall seen through the hanger is often missed at this size, so look again, closely, at the top.
    let top = -1, bottom = 0, sum = 0, count = 0, first = 0, leftmost = SIZE, rightmost = 0;
    for (let i = 0; i < alpha.length; i++) {
      if (alpha[i] <= 0.5) continue;
      const y = (i / SIZE) | 0;
      if (top < 0) top = y;
      bottom = y;
      leftmost = Math.min(leftmost, i % SIZE); rightmost = Math.max(rightmost, i % SIZE);
      if (y === top) first++;
      if (y < top + 15) { sum += i % SIZE; count++; }
    }
    // Sized from the height or the width, whichever is larger: a tightly framed photo loses height.
    const tall = ((bottom - top) / SIZE) * h, wide = ((rightmost - leftmost) / SIZE) * span;
    const size = Math.max(tall * 0.25, wide * 0.34);
    // A garment running broadly off the top has no hanger to look through; a hanger touching the edge still does.
    if ((top > 1 || first < SIZE * 0.25) && size > 0) {
      // If the first look finds no wall behind the hanger, one more from a little further away.
      for (const zoom of [1, 1.35]) {
        const side = Math.min(w, h, Math.round(size * zoom));
        const x = Math.round(Math.min(w - side, Math.max(0, left + (sum / count / SIZE) * span - side / 2)));
        const y = Math.round(Math.max(0, (top / SIZE) * h - side * 0.1));
        sg.clearRect(0, 0, SIZE, SIZE);
        sg.drawImage(photo, x, y, side, side, 0, 0, SIZE, SIZE);
        try {
          const wall = await infer(sg.getImageData(0, 0, SIZE, SIZE).data, () => onProgress("Checking around the hanger…"), true);
          if (!wall.some((v) => v > 0.5)) continue;
          putMask(wall);
          bg.globalCompositeOperation = "destination-out";
          bg.drawImage(small, x, y, side, side);
        } catch {} // the first result is still good
        break;
      }
    }
    const m = bg.getImageData(0, 0, w, h).data, pg = photo.getContext("2d"), px = pg.getImageData(0, 0, w, h);
    // Where the photo's own frame cuts the garment off (a close-up), fade that edge like the studio artwork.
    const cutOff = (length, at) => {
      let solid = 0;
      for (let i = 0; i < length; i++) if (m[at(i) * 4 + 3] > 128) solid++;
      return solid > length * 0.15;
    };
    const fl = cutOff(h, (y) => y * w) ? w * 0.06 : 0, fr = cutOff(h, (y) => y * w + w - 1) ? w * 0.06 : 0;
    const fb = cutOff(w, (x) => (h - 1) * w + x) ? h * 0.08 : 0;
    if (fb) clearTopWall(m, px.data, w, h);
    const fade = (distance, size) => (size ? Math.min(1, distance / size) : 1);
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0, i = 3; y < h; y++) for (let x = 0; x < w; x++, i += 4) {
      const t = Math.min(1, Math.max(0, (m[i] / 255 - 0.3) / 0.6));
      const a = Math.round(t * t * (3 - 2 * t) * fade(x, fl) * fade(w - 1 - x, fr) * fade(h - 1 - y, fb) * px.data[i]);
      px.data[i] = a;
      if (a > 12) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    if (x1 < 0) throw new Error("No garment was found in this photo. Try a clearer photo, or choose Original.");
    pg.putImageData(px, 0, 0);
    const pad = Math.round(Math.max(x1 - x0, y1 - y0) * 0.02);
    const out = canvas(x1 - x0 + 1 + pad * 2, y1 - y0 + 1 + pad * 2);
    out.getContext("2d").drawImage(photo, x0, y0, x1 - x0 + 1, y1 - y0 + 1, pad, pad, x1 - x0 + 1, y1 - y0 + 1);
    onProgress("Saving…");
    // Browsers that cannot write WebP hand back a PNG instead.
    const webp = (await encode(canvas(1, 1), "image/webp")).type === "image/webp";
    return rename(file, await shrink(out, webp ? "image/webp" : "image/png", webp ? [0.92, 0.85, 0.78] : [1]));
  }

  window.Cutout = {
    // One photo at a time, so a phone never holds two runs in memory.
    remove(file, onProgress = () => {}) {
      const job = queue.then(() => { clearTimeout(idle); return cut(file, onProgress); });
      queue = job.catch(() => {}).then(() => { idle = setTimeout(stop, 60000); }); // then free the memory
      return job;
    },
    async fit(file) {
      if (file.size <= LIMIT) return file;
      return rename(file, await shrink(await draw(file, 2000, "#fff"), "image/jpeg", [0.88, 0.8, 0.72]));
    },
  };
})();
