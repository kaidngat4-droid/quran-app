/* ============================================================
   mushaf.js — وضع المصحف (604 صفحة)
   ============================================================ */

var PAGES_DATA = null;       // بيانات pages.json
var CURRENT_PAGE = 1;        // الصفحة الحالية
var TOTAL_PAGES = 604;       // إجمالي الصفحات
var MUSHAF_MODE = false;     // هل نحن في وضع المصحف؟

/* ============ 1. تحميل بيانات الصفحات ============ */
async function loadPagesData() {
  if (PAGES_DATA) return PAGES_DATA;
  try {
    var res = await fetch("pages.json");
    PAGES_DATA = await res.json();
    console.log("✅ تم تحميل pages.json — " + Object.keys(PAGES_DATA).length + " صفحة");
    return PAGES_DATA;
  } catch (e) {
    console.error("❌ فشل تحميل pages.json:", e);
    return null;
  }
}

/* ============ 2. عرض صفحة محددة ============ */
async function displayPage(pageNum) {
  pageNum = parseInt(pageNum);
  if (pageNum < 1) pageNum = 1;
  if (pageNum > TOTAL_PAGES) pageNum = TOTAL_PAGES;
  CURRENT_PAGE = pageNum;

  await loadPagesData();
  if (!PAGES_DATA) return;

  var pageData = PAGES_DATA[String(pageNum)];
  if (!pageData || pageData.length === 0) {
    console.warn("⚠️ لا توجد بيانات للصفحة " + pageNum);
    return;
  }

  // احسب الجزء واسم السورة
  var firstVerse = pageData[0];
  var juz = firstVerse.juz || 0;
  var surahName = getSurahNameFromKey(firstVerse.key);

  // اعرض الصورة
  var view = document.getElementById("mushafView");
  if (!view) return;

  // var paddedPage (تم حذفه)
  var imgSrc = "pages-img/" + pageNum + ".jpg";

  var html = '<div class="mushaf-page mushaf-page-img" data-page="' + pageNum + '">';
  html += '<img src="' + imgSrc + '" class="mushaf-image" alt="صفحة ' + pageNum + '" onerror="this.style.display=\'none\'; this.parentElement.innerHTML += \'<p style=\'color:red;text-align:center;padding:20px\'>❌ الصورة غير موجودة: ' + imgSrc + '</p>\'">';
  html += '</div>';

  view.innerHTML = html;
  view.scrollTop = 0;

  // حدث الشريط السفلي
  updateBottomBar(juz, pageNum, surahName);

  // حدث الحالة النشطة في القائمة
  document.querySelectorAll(".surah-item").forEach(function (el) {
    el.classList.remove("active");
  });
}

/* ============ 3. دوال مساعدة ============ */
function getAyahNumberFromKey(key) {
  if (!key) return "";
  var parts = key.split(":");
  return parts[1] || "";
}

function getSurahNumberFromKey(key) {
  if (!key) return 0;
  var parts = key.split(":");
  return parseInt(parts[0]) || 0;
}

function getSurahNameFromKey(key) {
  var num = getSurahNumberFromKey(key);
  if (typeof SURAH_NAMES !== "undefined" && SURAH_NAMES[num]) {
    return SURAH_NAMES[num];
  }
  return "سورة " + num;
}

function isSurahStart(key) {
  // هل الآية هي أول آية في السورة؟
  var ayahNum = getAyahNumberFromKey(key);
  return ayahNum === "1";
}

/* ============ 4. الشريط السفلي ============ */
function updateBottomBar(juz, page, surahName) {
  var bar = document.getElementById("mushafBottomBar");
  if (!bar) return;
  document.getElementById("bottomJuz").textContent = "الجزء " + juz;
  document.getElementById("bottomPage").textContent = "الصفحة " + page;
  document.getElementById("bottomSurah").textContent = "سورة " + surahName;
}

/* ============ 5. التنقل بين الصفحات ============ */
function nextPage() {
  if (CURRENT_PAGE < TOTAL_PAGES) {
    displayPage(CURRENT_PAGE + 1);
    // scroll للمرحلة التالية
    var view = document.getElementById("mushafView");
    if (view) view.scrollTop = 0;
  }
}

function prevPage() {
  if (CURRENT_PAGE > 1) {
    displayPage(CURRENT_PAGE - 1);
    var view = document.getElementById("mushafView");
    if (view) view.scrollTop = 0;
  }
}

function goToPage(pageNum) {
  displayPage(pageNum);
}

