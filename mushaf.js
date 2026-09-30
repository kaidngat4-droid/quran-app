/* ============================================================
   mushaf.js — وضع المصحف (604 صفحة) — نسخة نظيفة
   ============================================================ */

var PAGES_DATA = null;
var CURRENT_PAGE = 1;
var TOTAL_PAGES = 604;
var MUSHAF_MODE = false;
var _playerCollapsed = false;
var _bottomBarTimer = null;

/* ============ 1. تحميل البيانات ============ */
async function loadPagesData() {
  if (PAGES_DATA) return PAGES_DATA;
  try {
    var res = await fetch("pages.json");
    PAGES_DATA = await res.json();
    console.log("✅ pages.json — " + Object.keys(PAGES_DATA).length + " صفحة");
    return PAGES_DATA;
  } catch (e) {
    console.error("❌ فشل تحميل pages.json:", e);
    return null;
  }
}

/* ============ 2. عرض صفحة ============ */
async function displayPage(pageNum) {
  pageNum = parseInt(pageNum);
  if (pageNum < 1) pageNum = 1;
  if (pageNum > TOTAL_PAGES) pageNum = TOTAL_PAGES;
  CURRENT_PAGE = pageNum;

  await loadPagesData();
  if (!PAGES_DATA) return;

  var pageData = PAGES_DATA[String(pageNum)];
  if (!pageData || pageData.length === 0) return;

  var firstVerse = pageData[0];
  var juz = firstVerse.juz || 0;
  var surahName = getSurahNameFromKey(firstVerse.key);

  var view = document.getElementById("mushafView");
  if (!view) return;

  var imgSrc = "pages-img/" + pageNum + ".jpg";
  var html = '<div class="mushaf-page mushaf-page-img" data-page="' + pageNum + '">';
  html += '<img src="' + imgSrc + '" class="mushaf-image" alt="صفحة ' + pageNum + '">';
  html += '</div>';

  view.innerHTML = html;
  view.scrollTop = 0;

  updateBottomBar(juz, pageNum, surahName);
  document.querySelectorAll(".surah-item").forEach(function (el) { el.classList.remove("active"); });
}

/* ============ 3. دوال مساعدة ============ */
function getAyahNumberFromKey(key) {
  if (!key) return "";
  return key.split(":")[1] || "";
}

function getSurahNumberFromKey(key) {
  if (!key) return 0;
  return parseInt(key.split(":")[0]) || 0;
}

function getSurahNameFromKey(key) {
  var num = getSurahNumberFromKey(key);
  if (typeof SURAH_NAMES !== "undefined" && SURAH_NAMES[num]) return SURAH_NAMES[num];
  return "سورة " + num;
}

/* ============ 4. الشريط السفلي ============ */
function updateBottomBar(juz, page, surahName) {
  var j = document.getElementById("bottomJuz");
  var p = document.getElementById("bottomPage");
  var s = document.getElementById("bottomSurah");
  if (j) j.textContent = "الجزء " + juz;
  if (p) p.textContent = "الصفحة " + page;
  if (s) s.textContent = "سورة " + surahName;
  showBottomBar();
}

function showBottomBar() {
  var bar = document.getElementById("mushafBottomBar");
  if (!bar) return;
  bar.classList.remove("hidden-bar");
  if (_bottomBarTimer) clearTimeout(_bottomBarTimer);
  _bottomBarTimer = setTimeout(hideBottomBar, 3000);
}

function hideBottomBar() {
  var bar = document.getElementById("mushafBottomBar");
  if (!bar) return;
  bar.classList.add("hidden-bar");
}

function toggleBottomBar() {
  var bar = document.getElementById("mushafBottomBar");
  if (!bar) return;
  if (bar.classList.contains("hidden-bar")) showBottomBar();
  else hideBottomBar();
}

