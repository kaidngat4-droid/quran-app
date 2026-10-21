/* parts.js — الأجزاء والأحزاب والسجدات */

/* ============ الأجزاء الـ 30 ============ */
/* كل جزء يبدأ من سورة:آية معينة */
const JUZ_DATA = [
  { juz: 1,  start: { surah: 1, ayah: 1 },   name: "الجزء الأول" },
  { juz: 2,  start: { surah: 2, ayah: 142 }, name: "الجزء الثاني" },
  { juz: 3,  start: { surah: 2, ayah: 253 }, name: "الجزء الثالث" },
  { juz: 4,  start: { surah: 3, ayah: 92 },  name: "الجزء الرابع" },
  { juz: 5,  start: { surah: 4, ayah: 24 },  name: "الجزء الخامس" },
  { juz: 6,  start: { surah: 4, ayah: 148 }, name: "الجزء السادس" },
  { juz: 7,  start: { surah: 5, ayah: 82 },  name: "الجزء السابع" },
  { juz: 8,  start: { surah: 6, ayah: 111 }, name: "الجزء الثامن" },
  { juz: 9,  start: { surah: 7, ayah: 88 },  name: "الجزء التاسع" },
  { juz: 10, start: { surah: 8, ayah: 41 },  name: "الجزء العاشر" },
  { juz: 11, start: { surah: 9, ayah: 93 },  name: "الجزء الحادي عشر" },
  { juz: 12, start: { surah: 11, ayah: 6 },  name: "الجزء الثاني عشر" },
  { juz: 13, start: { surah: 12, ayah: 53 }, name: "الجزء الثالث عشر" },
  { juz: 14, start: { surah: 15, ayah: 1 },  name: "الجزء الرابع عشر" },
  { juz: 15, start: { surah: 17, ayah: 1 },  name: "الجزء الخامس عشر" },
  { juz: 16, start: { surah: 18, ayah: 75 }, name: "الجزء السادس عشر" },
  { juz: 17, start: { surah: 21, ayah: 1 },  name: "الجزء السابع عشر" },
  { juz: 18, start: { surah: 23, ayah: 1 },  name: "الجزء الثامن عشر" },
  { juz: 19, start: { surah: 25, ayah: 21 }, name: "الجزء التاسع عشر" },
  { juz: 20, start: { surah: 27, ayah: 56 }, name: "الجزء العشرون" },
  { juz: 21, start: { surah: 29, ayah: 46 }, name: "الجزء الحادي والعشرون" },
  { juz: 22, start: { surah: 33, ayah: 31 }, name: "الجزء الثاني والعشرون" },
  { juz: 23, start: { surah: 36, ayah: 28 }, name: "الجزء الثالث والعشرون" },
  { juz: 24, start: { surah: 39, ayah: 32 }, name: "الجزء الرابع والعشرون" },
  { juz: 25, start: { surah: 41, ayah: 47 }, name: "الجزء الخامس والعشرون" },
  { juz: 26, start: { surah: 46, ayah: 1 },  name: "الجزء السادس والعشرون" },
  { juz: 27, start: { surah: 51, ayah: 31 }, name: "الجزء السابع والعشرون" },
  { juz: 28, start: { surah: 58, ayah: 1 },  name: "الجزء الثامن والعشرون" },
  { juz: 29, start: { surah: 67, ayah: 1 },  name: "الجزء التاسع والعشرون" },
  { juz: 30, start: { surah: 78, ayah: 1 },  name: "الجزء الثلاثون" }
];

/* ============ الأحزاب الـ 60 ============ */
/* كل حزب هو نصف جزء */
const HIZB_DATA = (function() {
  var hizbs = [];
  for (var i = 0; i < JUZ_DATA.length; i++) {
    var juz = JUZ_DATA[i];
    // الحزب الأول من الجزء
    hizbs.push({
      hizb: (i * 2) + 1,
      juz: juz.juz,
      start: juz.start,
      name: "الحزب " + ((i * 2) + 1)
    });
    // الحزب الثاني (نصف الجزء) - نحسبه بالتقريب
    var halfAyah = Math.ceil(juz.start.ayah / 2) + Math.floor(juz.start.ayah / 2);
    hizbs.push({
      hizb: (i * 2) + 2,
      juz: juz.juz,
      start: juz.start,
      name: "الحزب " + ((i * 2) + 2)
    });
  }
  return hizbs;
})();

