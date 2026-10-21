/* mushaf-zoom.js — تكبير/تصغير المصحف (نسخة نهائية) */
var MZ_SCALE = 1;
var MZ_MAX = 3.0;
var MZ_MIN = 1.0;
var ZOOM_BTNS = '#mz-in, #mz-out, #mz-reset';

console.log("🚀 mushaf-zoom.js بدأ التحميل");

// ===== إضافة CSS للأزرار =====
/* تم حذف addStyles */

// ===== إنشاء الأزرار (بدون خروج مبكر) =====
/* تم حذف MZ_createControls - A+/A- تقوم بالمهمة */

// ===== تطبيق التكبير =====
function MZ_apply() {
  var fc = document.getElementById("flipbookContainer");
  if (!fc) { console.log("❌ flipbookContainer غير موجود"); return; }
  fc.style.zoom = MZ_SCALE;
  console.log("🔍 تكبير المصحف: " + Math.round(MZ_SCALE * 100) + "%");
}

function MZ_zoomDelta(delta) {
  MZ_SCALE = Math.min(MZ_MAX, Math.max(MZ_MIN, MZ_SCALE + delta));
  localStorage.setItem("mushafZoom", MZ_SCALE.toString());
  MZ_apply();
  MZ_showToast();
}

function MZ_reset() {
  MZ_SCALE = 1;
  localStorage.setItem("mushafZoom", "1");
  MZ_apply();
  MZ_showToast();
}

function MZ_showToast() {
  var t = document.getElementById("prayerToast");
  if (!t) return;
  t.style.display = "block";
  t.textContent = "🔍 حجم المصحف: " + Math.round(MZ_SCALE * 100) + "%";
  clearTimeout(window._mzToastTimer);
  window._mzToastTimer = setTimeout(function() { t.style.display = "none"; }, 1500);
}

// ===== اعتراض أحداث اللمس على الأزرار (منع page-flip من إلغائها) =====
/* تم حذف اعتراض اللمس - لم نعد نحتاجه */

// ===== تنفيذ الأزرار عند pointerup =====
/* تم حذف pointerup */

// ===== مراقبة الـ flipbook =====
setInterval(function() {
  var fc = document.getElementById("flipbookContainer");
  var controls = document.getElementById("mushafZoomControls");
  if (!fc || !controls) return;
  
  var isMushafMode = (typeof MUSHAF_MODE !== "undefined") ? (MUSHAF_MODE === true) : (fc.offsetParent !== null ? fc.offsetHeight > 50 : false);
  var hasHeight = fc.offsetHeight > 50;
  var isVisible = fc.style.display !== "none";
  
  if (true) {
    controls.style.display = "flex";
    var saved = localStorage.getItem("mushafZoom");
    if (saved && saved !== "1" && MZ_SCALE === 1) {
      MZ_SCALE = parseFloat(saved) || 1;
      MZ_apply();
    }
  } else {
    controls.style.display = "none";
  }
}, 800);

// ===== التهيئة =====


// تصدير عالمي
window.MZ_zoomDelta = MZ_zoomDelta;
window.MZ_reset = MZ_reset;
window.MZ_apply = MZ_apply;
window.changeMushafZoom = MZ_zoomDelta;

// ===== أزرار تكبير المصحف (شفافة) =====
(function () {
  var css = document.createElement("style");
  css.textContent =
    "#mushafZoomControls{position:fixed;left:10px;top:50%;transform:translateY(-50%);" +
    "display:none;flex-direction:column;gap:10px;z-index:99999}" +
    "#mushafZoomControls button{width:44px;height:44px;border-radius:50%;padding:0;" +
    "font-size:22px;background:rgba(0,0,0,.25);border:1px solid rgba(212,175,55,.4);" +
    "color:rgba(255,215,0,.85);opacity:.6;touch-action:manipulation}" +
    "#mushafZoomControls button:active{opacity:1}";
  document.head.appendChild(css);

  function build() {
    if (document.getElementById("mushafZoomControls")) return;
    var box = document.createElement("div");
    box.id = "mushafZoomControls";
    box.innerHTML = '<button data-d="0.1">+</button>' +
                    '<button data-d="-0.1">−</button>' +
                    '<button data-d="0">⟲</button>';
    document.body.appendChild(box);
  }
  if (document.body) build();
  else document.addEventListener("DOMContentLoaded", build);

  var SEL = "#mushafZoomControls button";
  // امنع flipbook من التقاط لمسات الأزرار
  ["pointerdown", "touchstart", "mousedown"].forEach(function (t) {
    window.addEventListener(t, function (e) {
      if (e.target.closest && e.target.closest(SEL)) e.stopImmediatePropagation();
    }, true);
  });
  window.addEventListener("pointerup", function (e) {
    var b = e.target.closest && e.target.closest(SEL);
    if (!b) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    var d = parseFloat(b.dataset.d);
    MZ_handleZoom(d);
  }, true);
})();

// ===== الأزرار الشفافة تعمل في الوضعين، وإخفاء +A/-A الغامقة =====
function MZ_isMushaf() {
  if (typeof MUSHAF_MODE !== "undefined") return MUSHAF_MODE === true;
  var fc = document.getElementById("flipbookContainer");
  return !!fc && fc.offsetParent !== null && fc.offsetHeight > 50;
}
function MZ_findOrig(txt) {
  var els = document.querySelectorAll("button, div, span, a");
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    if (el.closest("#mushafZoomControls")) continue;
    if (el.textContent.trim() === txt) return el.closest("button") || el;
  }
  return null;
}
function MZ_handleZoom(d) {
  if (MZ_isMushaf()) { if (d === 0) MZ_reset(); else MZ_zoomDelta(d); return; }
  var b = MZ_findOrig(d > 0 ? "+A" : "-A");
  if (b) b.click();
}
(function () {
  var st = document.createElement("style");
  st.textContent = ".mz-orig-hidden{display:none!important}";
  document.head.appendChild(st);
  setInterval(function () {
    ["+A", "-A"].forEach(function (t) {
      var b = MZ_findOrig(t);
      if (b) b.classList.add("mz-orig-hidden");
    });
    var r = document.querySelector('#mushafZoomControls button[data-d="0"]');
    if (r) r.style.display = MZ_isMushaf() ? "" : "none";
  }, 500);
})();

function MZ_findOrig(txt) {
  var sign = txt.indexOf("+") >= 0 ? "+" : "-";
  var norm = function (s) {
    return s.replace(/[\s\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, "").replace("\u2212", "-");
  };
  var passes = ["button", "[role=button], a, div, span"];
  for (var p = 0; p < passes.length; p++) {
    var els = document.querySelectorAll(passes[p]);
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.closest("#mushafZoomControls")) continue;
      var t = norm(el.textContent);
      if (t === "A" + sign || t === sign + "A") return el;
    }
  }
  return null;
}
function MZ_handleZoom(d) {
  if (MZ_isMushaf()) { if (d === 0) MZ_reset(); else MZ_zoomDelta(d); return; }
  var b = MZ_findOrig(d > 0 ? "+A" : "-A");
  if (!b) return;
  (b.tagName === "BUTTON" ? b : (b.querySelector("button") || b)).click();
}