/* ============ 5. التنقل ============ */
function nextPage() { if (CURRENT_PAGE < TOTAL_PAGES) displayPage(CURRENT_PAGE + 1); }
function prevPage() { if (CURRENT_PAGE > 1) displayPage(CURRENT_PAGE - 1); }
function goToPage(pageNum) { displayPage(pageNum); }

/* ============ 6. تبديل الوضع ============ */
function toggleMushafMode() {
  MUSHAF_MODE = !MUSHAF_MODE;
  var btn = document.getElementById("mushafToggleBtn");
  var bar = document.getElementById("mushafBottomBar");
  var player = document.getElementById("player");

  if (MUSHAF_MODE) {
    if (btn) btn.textContent = "📖";
    if (bar) bar.style.display = "flex";
    if (player) player.style.display = "flex";
    console.log("📖 وضع المصحف");
    if (!document.querySelector(".mushaf-page-img")) displayPage(1);
  } else {
    if (btn) btn.textContent = "📄";
    if (bar) bar.style.display = "none";
    console.log("📄 وضع الآيات");
    if (typeof currentSurah !== "undefined" && currentSurah) loadSurah(currentSurah);
  }
}

/* ============ 7. طي المشغل ============ */
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
    if (player) player.style.transform = "translateY(0)";
    if (btn) btn.textContent = "▼ إخفاء";
    if (navPrev) navPrev.style.bottom = "120px";
    if (navNext) navNext.style.bottom = "120px";
  }
}

/* ============ 8. التقليب (Page Curl) ============ */
var _touchStartX = 0;
var _touchStartY = 0;
var _touchStartTime = 0;
var _isDragging = false;
var _dragDirection = null;
var _dragDistance = 0;

function onTouchStart(e) {
  if (!MUSHAF_MODE) return;
  if (e.target.closest("button, a, input, select, #header, #sidebar, #player, #mushafBottomBar, .mushaf-nav-btn, .picker-overlay, .flip-indicator")) return;

  var touch = e.touches[0];
  _touchStartX = touch.clientX;
  _touchStartY = touch.clientY;
  _touchStartTime = Date.now();
  _isDragging = false;
  _dragDirection = null;
  _dragDistance = 0;
}

function onTouchMove(e) {
  if (!MUSHAF_MODE) return;
  if (!_touchStartX) return;
  var touch = e.touches[0];
  var dx = touch.clientX - _touchStartX;
  var dy = touch.clientY - _touchStartY;

  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
    if (e.cancelable) e.preventDefault();
    _isDragging = true;
    _dragDistance = dx;

    var page = document.querySelector(".mushaf-page-img");
    var sL = document.querySelector(".page-shadow.left");
    var sR = document.querySelector(".page-shadow.right");
    var iL = document.querySelector(".flip-indicator.left");
    var iR = document.querySelector(".flip-indicator.right");

    if (dx < 0) {
      _dragDirection = "next";
      var p = Math.min(Math.abs(dx) / 200, 1);
      if (page) {
        page.style.transition = "none";
        page.style.transform = "translateX(" + dx + "px) rotateY(" + (p * -15) + "deg)";
        page.style.opacity = 1 - p * 0.2;
      }
      if (sR) sR.classList.add("visible");
      if (sL) sL.classList.remove("visible");
      if (iL) iL.classList.remove("visible");
      if (iR) iR.classList.add("visible");
    } else {
      _dragDirection = "prev";
      var p2 = Math.min(dx / 200, 1);
      if (page) {
        page.style.transition = "none";
        page.style.transform = "translateX(" + dx + "px) rotateY(" + (p2 * 15) + "deg)";
        page.style.opacity = 1 - p2 * 0.2;
      }
      if (sL) sL.classList.add("visible");
      if (sR) sR.classList.remove("visible");
      if (iR) iR.classList.remove("visible");
      if (iL) iL.classList.add("visible");
    }
  }
}

