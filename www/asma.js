/* asma.js — أسماء الله الحسنى */
var ASMA = ASMA_RAW.map(function (s, i) { var p = s.split("|"); return { n: i + 1, name: p[0], mean: p[1] || "" }; });

function _asmaLearned() { try { return JSON.parse(localStorage.getItem("asmaLearned") || "[]"); } catch (e) { return []; } }
function _asmaToday() { var d = new Date(); return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000) % 99; }
function _asmaNorm(s) { return String(s).replace(/[\u064B-\u065F\u0670]/g, "").replace(/[إأآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه"); }
function _asmaBody() { return document.getElementById("asmaBody"); }

function openAsma() {
  closeAsma();
  var h = '<div id="asmaOverlay" class="picker-overlay" onclick="closeAsma(event)">' +
    '<div class="picker-content" onclick="event.stopPropagation()" style="max-width:600px">' +
    '<div class="picker-header"><h3>✨ أسماء الله الحسنى</h3><button class="picker-close" onclick="closeAsma()">✕</button></div>' +
    '<div class="settings-body" id="asmaBody" style="max-height:78vh;overflow-y:auto;padding:12px"></div></div></div>';
  document.body.insertAdjacentHTML("beforeend", h);
  renderAsmaList("");
}

function renderAsmaList(q) {
  var L = _asmaLearned(), t = ASMA[_asmaToday()], key = _asmaNorm(q.trim());
  var h = '<input id="asmaSearch" type="search" placeholder="🔍 ابحث عن اسم" value="' + q.replace(/"/g, "") + '" oninput="renderAsmaList(this.value)" style="width:100%;box-sizing:border-box;padding:12px;border-radius:12px;border:1px solid rgba(255,215,0,0.3);background:rgba(255,255,255,0.06);color:#fff;font-family:Tajawal;font-size:15px;margin-bottom:12px">';
  if (!key) {
    h += '<div onclick="showAsma(' + t.n + ')" style="cursor:pointer;text-align:center;padding:16px;margin-bottom:12px;border-radius:16px;border:1px solid #FFD700;background:linear-gradient(135deg,rgba(255,170,0,0.15),rgba(255,215,0,0.05))">' +
      '<div style="color:#aaa;font-size:12px">اسم اليوم</div>' +
      '<div style="color:#FFD700;font-size:32px;font-weight:700;margin:6px 0">' + t.name + '</div>' +
      (t.mean ? '<div style="color:#ddd;font-size:13px">' + t.mean + '</div>' : '') + '</div>' +
      '<div style="color:#aaa;font-size:13px;margin-bottom:10px;text-align:center">حفظتَ ' + L.length + ' من 99</div>' +
      '<div style="height:6px;background:rgba(255,215,0,0.15);border-radius:3px;margin-bottom:14px;overflow:hidden"><div style="height:100%;width:' + Math.round(L.length / 99 * 100) + '%;background:linear-gradient(90deg,#FF5500,#FFAA00)"></div></div>';
  }
  h += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">';
  var c = 0;
  ASMA.forEach(function (a) {
    if (key && _asmaNorm(a.name + " " + a.mean).indexOf(key) < 0) return;
    c++;
    var done = L.indexOf(a.n) >= 0;
    h += '<button onclick="showAsma(' + a.n + ')" style="position:relative;padding:14px 8px;border-radius:14px;cursor:pointer;font-family:Tajawal;color:#FFD700;font-size:17px;font-weight:600;background:' + (done ? "rgba(76,175,80,0.15)" : "rgba(255,215,0,0.06)") + ';border:1px solid ' + (done ? "rgba(76,175,80,0.5)" : "rgba(255,215,0,0.25)") + '">' +
      '<span style="position:absolute;top:4px;right:8px;font-size:10px;color:#888">' + a.n + '</span>' + a.name + (done ? ' ✓' : '') + '</button>';
  });
  h += '</div>';
  if (!c) h += '<p style="text-align:center;color:#aaa;padding:20px">لا توجد نتائج</p>';
  _asmaBody().innerHTML = h;
  if (q) { var s = document.getElementById("asmaSearch"); s.focus(); s.setSelectionRange(q.length, q.length); }
}

function showAsma(n) {
  var a = ASMA[n - 1], done = _asmaLearned().indexOf(n) >= 0;
  var btn = 'style="flex:1;padding:12px;border-radius:12px;border:1px solid rgba(255,215,0,0.3);background:rgba(255,215,0,0.1);color:#FFD700;font-family:Tajawal;font-size:14px;cursor:pointer"';
  var h = '<div style="text-align:center;padding:10px 6px">' +
    '<div style="color:#888;font-size:13px">' + n + ' / 99</div>' +
    '<div style="color:#FFD700;font-size:46px;font-weight:700;margin:18px 0;font-family:Amiri Quran,serif">' + a.name + '</div>' +
    (a.mean ? '<div style="color:#fff;font-size:18px;line-height:2;padding:16px;border-radius:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,215,0,0.2)">' + a.mean + '</div>' : '') +
    '<div style="font-family:Amiri Quran,serif;color:#cfd8dc;font-size:17px;line-height:2;margin:18px 0">﴿وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا﴾<br><span style="font-size:12px;color:#888">الأعراف: 180</span></div>' +
    '<div style="display:flex;gap:8px;margin-bottom:8px"><button ' + btn + ' onclick="showAsma(' + (n === 1 ? 99 : n - 1) + ')">▶ السابق</button>' +
    '<button ' + btn + ' onclick="showAsma(' + (n === 99 ? 1 : n + 1) + ')">التالي ◀</button></div>' +
    '<div style="display:flex;gap:8px;margin-bottom:8px"><button ' + btn + ' onclick="toggleAsmaLearned(' + n + ')">' + (done ? "↩ إلغاء الحفظ" : "✅ حفظته") + '</button>' +
    '<button ' + btn + ' onclick="shareAsma(' + n + ')">📤 مشاركة</button></div>' +
    '<button ' + btn + ' style="width:100%;flex:none" onclick="renderAsmaList(\'\')">☰ كل الأسماء</button></div>';
  _asmaBody().innerHTML = h;
  _asmaBody().scrollTop = 0;
}

function toggleAsmaLearned(n) {
  var L = _asmaLearned(), i = L.indexOf(n);
  if (i >= 0) L.splice(i, 1); else L.push(n);
  localStorage.setItem("asmaLearned", JSON.stringify(L));
  showAsma(n);
}

function shareAsma(n) {
  var a = ASMA[n - 1];
  var txt = "﴿وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا﴾\n\n" + a.name + " (" + n + "/99)" + (a.mean ? "\n" + a.mean : "");
  if (navigator.share) { navigator.share({ text: txt }).catch(function () {}); }
  else if (navigator.clipboard) { navigator.clipboard.writeText(txt).then(function () { alert("✅ تم النسخ"); }); }
}

function closeAsma(e) {
  if (e && e.target !== e.currentTarget) return;
  var el = document.getElementById("asmaOverlay");
  if (el) el.remove();
}
