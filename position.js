/* position.js — حفظ آخر موضع قراءة + حجم خط الآيات */
var _store = null;
var _prefsReady = false;
var _currentPos = { surah: 1, ayah: 1 };
var _saveTimer = null;
var _io = null;
var MIN_FONT = 16, MAX_FONT = 48;
var _fontSize = 24;

// ===== التخزين =====
async function _initStore() {
  if (_prefsReady) return;
  try {
    if (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.Preferences) {
      var P = Capacitor.Plugins.Preferences;
      _store = {
        async set(k, v) { await P.set({ key: k, value: JSON.stringify(v) }); },
        async get(k, def) {
          var r = await P.get({ key: k });
          return r.value ? JSON.parse(r.value) : (def !== undefined ? def : null);
        }
      };
      console.log("✅ Preferences جاهز (Native)");
    } else {
      throw new Error("no preferences");
    }
  } catch (e) {
    _store = {
      async set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
      async get(k, def) {
        try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : (def !== undefined ? def : null); }
        catch (e) { return def; }
      }
    };
    console.log("✅ localStorage جاهز (Web)");
  }
  _prefsReady = true;
}

// ===== مراقب الآيات =====
function _initObserver() {
  if (_io) return;
  if (!("IntersectionObserver" in window)) return;
  _io = new IntersectionObserver(function(entries) {
    var visible = entries
      .filter(function(e) { return e.isIntersecting; })
      .sort(function(a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; })[0];
    if (!visible) return;
    var el = visible.target;
    if (!el.dataset.surah || !el.dataset.ayah) return;
    _currentPos = {
      surah: parseInt(el.dataset.surah),
      ayah: parseInt(el.dataset.ayah)
    };
    if (_saveTimer) clearTimeout(_saveTimer);
    _saveTimer = setTimeout(function() {
      if (_store) _store.set("lastPos", _currentPos);
    }, 500);
  }, { threshold: 0.6 });
}

function observeAyat() {
  _initObserver();
  if (!_io) return;
  document.querySelectorAll(".ayah").forEach(function(el) {
    if (el.dataset.surah && el.dataset.ayah) _io.observe(el);
  });
  console.log("👁️ مراقبة " + document.querySelectorAll(".ayah").length + " آية");
}

// ===== حفظ عند الخروج =====
async function _saveOnExit() {
  if (_store) await _store.set("lastPos", _currentPos);
}

if (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.App) {
  Capacitor.Plugins.App.addListener("pause", _saveOnExit);
}
document.addEventListener("visibilitychange", function() {
  if (document.hidden) _saveOnExit();
});

// ===== استعادة الموضع =====
async function _restorePosition() {
  if (!_store) await _initStore();
  var pos = await _store.get("lastPos");
  if (!pos || !pos.surah) return;
  console.log("📂 استعادة الموضع:", pos);
  if (typeof loadSurah === "function") {
    await loadSurah(pos.surah);
    setTimeout(function() {
      var target = document.querySelector('.ayah[data-surah="' + pos.surah + '"][data-ayah="' + pos.ayah + '"]');
      if (target) {
        target.scrollIntoView({ block: "center", behavior: "smooth" });
        target.classList.add("active");
        console.log("✅ تم الانتقال إلى الآية " + pos.ayah);
      }
    }, 800);
  }
}

// ===== حجم الخط =====
function applyFont(px) {
  _fontSize = Math.min(MAX_FONT, Math.max(MIN_FONT, px));
  document.documentElement.style.setProperty("--ayah-size", _fontSize + "px");
  console.log("📏 حجم الخط: " + _fontSize + "px");
}

async function _saveFont() {
  if (_store) await _store.set("fontSize", _fontSize);
}

// ===== التهيئة =====
(async function init() {
  await _initStore();
  var savedFont = await _store.get("fontSize", 24);
  applyFont(savedFont);

  var zoomIn = document.getElementById("zoom-in");
  var zoomOut = document.getElementById("zoom-out");
  if (zoomIn) zoomIn.onclick = function() { applyFont(_fontSize + 2); _saveFont(); };
  if (zoomOut) zoomOut.onclick = function() { applyFont(_fontSize - 2); _saveFont(); };

  setTimeout(_restorePosition, 1500);
})();

// ===== إيماءة القرص بإصبعين =====
document.addEventListener("DOMContentLoaded", function() {
  var box = document.getElementById("mushafView");
  if (!box) return;
  var startDist = 0, startSize = 0;
  function dist(t) { return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }

  box.addEventListener("touchstart", function(e) {
    if (e.touches.length === 2) {
      startDist = dist(e.touches);
      startSize = _fontSize;
    }
  }, { passive: true });

  box.addEventListener("touchmove", function(e) {
    if (e.touches.length === 2 && startDist > 0) {
      e.preventDefault();
      applyFont(startSize * dist(e.touches) / startDist);
    }
  }, { passive: false });

  box.addEventListener("touchend", _saveFont);
});

// ===== إظهار أزرار A+/A- عند الدخول للسور =====
setInterval(function() {
  var fc = document.getElementById("fontControls");
  if (!fc) return;
  var mv = document.getElementById("mushafView");
  if (mv && mv.style.display !== "none" && mv.querySelectorAll(".ayah").length > 0) {
    fc.style.display = "flex";
  } else {
    fc.style.display = "none";
  }
}, 500);