function onTouchEnd(e) {
  if (!MUSHAF_MODE) return;
  var elapsed = Date.now() - _touchStartTime;
  var threshold = elapsed < 200 ? 30 : 60;
  var page = document.querySelector(".mushaf-page-img");

  if (_isDragging && Math.abs(_dragDistance) > threshold) {
    flipPage(_dragDirection, page);
  } else if (page) {
    page.style.transition = "transform 0.3s ease, opacity 0.3s ease";
    page.style.transform = "translateX(0) rotateY(0)";
    page.style.opacity = "1";
    setTimeout(function () { page.style.transition = ""; }, 300);
  }

  setTimeout(function () {
    document.querySelectorAll(".page-shadow, .flip-indicator").forEach(function (el) { el.classList.remove("visible"); });
  }, 200);

  _touchStartX = 0;
  _isDragging = false;
}

function flipPage(direction, page) {
  if (!page) return;
  if (direction === "next") {
    page.style.transition = "transform 0.4s ease, opacity 0.4s ease";
    page.style.transform = "translateX(-100%) rotateY(-90deg)";
    page.style.opacity = "0";
  } else {
    page.style.transition = "transform 0.4s ease, opacity 0.4s ease";
    page.style.transform = "translateX(100%) rotateY(90deg)";
    page.style.opacity = "0";
  }

  setTimeout(function () {
    if (direction === "next") nextPage();
    else prevPage();

    setTimeout(function () {
      var newPage = document.querySelector(".mushaf-page-img");
      if (newPage) {
        newPage.style.transition = "none";
        newPage.style.transform = direction === "next" ? "translateX(100%) rotateY(90deg)" : "translateX(-100%) rotateY(-90deg)";
        newPage.style.opacity = "0";
        setTimeout(function () {
          newPage.style.transition = "transform 0.4s ease, opacity 0.4s ease";
          newPage.style.transform = "translateX(0) rotateY(0)";
          newPage.style.opacity = "1";
        }, 30);
      }
    }, 50);
  }, 400);
}

/* ============ 9. فتح صفحة السورة ============ */
async function displayPageBySurah(surahNum) {
  await loadPagesData();
  if (!PAGES_DATA) return;
  for (var page = 1; page <= TOTAL_PAGES; page++) {
    var pageData = PAGES_DATA[String(page)];
    if (!pageData || pageData.length === 0) continue;
    for (var i = 0; i < pageData.length; i++) {
      var s = parseInt(pageData[i].key.split(":")[0]);
      if (s === surahNum) { displayPage(page); return; }
    }
  }
}

/* ============ 10. الانتقال للجزء ============ */
async function goToJuz(juzNum) {
  await loadPagesData();
  if (!PAGES_DATA) return;
  for (var page = 1; page <= TOTAL_PAGES; page++) {
    var pageData = PAGES_DATA[String(page)];
    if (!pageData || pageData.length === 0) continue;
    if (pageData[0].juz === juzNum) { displayPage(page); return; }
  }
}

/* ============ 11. التهيئة ============ */
document.addEventListener("DOMContentLoaded", function () {
  var view = document.getElementById("mushafView");
  if (!view) return;

  view.insertAdjacentHTML("beforeend", '<div class="page-shadow left"></div><div class="page-shadow right"></div>');
  document.body.insertAdjacentHTML("beforeend", '<div class="flip-indicator left">‹</div><div class="flip-indicator right">›</div>');

  view.addEventListener("touchstart", onTouchStart, { passive: true });
  view.addEventListener("touchmove", onTouchMove, { passive: false });
  view.addEventListener("touchend", onTouchEnd, { passive: true });
  view.addEventListener("touchcancel", onTouchEnd, { passive: true });

  view.addEventListener("click", function (e) {
    if (!MUSHAF_MODE) return;
    if (!e.target.closest(".mushaf-ayah")) toggleBottomBar();
  });
});

console.log("✅ mushaf.js جاهز");
