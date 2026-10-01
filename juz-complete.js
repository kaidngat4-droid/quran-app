/* juz-complete.js — نافذة إتمام الجزء (مرة واحدة لكل جزء) */
var _juzDoneKey = "juzCompleted";

function _getDoneJuz() {
  try { return JSON.parse(localStorage.getItem(_juzDoneKey) || "[]"); } catch (e) { return []; }
}

async function checkJuzCompletionByPage(page) {
  if (typeof loadPagesData !== "function") return;
  var data = await loadPagesData();
  if (!data) return;
  var cur = data[String(page)], next = data[String(page + 1)];
  if (!cur || !cur.length) return;
  var juz = cur[0].juz;
  var nextJuz = next && next.length ? next[0].juz : 31;
  if (nextJuz === juz) return;
  var done = _getDoneJuz();
  if (done.indexOf(juz) !== -1) return;
  done.push(juz);
  localStorage.setItem(_juzDoneKey, JSON.stringify(done));
  showJuzDialog(juz);
}

async function checkJuzCompletion(surah, ayah) {
  if (typeof loadPagesData !== "function") return;
  var data = await loadPagesData();
  if (!data) return;
  var key = surah + ":" + ayah;
  for (var p = 1; p <= 604; p++) {
    var pg = data[String(p)];
    if (!pg || !pg.length) continue;
    if (pg[pg.length - 1].key === key) { checkJuzCompletionByPage(p); return; }
  }
}

var _JUZ_NAMES = ["","الأول","الثاني","الثالث","الرابع","الخامس","السادس","السابع","الثامن","التاسع","العاشر","الحادي عشر","الثاني عشر","الثالث عشر","الرابع عشر","الخامس عشر","السادس عشر","السابع عشر","الثامن عشر","التاسع عشر","العشرون","الحادي والعشرون","الثاني والعشرون","الثالث والعشرون","الرابع والعشرون","الخامس والعشرون","السادس والعشرون","السابع والعشرون","الثامن والعشرون","التاسع والعشرون","الثلاثون"];

function showJuzDialog(juz) {
  if (document.getElementById("juzDialog")) return;
  var isLast = juz >= 30;
  var html = '<div id="juzDialog" class="picker-overlay" style="z-index:99999">' +
    '<div class="picker-content" style="text-align:center;padding:25px">' +
    '<div style="font-size:60px">🎉</div>' +
    '<h2 style="color:#FFD700;margin:15px 0">أتممت الجزء ' + (_JUZ_NAMES[juz] || juz) + '</h2>' +
    (isLast
      ? '<p style="color:#ccc">ختمت القرآن الكريم، تقبل الله منك 🤲</p>' +
        '<button class="setting-btn" onclick="closeJuzDialog();if(typeof openKhatmDua===\'function\')openKhatmDua()">🤲 دعاء الختم</button>'
      : '<p style="color:#ccc">تقبل الله منك، هل تريد المتابعة إلى <b style="color:#FFD700">الجزء ' + (_JUZ_NAMES[juz + 1] || (juz + 1)) + '</b>؟</p>' +
        '<button class="setting-btn" style="margin-bottom:8px" onclick="closeJuzDialog();goToJuz(' + (juz + 1) + ')">✅ نعم، تابع للجزء التالي</button>' +
        '<button class="setting-btn" onclick="closeJuzDialog()">🛑 توقف هنا</button>') +
    '</div></div>';
  document.body.insertAdjacentHTML("beforeend", html);
}

function closeJuzDialog() {
  var el = document.getElementById("juzDialog");
  if (el) el.remove();
}