/* ============ السجدات الـ 15 ============ */
const SAJDA_DATA = [
  { surah: 7,   ayah: 206, type: "سجدة" },
  { surah: 13,  ayah: 15,  type: "سجدة" },
  { surah: 16,  ayah: 50,  type: "سجدة" },
  { surah: 17,  ayah: 109, type: "سجدة" },
  { surah: 19,  ayah: 58,  type: "سجدة" },
  { surah: 22,  ayah: 18,  type: "سجدة" },
  { surah: 22,  ayah: 77,  type: "سجدة" },
  { surah: 25,  ayah: 60,  type: "سجدة" },
  { surah: 27,  ayah: 26,  type: "سجدة" },
  { surah: 32,  ayah: 15,  type: "سجدة" },
  { surah: 38,  ayah: 24,  type: "سجدة" },
  { surah: 41,  ayah: 38,  type: "سجدة" },
  { surah: 53,  ayah: 62,  type: "سجدة" },
  { surah: 84,  ayah: 21,  type: "سجدة" },
  { surah: 96,  ayah: 19,  type: "سجدة" }
];

/* ============ أسماء السور (للعرض) ============ */
const SURAH_NAMES = {
  1: "الفاتحة", 2: "البقرة", 3: "آل عمران", 4: "النساء", 5: "المائدة",
  6: "الأنعام", 7: "الأعراف", 8: "الأنفال", 9: "التوبة", 10: "يونس",
  11: "هود", 12: "يوسف", 13: "الرعد", 14: "إبراهيم", 15: "الحجر",
  16: "النحل", 17: "الإسراء", 18: "الكهف", 19: "مريم", 20: "طه",
  21: "الأنبياء", 22: "الحج", 23: "المؤمنون", 24: "النور", 25: "الفرقان",
  26: "الشعراء", 27: "النمل", 28: "القصص", 29: "العنكبوت", 30: "الروم",
  31: "لقمان", 32: "السجدة", 33: "الأحزاب", 34: "سبأ", 35: "فاطر",
  36: "يس", 37: "الصافات", 38: "ص", 39: "الزمر", 40: "غافر",
  41: "فصلت", 42: "الشورى", 43: "الزخرف", 44: "الدخان", 45: "الجاثية",
  46: "الأحقاف", 47: "محمد", 48: "الفتح", 49: "الحجرات", 50: "ق",
  51: "الذاريات", 52: "الطور", 53: "النجم", 54: "القمر", 55: "الرحمن",
  56: "الواقعة", 57: "الحديد", 58: "المجادلة", 59: "الحشر", 60: "الممتحنة",
  61: "الصف", 62: "الجمعة", 63: "المنافقون", 64: "التغابن", 65: "الطلاق",
  66: "التحريم", 67: "الملك", 68: "القلم", 69: "الحاقة", 70: "المعارج",
  71: "نوح", 72: "الجن", 73: "المزمل", 74: "المدثر", 75: "القيامة",
  76: "الإنسان", 77: "المرسلات", 78: "النبأ", 79: "النازعات", 80: "عبس",
  81: "التكوير", 82: "الانفطار", 83: "المطففين", 84: "الانشقاق", 85: "البروج",
  86: "الطارق", 87: "الأعلى", 88: "الغاشية", 89: "الفجر", 90: "البلد",
  91: "الشمس", 92: "الليل", 93: "الضحى", 94: "الشرح", 95: "التين",
  96: "العلق", 97: "القدر", 98: "البينة", 99: "الزلزلة", 100: "العاديات",
  101: "القارعة", 102: "التكاثر", 103: "العصر", 104: "الهمزة", 105: "الفيل",
  106: "قريش", 107: "الماعون", 108: "الكوثر", 109: "الكافرون", 110: "النصر",
  111: "المسد", 112: "الإخلاص", 113: "الفلق", 114: "الناس"
};

