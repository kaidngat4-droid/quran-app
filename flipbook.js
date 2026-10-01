/* flipbook.js - 3D flipbook with font-size zoom */
window.FLIPBOOK_INSTANCE = null;

function createFlipBookFromImages(images) {
  var container = document.getElementById("flipbookContainer");
  
  // ✅ إذا الحاوية غير موجودة (بعد destroy)، أنشئها
  if (!container) {
    console.log("⚠️ flipbookContainer غير موجود — إنشاء جديد");
    
    // ابحث عن mushafView كمرجع
    var mushafView = document.getElementById("mushafView");
    
    container = document.createElement("div");
    container.id = "flipbookContainer";
    container.style.cssText = "width:100%;height:calc(100vh - 180px);display:block;align-items:center;justify-content:center;background:#0f2027;padding:5px;box-sizing:border-box;overflow:hidden;";
    
    if (mushafView && mushafView.parentNode) {
      mushafView.parentNode.insertBefore(container, mushafView);
      console.log("✅ تم إنشاء flipbookContainer قبل mushafView");
    } else {
      document.body.appendChild(container);
      console.log("✅ تم إنشاء flipbookContainer في body");
    }
    
    // أعد الحصول عليه
    container = document.getElementById("flipbookContainer");
  }
  
  if (!container) {
    console.error("❌ لا يمكن إنشاء flipbookContainer");
    return null;
  }
  
  if (window.FLIPBOOK_INSTANCE) {
    try { window.FLIPBOOK_INSTANCE.destroy(); } catch (e) {}
    window.FLIPBOOK_INSTANCE = null;
    
    // ✅ بعد destroy، تحقق مرة أخرى
    container = document.getElementById("flipbookContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "flipbookContainer";
      container.style.cssText = "width:100%;height:calc(100vh - 180px);display:block;align-items:center;justify-content:center;background:#0f2027;padding:5px;box-sizing:border-box;overflow:hidden;";
      
      var mv = document.getElementById("mushafView");
      if (mv && mv.parentNode) {
        mv.parentNode.insertBefore(container, mv);
      } else {
        document.body.appendChild(container);
      }
      container = document.getElementById("flipbookContainer");
    }
  }
  
  container.innerHTML = "";
  
  if (typeof St === "undefined" || typeof St.PageFlip === "undefined") return null;

  var screenW = window.innerWidth;
  var screenH = window.innerHeight - 130;
  var ratio = 2 / 3;
  var bookH = screenH;
  var bookW = bookH * ratio;
  if (bookW > screenW * 0.85) { bookW = screenW * 0.85; bookH = bookW / ratio; }
  if (bookH > screenH) { bookH = screenH; bookW = bookH * ratio; }

  window.FLIPBOOK_INSTANCE = new St.PageFlip(container, {
    width: bookW,
    height: bookH,
    size: "fixed",
    minWidth: 200,
    maxWidth: 900,
    minHeight: 300,
    maxHeight: 1400,
    drawShadow: true,
    flippingTime: 700,
    usePortrait: true,
    startZIndex: 0,
    autoSize: true,
    maxShadowOpacity: 0.4,
    showCover: false,
    mobileScrollSupport: false,
    swipeDistance: 30,
    clickEventForward: true,
    useMouseEvents: true,
    showPageCorners: true
  });

  window.FLIPBOOK_INSTANCE.loadFromImages(images);
  window.FLIPBOOK_INSTANCE.on("flip", function (e) {
    if (typeof onFlipBookChange === "function") onFlipBookChange(e);
  });

  // ✅ طبّق حجم الخط الحالي (كبّر الصورة)
  setTimeout(applyFontSizeToMushaf, 500);

  return window.FLIPBOOK_INSTANCE;
}

/* ✅ تطبيق حجم الخط على صورة المصحف (تكبير) */
function applyFontSizeToMushaf() {
  var fontSize = 26; // افتراضي
  if (typeof getSettings === "function") {
    var s = getSettings();
    if (s.fontSize) fontSize = s.fontSize;
  }
  
  // حوّل حجم الخط (16-48) إلى نسبة تكبير (0.7 - 1.8)
  // 26 = 100% (الحجم العادي)
  var scale = 0.7 + (fontSize - 16) / 32 * 1.1;
  
  console.log("📖 تطبيق الحجم:", fontSize, "px → scale:", scale.toFixed(2));
  
  // طبّق على كل صور المصحف
  var images = document.querySelectorAll(".mushaf-page-img img, .page img");
  images.forEach(function (img) {
    img.style.transform = "scale(" + scale + ")";
    img.style.transformOrigin = "center center";
    img.style.transition = "transform 0.3s ease";
  });
}

/* ✅ تحديث فوري عند تغيير حجم الخط */
window.addEventListener("fontSizeChanged", function (e) {
  if (typeof MUSHAF_MODE !== "undefined" && MUSHAF_MODE) {
    applyFontSizeToMushaf();
  }
});

function flipBookGoTo(pageNum) {
  if (!window.FLIPBOOK_INSTANCE) return;
  try { window.FLIPBOOK_INSTANCE.turnToPage(pageNum - 1); } catch (e) {}
}

function flipBookNext() {
  if (!window.FLIPBOOK_INSTANCE) return;
  window.FLIPBOOK_INSTANCE.flipNext();
}

function flipBookPrev() {
  if (!window.FLIPBOOK_INSTANCE) return;
  window.FLIPBOOK_INSTANCE.flipPrev();
}

function onFlipBookChange(e) {
  var pageIndex = e.data + 1;
  if (typeof CURRENT_PAGE !== "undefined") CURRENT_PAGE = pageIndex;
  if (typeof preloadNearby === "function") preloadNearby(pageIndex);
  if (typeof checkJuzCompletionByPage === "function") checkJuzCompletionByPage(pageIndex);
  if (typeof updateBottomBar === "function" && typeof PAGES_DATA !== "undefined" && PAGES_DATA) {
    var pageData = PAGES_DATA[String(pageIndex)];
    if (pageData && pageData.length > 0) {
      var juz = pageData[0].juz || 1;
      var surahName = typeof getSurahNameFromKey === "function" ? getSurahNameFromKey(pageData[0].key) : "";
      updateBottomBar(juz, pageIndex, surahName);
    }
  }
}

window.addEventListener("resize", function () {
  if (window.FLIPBOOK_INSTANCE && typeof window.FLIPBOOK_INSTANCE.update === "function") {
    try { window.FLIPBOOK_INSTANCE.update(); } catch (e) {}
  }
});