/* ============ 6. تبديل الوضع ============ */
function toggleMushafMode() {
  MUSHAF_MODE = !MUSHAF_MODE;
  var btn = document.getElementById("mushafToggleBtn");
  var bar = document.getElementById("mushafBottomBar");
  var player = document.getElementById("player");

  if (MUSHAF_MODE) {
    // وضع المصحف
    if (btn) btn.textContent = "📖";
    if (bar) bar.style.display = "flex";
    if (player) player.style.display = "flex";
    console.log("📖 وضع المصحف");
    // إذا لم تكن هناك صفحة، اعرض الأولى
    if (!document.querySelector(".mushaf-page")) {
      displayPage(1);
    }
  } else {
    // وضع الآيات
    if (btn) btn.textContent = "📄";
    if (bar) bar.style.display = "none";
    console.log("📄 وضع الآيات");
    // أعد عرض السورة الحالية
    if (typeof currentSurah !== "undefined" && currentSurah) {
      loadSurah(currentSurah);
    }
  }
}

/* ============ 7. النقر على آية ============ */
function onAyahClick(el) {
  // أزل التحديد السابق
  document.querySelectorAll(".mushaf-ayah.active").forEach(function (a) {
    a.classList.remove("active");
  });
  el.classList.add("active");

  // استخرج السورة والآية
  var key = el.dataset.key;
  var parts = key.split(":");
  var surahNum = parseInt(parts[0]);
  var ayahNum = parseInt(parts[1]);

  // احفظ الحالة للاستخدام مع الصوت والتفسير
  if (typeof currentSurah !== "undefined") {
    window._lastMushafSurah = surahNum;
    window._lastMushafAyah = ayahNum;
  }
}

/* ============ 8. النقر الطويل (للعلامة المرجعية) ============ */
var _touchTimer = null;

function onAyahTouchStart(e, el) {
  _touchTimer = setTimeout(function () {
    var key = el.dataset.key;
    var parts = key.split(":");
    var surahNum = parseInt(parts[0]);
    var ayahNum = parseInt(parts[1]);
    if (typeof toggleBookmark === "function") {
      toggleBookmark(surahNum, ayahNum, el);
    }
    _touchTimer = null;
  }, 600);
}

function onAyahTouchEnd(e, el) {
  if (_touchTimer) {
    clearTimeout(_touchTimer);
    _touchTimer = null;
  }
}

/* ============ 9. التهيئة ============ */
document.addEventListener("DOMContentLoaded", function () {
  // ابدأ في وضع الآيات افتراضياً
  console.log("✅ mushaf.js جاهز");
});

/* ============ 10. فتح صفحة السورة ============ */
async function displayPageBySurah(surahNum) {
  await loadPagesData();
  if (!PAGES_DATA) return;

  // ابحث عن أول صفحة تحتوي على السورة
  for (var page = 1; page <= TOTAL_PAGES; page++) {
    var pageData = PAGES_DATA[String(page)];
    if (!pageData || pageData.length === 0) continue;
    
    for (var i = 0; i < pageData.length; i++) {
      var key = pageData[i].key;
      var s = parseInt(key.split(":")[0]);
      if (s === surahNum) {
        displayPage(page);
        return;
      }
    }
  }
  console.warn("⚠️ لم يتم العثور على السورة " + surahNum);
}

/* ============ 11. الانتقال للجزء ============ */
async function goToJuz(juzNum) {
  await loadPagesData();
  if (!PAGES_DATA) return;
  
  for (var page = 1; page <= TOTAL_PAGES; page++) {
    var pageData = PAGES_DATA[String(page)];
    if (!pageData || pageData.length === 0) continue;
    if (pageData[0].juz === juzNum) {
      displayPage(page);
      return;
    }
  }
}

/* ============ 12. التهيئة الافتراضية ============ */
if (typeof MUSHAF_MODE === "undefined") {
  var MUSHAF_MODE = false;
}

/* ============ 13. طي/إظهار المشغل ============ */
var _playerCollapsed = false;

function togglePlayerCollapse() {
  _playerCollapsed = !_playerCollapsed;
  var player = document.getElementById("player");
  var btn = document.getElementById("collapsePlayerBtn");
  var navPrev = document.getElementById("mushafPrevBtn");
  var navNext = document.getElementById("mushafNextBtn");
  
  if (_playerCollapsed) {
    if (player) {
      player.style.transition = "transform 0.3s";
      player.style.transform = "translateY(calc(100% - 35px))";
    }
    if (btn) btn.textContent = "▲ إظهار";
    if (navPrev) navPrev.style.bottom = "35px";
    if (navNext) navNext.style.bottom = "35px";
  } else {
    if (player) {
      player.style.transform = "translateY(0)";
    }
    if (btn) btn.textContent = "▼ إخفاء";
    if (navPrev) navPrev.style.bottom = "120px";
    if (navNext) navNext.style.bottom = "120px";
  }
}