/* ============ عرض قائمة الأجزاء ============ */
function openJuzList() {
  var html = '<div class="picker-overlay" onclick="closeParts(event)">';
  html += '<div class="picker-content" onclick="event.stopPropagation()">';
  html += '<div class="picker-header"><h3>📚 الأجزاء</h3>';
  html += '<button class="picker-close" onclick="closeParts()">✕</button></div>';
  html += '<div class="picker-list">';
  for (var i = 0; i < JUZ_DATA.length; i++) {
    var j = JUZ_DATA[i];
    html += '<button class="picker-item" onclick="closeParts(); jumpToLocation(' + j.start.surah + ',' + j.start.ayah + ')">';
    html += '<span class="picker-flag">📖</span>';
    html += '<div class="picker-info">';
    html += '<div class="picker-name">' + j.name + '</div>';
    html += '<div class="picker-country">' + SURAH_NAMES[j.start.surah] + ' — آية ' + j.start.ayah + '</div>';
    html += '</div></button>';
  }
  html += '</div></div></div>';
  document.body.insertAdjacentHTML("beforeend", html);
}

/* ============ عرض قائمة الأحزاب ============ */
function openHizbList() {
  var html = '<div class="picker-overlay" onclick="closeParts(event)">';
  html += '<div class="picker-content" onclick="event.stopPropagation()">';
  html += '<div class="picker-header"><h3>📖 الأحزاب (60)</h3>';
  html += '<button class="picker-close" onclick="closeParts()">✕</button></div>';
  html += '<div class="picker-list">';
  for (var i = 0; i < HIZB_DATA.length; i++) {
    var h = HIZB_DATA[i];
    html += '<button class="picker-item" onclick="closeParts(); jumpToLocation(' + h.start.surah + ',' + h.start.ayah + ')">';
    html += '<span class="picker-flag">📖</span>';
    html += '<div class="picker-info">';
    html += '<div class="picker-name">' + h.name + '</div>';
    html += '<div class="picker-country">الجزء ' + h.juz + ' — ' + SURAH_NAMES[h.start.surah] + '</div>';
    html += '</div></button>';
  }
  html += '</div></div></div>';
  document.body.insertAdjacentHTML("beforeend", html);
}

/* ============ عرض قائمة السجدات ============ */
function openSajdaList() {
  var html = '<div class="picker-overlay" onclick="closeParts(event)">';
  html += '<div class="picker-content" onclick="event.stopPropagation()">';
  html += '<div class="picker-header"><h3>🕌 السجدات (15)</h3>';
  html += '<button class="picker-close" onclick="closeParts()">✕</button></div>';
  html += '<div class="picker-list">';
  for (var i = 0; i < SAJDA_DATA.length; i++) {
    var s = SAJDA_DATA[i];
    html += '<button class="picker-item" onclick="closeParts(); jumpToLocation(' + s.surah + ',' + s.ayah + ')">';
    html += '<span class="picker-flag">🕌</span>';
    html += '<div class="picker-info">';
    html += '<div class="picker-name">سورة ' + SURAH_NAMES[s.surah] + '</div>';
    html += '<div class="picker-country">آية ' + s.ayah + ' — سجدة تلاوة</div>';
    html += '</div></button>';
  }
  html += '</div></div></div>';
  document.body.insertAdjacentHTML("beforeend", html);
}

/* ============ الانتقال لموقع معين ============ */
function jumpToLocation(surah, ayah) {
  if (typeof loadSurah === "function") {
    loadSurah(surah).then(function() {
      setTimeout(function() {
        var el = document.querySelector('.ayah[data-index="' + (ayah - 1) + '"]');
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.style.animation = "highlight 2s";
          setTimeout(function() { el.style.animation = ""; }, 2000);
        }
      }, 800);
    });
  }
}

function closeParts(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains("picker-close")) return;
  var el = document.querySelector(".picker-overlay");
  if (el) el.remove();
}

