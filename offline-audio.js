/* offline-audio.js — تنزيل التلاوات وتشغيلها دون إنترنت (IndexedDB) */
(function () {
  "use strict";
  const AYAH_COUNTS = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
  const DB = "quran-audio", STORE = "clips";
  let dbp = null, token = 0, lastBlobUrl = null, abortCtl = null;

  const openDB = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: "k" });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  }));
  async function run(mode, fn) {
    const db = await openDB();
    return new Promise((res, rej) => {
      const t = db.transaction(STORE, mode);
      const req = fn(t.objectStore(STORE));
      t.oncomplete = () => res(req && "result" in req ? req.result : undefined);
      t.onerror = t.onabort = () => rej(t.error);
    });
  }

  const pad3 = (n) => String(n).padStart(3, "0");
  const prefix = (f, s) => f + "|" + s + "|";
  const range = (f, s) => IDBKeyRange.bound(prefix(f, s), prefix(f, s) + "\uffff");
  const urlFor = (f, s, a) => "https://everyayah.com/data/" + f + "/" + pad3(s) + pad3(a) + ".mp3";

  function folderFor(readerId) {
    const map = typeof READER_SOURCES !== "undefined" ? READER_SOURCES : null;
    if (!map) return null;
    const info = map[readerId];
    if (!info) return "Alafasy_128kbps";               // نفس الافتراضي في التطبيق
    if (info.source === "everyayah") return info.id;
    if (readerId === "ar.alafasy") return "Alafasy_128kbps";
    return null;
  }
  function curReader() {
    const rs = document.getElementById("readerSelect");
    return typeof getSettings === "function" ? getSettings().reader : rs && rs.value;
  }

  /* ===== التشغيل: من التخزين المحلي إن وُجد وإلا من الإنترنت ===== */
  async function setSource(audio, url, readerId, surah, ayah) {
    const my = ++token;
    let src = url;
    try {
      const f = folderFor(readerId);
      if (f && window.indexedDB) {
        const rec = await run("readonly", (st) => st.get(prefix(f, surah) + ayah));
        if (rec && rec.blob) src = URL.createObjectURL(rec.blob);
      }
    } catch (e) {}
    if (my !== token) { if (src !== url) URL.revokeObjectURL(src); return false; }
    const old = lastBlobUrl;
    lastBlobUrl = src !== url ? src : null;
    audio.src = src;
    if (old) setTimeout(() => URL.revokeObjectURL(old), 3000);
    return true;
  }

  /* ===== التنزيل ===== */
  async function fetchBlob(u, signal, tries) {
    for (let i = 1; ; i++) {
      try {
        const r = await fetch(u, { signal });
        if (!r.ok) throw new Error("HTTP " + r.status);
        return await r.blob();
      } catch (e) {
        if (signal.aborted || i >= tries) throw e;
        await new Promise((r) => setTimeout(r, 700 * i));
      }
    }
  }
  async function downloadSurah(readerId, surah, onProgress, signal) {
    const f = folderFor(readerId);
    if (!f) throw new Error("القارئ غير مدعوم");
    const total = AYAH_COUNTS[surah - 1];
    let next = 1, done = 0, failed = 0;
    const worker = async () => {
      while (!signal.aborted) {
        const a = next++;
        if (a > total) return;
        const key = prefix(f, surah) + a;
        try {
          if (!(await run("readonly", (st) => st.getKey(key)))) {
            const blob = await fetchBlob(urlFor(f, surah, a), signal, 3);
            await run("readwrite", (st) => st.put({ k: key, f, s: surah, size: blob.size, blob }));
          }
          done++;
        } catch (e) { if (signal.aborted) return; failed++; }
        onProgress(done, failed, total);
      }
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
    return { done, failed, total, aborted: signal.aborted };
  }
  async function stats(f) {
    const out = {};
    const db = await openDB();
    await new Promise((res, rej) => {
      const t = db.transaction(STORE, "readonly");
      const rq = t.objectStore(STORE).openCursor();
      rq.onsuccess = () => {
        const c = rq.result;
        if (!c) return;
        const v = c.value;
        if (v.f === f) { const o = out[v.s] || (out[v.s] = { n: 0, size: 0 }); o.n++; o.size += v.size || 0; }
        c.continue();
      };
      t.oncomplete = res; t.onerror = t.onabort = () => rej(t.error);
    });
    return out;
  }
  const delSurah = (f, s) => run("readwrite", (st) => st.delete(range(f, s)));
  const clearAll = () => run("readwrite", (st) => st.clear());

  /* ===== الواجهة ===== */
  const mb = (b) => (b / 1048576).toFixed(b > 10485760 ? 0 : 1) + " MB";
  function readerName(id) {
    const rs = document.getElementById("readerSelect");
    if (rs) for (const o of rs.options) if (o.value === id) return o.textContent.trim();
    return id || "";
  }
  function surahName(n) {
    const el = document.getElementById("searchSurah");
    if (el && el.options) for (const o of el.options) if (String(o.value) === String(n)) return o.textContent.trim();
    return "سورة " + n;
  }

  function buildUI() {
    const st = document.createElement("style");
    st.textContent =
      "#oaBtn{position:fixed;left:10px;top:calc(50% - 132px);z-index:99998;width:44px;height:44px;border-radius:50%;padding:0;font-size:20px;background:rgba(0,0,0,.25);border:1px solid rgba(212,175,55,.4);color:rgba(255,215,0,.85);opacity:.6;touch-action:manipulation}" +
      "#oaBtn:active{opacity:1}" +
      "#oaSheet{position:fixed;left:0;right:0;bottom:0;max-height:75vh;overflow:auto;z-index:100000;background:#10161a;color:#f3e7b3;border-top:2px solid #d4af37;border-radius:16px 16px 0 0;padding:14px;direction:rtl;transform:translateY(105%);transition:transform .25s;font-size:15px}" +
      "#oaSheet.open{transform:none}" +
      "#oaSheet button{background:rgba(212,175,55,.15);color:#ffd700;border:1px solid rgba(212,175,55,.5);border-radius:10px;padding:8px 14px;font-size:15px}" +
      "#oaSheet input{width:80px;padding:8px;border-radius:8px;border:1px solid rgba(212,175,55,.5);background:#0b0f12;color:#fff;font-size:16px;text-align:center}" +
      ".oa-head,.oa-row,.oa-item{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:8px 0}" +
      ".oa-bar{height:8px;border-radius:6px;background:rgba(255,255,255,.1);overflow:hidden;margin:10px 0}" +
      "#oaFill{display:block;height:100%;width:0;background:#d4af37;transition:width .2s}" +
      ".oa-sub{margin-top:14px;opacity:.8}";
    document.head.appendChild(st);

    const btn = document.createElement("button");
    btn.id = "oaBtn"; btn.textContent = "⬇"; btn.setAttribute("aria-label", "تنزيل التلاوات");
    const sheet = document.createElement("div");
    sheet.id = "oaSheet";
    sheet.innerHTML =
      '<div class="oa-head"><b>🎧 التلاوات دون إنترنت</b><button id="oaClose">✕</button></div>' +
      '<div id="oaReader"></div>' +
      '<div class="oa-row"><span>رقم السورة</span><input id="oaNum" type="number" min="1" max="114" inputmode="numeric"><button id="oaGo">تنزيل</button></div>' +
      '<div id="oaName"></div>' +
      '<div class="oa-bar"><i id="oaFill"></i></div><div id="oaMsg"></div>' +
      '<div class="oa-sub">المحمَّل لهذا القارئ <span id="oaTotal"></span></div>' +
      '<div id="oaList"></div>' +
      '<div class="oa-row"><button id="oaClear">حذف كل التلاوات المحمّلة</button></div>';
    document.body.append(btn, sheet);

    const $ = (id) => document.getElementById(id);
    let busy = false;

    async function refresh() {
      const rid = curReader(), f = folderFor(rid);
      $("oaReader").textContent = "القارئ: " + readerName(rid);
      $("oaName").textContent = surahName(parseInt($("oaNum").value, 10) || 1);
      const list = $("oaList"); list.textContent = "";
      if (!f) { $("oaMsg").textContent = "هذا القارئ غير مدعوم للتنزيل حالياً"; $("oaGo").disabled = true; return; }
      $("oaGo").disabled = false;
      const s = await stats(f);
      const keys = Object.keys(s).map(Number).sort((a, b) => a - b);
      let total = 0;
      keys.forEach((n) => {
        total += s[n].size;
        const row = document.createElement("div"); row.className = "oa-item";
        const lab = document.createElement("span");
        lab.textContent = surahName(n) + " — " + s[n].n + "/" + AYAH_COUNTS[n - 1] +
          (s[n].n >= AYAH_COUNTS[n - 1] ? " ✓" : "") + " · " + mb(s[n].size);
        const d = document.createElement("button"); d.textContent = "🗑";
        d.onclick = async () => { await delSurah(f, n); refresh(); };
        row.append(lab, d); list.appendChild(row);
      });
      $("oaTotal").textContent = "(" + mb(total) + ")";
      if (!keys.length) list.textContent = "لا شيء محمَّل بعد";
    }

    btn.onclick = () => {
      const open = sheet.classList.toggle("open");
      if (open) {
        if (!busy) $("oaNum").value = typeof currentSurah !== "undefined" ? currentSurah : 1;
        refresh();
      }
    };
    $("oaClose").onclick = () => sheet.classList.remove("open");
    $("oaNum").oninput = () => { $("oaName").textContent = surahName(parseInt($("oaNum").value, 10) || 1); };
    $("oaClear").onclick = async () => {
      if (busy || !confirm("حذف كل التلاوات المحمّلة؟")) return;
      await clearAll(); refresh();
    };
    $("oaGo").onclick = async () => {
      if (busy) { abortCtl.abort(); return; }
      const n = Math.min(114, Math.max(1, parseInt($("oaNum").value, 10) || 1));
      busy = true; abortCtl = new AbortController();
      $("oaGo").textContent = "إلغاء"; $("oaMsg").textContent = ""; $("oaFill").style.width = "0";
      try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
      try {
        const r = await downloadSurah(curReader(), n, (d, x, t) => {
          $("oaFill").style.width = ((d + x) / t * 100) + "%";
          $("oaMsg").textContent = d + " / " + t + (x ? "  (فشل " + x + ")" : "");
        }, abortCtl.signal);
        $("oaMsg").textContent = r.aborted ? "أُلغي التنزيل"
          : r.failed ? "اكتمل مع فشل " + r.failed + " — أعد المحاولة" : "تم التنزيل ✓";
      } catch (e) { $("oaMsg").textContent = "تعذّر التنزيل: " + e.message; }
      busy = false; $("oaGo").textContent = "تنزيل"; refresh();
    };
  }

  window.OfflineAudio = { setSource, downloadSurah, stats };
  if (document.body) buildUI(); else document.addEventListener("DOMContentLoaded", buildUI);
})();