/* ============ 14. الإخفاء التلقائي عند النقر على المصحف ============ */
document.addEventListener("click", function(e) {
  // إذا كنا في وضع المصحف
  if (typeof MUSHAF_MODE !== "undefined" && MUSHAF_MODE) {
    // إذا نقر المستخدم على منطقة المصحف (وليس الأزرار)
    var target = e.target;
    if (target.closest(".mushaf-page") || target.closest("#mushafView")) {
      // أخفِ المشغل تلقائياً
      if (!_playerCollapsed) {
        setTimeout(function() {
          togglePlayerCollapse();
        }, 2000);
      }
    }
  }
});

/* ============ 15. إخفاء/إظهار الشريط السفلي تلقائياً ============ */
var _bottomBarTimer = null;

function showBottomBar() {
  var bar = document.getElementById("mushafBottomBar");
  if (!bar) return;
  bar.classList.remove("hidden-bar");
  
  // إخفاء تلقائي بعد 3 ثوان
  if (_bottomBarTimer) clearTimeout(_bottomBarTimer);
  _bottomBarTimer = setTimeout(function() {
    hideBottomBar();
  }, 3000);
}

function hideBottomBar() {
  var bar = document.getElementById("mushafBottomBar");
  if (!bar) return;
  bar.classList.add("hidden-bar");
}

function toggleBottomBar() {
  var bar = document.getElementById("mushafBottomBar");
  if (!bar) return;
  if (bar.classList.contains("hidden-bar")) {
    showBottomBar();
  } else {
    hideBottomBar();
  }
}

/* ============ 16. ربط النقر على المصحف ============ */
document.addEventListener("DOMContentLoaded", function() {
  var view = document.getElementById("mushafView");
  if (view) {
    view.addEventListener("click", function(e) {
      // إذا لم يكن النقر على آية
      if (!e.target.closest(".mushaf-ayah")) {
        toggleBottomBar();
      }
    });
  }
});

/* ============ 17. تحديث displayPage لإظهار الشريط ============ */
var _originalUpdateBottomBar = updateBottomBar;
updateBottomBar = function(juz, page, surahName) {
  if (_originalUpdateBottomBar) {
    _originalUpdateBottomBar(juz, page, surahName);
  }
  // إظهار الشريط مؤقتاً
  showBottomBar();
};

/* ============ 18. تقليب الصفحات بالسحب ============ */
var _swipeStartX = 0;
var _swipeStartY = 0;
var _swipeStartTime = 0;
var _isSwiping = false;

document.addEventListener("DOMContentLoaded", function () {
  var view = document.getElementById("mushafView");
  if (!view) return;

  // بداية اللمس
  view.addEventListener("touchstart", function (e) {
    if (!MUSHAF_MODE) return;
    var touch = e.touches[0];
    _swipeStartX = touch.clientX;
    _swipeStartY = touch.clientY;
    _swipeStartTime = Date.now();
    _isSwiping = false;
  }, { passive: true });

  // حركة الإصبع
  view.addEventListener("touchmove", function (e) {
    if (!MUSHAF_MODE) return;
    if (_swipeStartX === 0) return;
    var touch = e.touches[0];
    var diffX = touch.clientX - _swipeStartX;
    var diffY = touch.clientY - _swipeStartY;
    // إذا الحركة أفقية أكثر من عمودية
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      _isSwiping = true;
    }
  }, { passive: true });

  // نهاية اللمس
  view.addEventListener("touchend", function (e) {
    if (!MUSHAF_MODE) return;
    if (!_isSwiping) {
      _swipeStartX = 0;
      return;
    }
    var touch = e.changedTouches[0];
    var diffX = touch.clientX - _swipeStartX;
    var elapsed = Date.now() - _swipeStartTime;

    // إذا كانت السرعة كافية
    if (Math.abs(diffX) > 50 || elapsed < 300) {
      if (diffX > 50) {
        // سحب يمين → الصفحة السابقة
        prevPage();
        animatePageTransition("right");
      } else if (diffX < -50) {
        // سحب يسار → الصفحة التالية
        nextPage();
        animatePageTransition("left");
      }
    }
    _swipeStartX = 0;
    _isSwiping = false;
  }, { passive: true });
});

/* ============ 19. أنيميشن التقليب ============ */
function animatePageTransition(direction) {
  var page = document.querySelector(".mushaf-page");
  if (!page) return;
  var fromX = direction === "left" ? "100%" : "-100%";
  page.style.transition = "none";
  page.style.transform = "translateX(" + fromX + ")";
  page.style.opacity = "0";
  setTimeout(function () {
    page.style.transition = "transform 0.3s ease, opacity 0.3s ease";
    page.style.transform = "translateX(0)";
    page.style.opacity = "1";
  }, 20);
}