/* ============ علامة السجدة التلقائية ============ */
function markSajdaAyahs(surahNum) {
  document.querySelectorAll(".ayah.sajda-marker").forEach(function(el) {
    el.classList.remove("sajda-marker");
    var badge = el.querySelector(".sajda-badge");
    if (badge) badge.remove();
  });
  for (var i = 0; i < SAJDA_DATA.length; i++) {
    var s = SAJDA_DATA[i];
    if (s.surah === surahNum) {
      var ayahEl = document.querySelector('.ayah[data-index="' + (s.ayah - 1) + '"]');
      if (ayahEl) {
        ayahEl.classList.add("sajda-marker");
        var badge = document.createElement("div");
        badge.className = "sajda-badge";
        badge.innerHTML = "🕌 سجدة";
        ayahEl.insertBefore(badge, ayahEl.firstChild);
      }
    }
  }
}

/* ============ معلومات الجزء ============ */
function getJuzForSurahAyah(surahNum, ayahNum) {
  var currentJuz = null;
  for (var i = 0; i < JUZ_DATA.length; i++) {
    var j = JUZ_DATA[i];
    if (j.start.surah < surahNum || (j.start.surah === surahNum && j.start.ayah <= ayahNum)) {
      currentJuz = j;
    } else { break; }
  }
  return currentJuz;
}

function getNextJuz(currentJuzNum) {
  for (var i = 0; i < JUZ_DATA.length; i++) {
    if (JUZ_DATA[i].juz === currentJuzNum + 1) return JUZ_DATA[i];
  }
  return null;
}

function isLastAyahOfJuz(surahNum, ayahNum, currentJuzNum) {
  var nextJuz = getNextJuz(currentJuzNum);
  if (!nextJuz) return false;
  if (nextJuz.start.surah === surahNum && nextJuz.start.ayah === ayahNum + 1) return true;
  if (nextJuz.start.surah === surahNum + 1 && nextJuz.start.ayah === 1) {
    // يجب التأكد من نهاية السورة
    return true;
  }
  return false;
}

/* ============ إشعار انتهاء الجزء ============ */
function showJuzCompleteNotification(currentJuzNum) {
  var nextJuz = getNextJuz(currentJuzNum);
  if (!nextJuz) return;

  var shownKey = "juz_" + currentJuzNum + "_shown";
  if (sessionStorage.getItem(shownKey) === "yes") return;
  sessionStorage.setItem(shownKey, "yes");

  var currentJuzInfo = JUZ_DATA[currentJuzNum - 1];

  var html = '<div class="picker-overlay juz-complete-overlay" onclick="closeJuzNotification(event)">';
  html += '<div class="picker-content" onclick="event.stopPropagation()" style="text-align:center;padding:30px 20px">';
  html += '<div style="font-size:70px;margin-bottom:15px">🎉</div>';
  html += '<h2 style="color:#FFD700;font-size:22px;margin-bottom:10px">أتممت ' + currentJuzInfo.name + '</h2>';
  html += '<p style="color:#ccc;font-size:16px;margin:15px 0;line-height:1.8">تقبل الله منك، هل تريد المتابعة إلى <b style="color:#FFD700">' + nextJuz.name + '</b>؟</p>';
  html += '<button onclick="closeJuzNotification(); jumpToLocation(' + nextJuz.start.surah + ',' + nextJuz.start.ayah + ')" style="background:linear-gradient(135deg,#FF5500,#FFAA00);color:#fff;border:none;padding:14px 30px;border-radius:12px;font-size:16px;font-family:Tajawal;cursor:pointer;width:100%;font-weight:600;margin-bottom:10px">✅ نعم، تابع للجزء التالي</button>';
  html += '<button onclick="closeJuzNotification()" style="background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.2);padding:12px 30px;border-radius:12px;font-size:14px;font-family:Tajawal;cursor:pointer;width:100%">🛑 توقف هنا</button>';
  html += '</div></div>';
  document.body.insertAdjacentHTML("beforeend", html);
}

function closeJuzNotification(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains("picker-close")) return;
  var el = document.querySelector(".juz-complete-overlay");
  if (el) el.remove();
}

/* checkJuzCompletion انتقلت إلى juz-complete.js */
