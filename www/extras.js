/* extras.js — ميزات إضافية: الورد اليومي، المشاركة، التفسير، دعاء الختم */

/* ============ 1. الورد اليومي ============ */
function getDailyWird() {
  var today = new Date().toDateString();
  var saved = localStorage.getItem("dailyWird");
  if (saved) {
    try {
      var data = JSON.parse(saved);
      if (data.date === today) return data;
    } catch(e) {}
  }
  var dayOfMonth = new Date().getDate();
  var startPage = ((dayOfMonth - 1) * 20) + 1;
  var endPage = Math.min(startPage + 19, 604);
  var data = { date: today, startPage: startPage, endPage: endPage, done: false };
  localStorage.setItem("dailyWird", JSON.stringify(data));
  return data;
}

function openDailyWird() {
  var wird = getDailyWird();
  var pct = Math.round(((new Date().getDate() - 1) / 30) * 100);
  var html = '<div class="picker-overlay" onclick="closeWird(event)">';
  html += '<div class="picker-content" onclick="event.stopPropagation()">';
  html += '<div class="picker-header"><h3>📖 الورد اليومي</h3>';
  html += '<button class="picker-close" onclick="closeWird()">✕</button></div>';
  html += '<div class="settings-body">';
  html += '<div style="text-align:center;padding:20px">';
  html += '<div style="font-size:60px;margin-bottom:15px">📖</div>';
  html += '<h2 style="color:#FFD700;font-size:22px;margin-bottom:10px">ورد اليوم</h2>';
  html += '<p style="color:#aaa;margin:10px 0;font-size:14px">' + new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + '</p>';
  html += '<div style="background:rgba(255,215,0,0.08);border:2px solid #FFD700;border-radius:15px;padding:25px;margin:20px 0">';
  html += '<p style="color:#ccc;font-size:14px;margin-bottom:8px">الصفحات المقررة اليوم</p>';
  html += '<p style="color:#FFD700;font-size:26px;font-weight:700">' + wird.startPage + ' — ' + wird.endPage + '</p>';
  html += '<p style="color:#aaa;font-size:13px;margin-top:12px">الجزء ' + Math.ceil(wird.startPage / 20) + ' من 30</p>';
  html += '</div>';
  html += '<div style="background:rgba(255,215,0,0.1);border-radius:10px;padding:12px;margin:15px 0">';
  html += '<div style="height:8px;background:rgba(255,215,0,0.2);border-radius:4px;overflow:hidden">';
  html += '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,#FF5500,#FFAA00)"></div>';
  html += '</div>';
  html += '<p style="color:#aaa;font-size:12px;margin-top:6px">تقدمك في الشهر: ' + pct + '%</p>';
  html += '</div>';
  if (wird.done) {
    html += '<p style="color:#4CAF50;font-size:16px;padding:15px">✅ أتممت ورد اليوم — تقبل الله منك</p>';
  } else {
    html += '<button onclick="markWirdDone()" style="background:linear-gradient(135deg,#4CAF50,#8BC34A);color:#fff;border:none;padding:14px 30px;border-radius:12px;font-size:16px;font-family:Tajawal;cursor:pointer;width:100%;font-weight:600">✅ أتممت الورد</button>';
  }
  html += '</div></div></div></div>';
  document.body.insertAdjacentHTML("beforeend", html);
}

function markWirdDone() {
  var wird = getDailyWird();
  wird.done = true;
  localStorage.setItem("dailyWird", JSON.stringify(wird));
  closeWird();
  setTimeout(openDailyWird, 200);
}

function closeWird(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains("picker-close")) return;
  var el = document.querySelector(".picker-overlay");
  if (el) el.remove();
}

/* ============ 2. صفحة العلامات كاملة مع حذف ============ */
function openBookmarksFull() {
  var bms = [];
  try { bms = JSON.parse(localStorage.getItem("bookmarks") || "[]"); } catch(e) {}
  if (bms.length === 0) {
    alert("لا توجد إشارات مرجعية بعد.\nاضغط ضغطة طويلة على أي آية لإضافتها.");
    return;
  }
  var html = '<div class="picker-overlay" onclick="closeBookmarksFull(event)">';
  html += '<div class="picker-content" onclick="event.stopPropagation()">';
  html += '<div class="picker-header"><h3>🔖 العلامات المرجعية (' + bms.length + ')</h3>';
  html += '<button class="picker-close" onclick="closeBookmarksFull()">✕</button></div>';
  html += '<div class="picker-list">';
  for (var i = 0; i < bms.length; i++) {
    var b = bms[i];
    html += '<div class="picker-item" style="cursor:default">';
    html += '<button onclick="closeBookmarksFull(); jumpToBookmark(' + b.surah + ',' + b.ayah + ')" style="flex:1;background:transparent;border:none;color:#fff;text-align:right;font-family:Tajawal;font-size:15px;cursor:pointer;padding:0">';
    html += '<span class="picker-flag">🔖</span> سورة ' + b.surah + ' — الآية ' + b.ayah;
    html += '</button>';
    html += '<button onclick="deleteBookmark(' + i + ')" style="background:rgba(244,67,54,0.2);border:1px solid rgba(244,67,54,0.4);color:#f44336;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:14px">🗑️</button>';
    html += '</div>';
  }
  html += '</div></div></div>';
  document.body.insertAdjacentHTML("beforeend", html);
}

function deleteBookmark(idx) {
  var bms = JSON.parse(localStorage.getItem("bookmarks") || "[]");
  bms.splice(idx, 1);
  localStorage.setItem("bookmarks", JSON.stringify(bms));
  closeBookmarksFull();
  setTimeout(openBookmarksFull, 200);
}

function closeBookmarksFull(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains("picker-close")) return;
  var el = document.querySelector(".picker-overlay");
  if (el) el.remove();
}

function jumpToBookmark(surah, ayah) {
  if (typeof loadSurah === "function") {
    loadSurah(surah);
    setTimeout(function() {
      var el = document.querySelector('.ayah[data-index="' + (ayah-1) + '"]');
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 800);
  }
}

/* ============ 3. مشاركة الآيات ============ */
function shareAyah(surahName, ayahNum, text) {
  var shareText = text + "\n\n(سورة " + surahName + " — الآية " + ayahNum + ")";
  var escapedText = text.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, '\\"');
  var escapedShare = shareText.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, "\\n");
  var html = '<div class="picker-overlay" onclick="closeShare(event)">';
  html += '<div class="picker-content" onclick="event.stopPropagation()">';
  html += '<div class="picker-header"><h3>📤 مشاركة الآية</h3>';
  html += '<button class="picker-close" onclick="closeShare()">✕</button></div>';
  html += '<div class="settings-body">';
  html += '<div style="background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.3);padding:18px;border-radius:12px;margin-bottom:15px;font-family:Amiri Quran,serif;font-size:19px;color:#FFD700;text-align:center;line-height:1.9">';
  html += text + '</div>';
  html += '<button class="setting-btn" onclick="copyAyahText(\'' + escapedShare + '\')" style="margin-bottom:8px">📋 نسخ النص</button>';
  html += '<button class="setting-btn" onclick="nativeShareText(\'' + escapedShare + '\')" style="margin-bottom:8px">📱 مشاركة عبر التطبيقات</button>';
  html += '<button class="setting-btn" onclick="downloadAyahImage(\'' + escapedText + '\',\'' + surahName + '\',' + ayahNum + ')">🖼️ تنزيل كصورة</button>';
  html += '</div></div></div>';
  document.body.insertAdjacentHTML("beforeend", html);
}

function unescapeText(text) {
  return text.replace(/\\n/g, '\n').replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}

function copyAyahText(text) {
  var clean = unescapeText(text);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(clean).then(function() {
      alert("✅ تم النسخ");
      closeShare();
    });
  } else {
    var ta = document.createElement("textarea");
    ta.value = clean;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    alert("✅ تم النسخ");
    closeShare();
  }
}

function nativeShareText(text) {
  var clean = unescapeText(text);
  if (navigator.share) {
    navigator.share({ text: clean }).then(function() { closeShare(); });
  } else {
    copyAyahText(text);
  }
}

function downloadAyahImage(text, surahName, ayahNum) {
  var clean = unescapeText(text);
  var canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  var ctx = canvas.getContext("2d");
  var gradient = ctx.createLinearGradient(0, 0, 0, 1080);
  gradient.addColorStop(0, "#0f2027");
  gradient.addColorStop(1, "#203a43");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1080);
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = 5;
  ctx.strokeRect(40, 40, 1000, 1000);
  ctx.strokeStyle = "rgba(255,215,0,0.3)";
  ctx.lineWidth = 2;
  ctx.strokeRect(55, 55, 970, 970);
  ctx.textAlign = "center";
  ctx.direction = "rtl";
  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 42px serif";
  ctx.fillText("﷽", 540, 130);
  var words = clean.split(" ");
  var lines = [];
  var currentLine = "";
  ctx.font = "bold 38px serif";
  for (var i = 0; i < words.length; i++) {
    var test = currentLine ? currentLine + " " + words[i] : words[i];
    if (ctx.measureText(test).width > 900) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = test;
    }
  }
  if (currentLine) lines.push(currentLine);
  var startY = 540 - ((lines.length - 1) * 35);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 38px serif";
  for (var j = 0; j < lines.length; j++) {
    ctx.fillText(lines[j], 540, startY + (j * 75));
  }
  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 28px serif";
  ctx.fillText("سورة " + surahName + " • الآية " + ayahNum, 540, 990);
  canvas.toBlob(function(blob) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "ayah-" + surahName + "-" + ayahNum + ".png";
    a.click();
    URL.revokeObjectURL(url);
    closeShare();
  });
}

function closeShare(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains("picker-close")) return;
  var el = document.querySelector(".picker-overlay");
  if (el) el.remove();
}

/* ============ 4. التفسير ============ */
function openTafsir(surahNum, ayahNum) {
  var html = '<div class="picker-overlay" onclick="closeTafsir(event)">';
  html += '<div class="picker-content" onclick="event.stopPropagation()">';
  html += '<div class="picker-header"><h3>📚 التفسير الميسر</h3>';
  html += '<button class="picker-close" onclick="closeTafsir()">✕</button></div>';
  html += '<div class="settings-body" id="tafsirBody">';
  html += '<p style="text-align:center;color:#FFD700;padding:20px">جاري تحميل التفسير...</p>';
  html += '</div></div></div>';
  document.body.insertAdjacentHTML("beforeend", html);

  fetch("https://api.alquran.cloud/v1/ayah/" + surahNum + ":" + ayahNum + "/ar.muyassar")
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var tafsir = data.data.text;
      var el = document.getElementById("tafsirBody");
      if (el) {
        el.innerHTML = '<div style="font-family:Amiri Quran,serif;font-size:18px;line-height:2;color:#fff;text-align:right;padding:15px;background:rgba(255,215,0,0.05);border-radius:12px;border:1px solid rgba(255,215,0,0.2)">' + tafsir + '</div>';
      }
    })
    .catch(function(e) {
      var el = document.getElementById("tafsirBody");
      if (el) el.innerHTML = '<p style="text-align:center;color:#f44336;padding:20px">⚠️ التفسير يحتاج اتصالاً بالإنترنت</p>';
    });
}

function closeTafsir(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains("picker-close")) return;
  var el = document.querySelector(".picker-overlay");
  if (el) el.remove();
}

/* ============ 5. دعاء ختم القرآن ============ */
var KHATM_DUA = "اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ، وَاجْعَلْهُ لِي إِمَاماً وَنُوراً وَهُدًى وَرَحْمَةً، اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ، وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ، وَارْزُقْنِي تِلَاوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ، وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ الْعَالَمِينَ.\n\nاللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي، وَاجْعَلِ الْحَيَاةَ زِيَادَةً لِي فِي كُلِّ خَيْرٍ، وَاجْعَلِ الْمَوْتَ رَاحَةً لِي مِنْ كُلِّ شَرٍّ.\n\nاللَّهُمَّ اجْعَلْ خَيْرَ عُمُرِي آخِرَهُ، وَخَيْرَ عَمَلِي خَوَاتِمَهُ، وَخَيْرَ أَيَّامِي يَوْمَ أَلْقَاكَ فِيهِ.\n\nاللَّهُمَّ إِنِّي أَسْأَلُكَ عِيشَةً هَنِيَّةً، وَمِيتَةً سَوِيَّةً، وَمَرَدًّا غَيْرَ مُخْزٍ وَلَا فَاضِحٍ.\n\nاللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَسْأَلَةِ، وَخَيْرَ الدُّعَاءِ، وَخَيْرَ النَّجَاحِ، وَخَيْرَ الْعِلْمِ، وَخَيْرَ الْعَمَلِ، وَخَيْرَ الثَّوَابِ، وَخَيْرَ الْحَيَاةِ، وَخَيْرَ الْمَمَاتِ، وَثَبِّتْنِي وَثَقِّلْ مَوَازِينِي، وَحَقِّقْ إِيمَانِي، وَارْفَعْ دَرَجَاتِي، وَتَقَبَّلْ صَلَاتِي، وَاغْفِرْ خَطِيئَاتِي، وَأَسْأَلُكَ الدَّرَجَاتِ الْعُلَى مِنَ الْجَنَّةِ.\n\nاللَّهُمَّ إِنِّي أَسْأَلُكَ مُوجِبَاتِ رَحْمَتِكَ، وَعَزَائِمَ مَغْفِرَتِكَ، وَالسَّلَامَةَ مِنْ كُلِّ إِثْمٍ، وَالْغَنِيمَةَ مِنْ كُلِّ بِرٍّ، وَالْفَوْزَ بِالْجَنَّةِ، وَالنَّجَاةَ مِنَ النَّارِ.\n\nاللَّهُمَّ أَحْسِنْ عَاقِبَتَنَا فِي الْأُمُورِ كُلِّهَا، وَأَجِرْنَا مِنْ خِزْيِ الدُّنْيَا وَعَذَابِ الْآخِرَةِ.\n\nاللَّهُمَّ اقْسِمْ لَنَا مِنْ خَشْيَتِكَ مَا تَحُولُ بِهِ بَيْنَنَا وَبَيْنَ مَعَاصِيكَ، وَمِنْ طَاعَتِكَ مَا تُبَلِّغُنَا بِهِ جَنَّتَكَ، وَمِنَ الْيَقِينِ مَا تُهَوِّنُ بِهِ عَلَيْنَا مَصَائِبَ الدُّنْيَا، وَمَتِّعْنَا بِأَسْمَاعِنَا وَأَبْصَارِنَا وَقُوَّاتِنَا مَا أَحْيَيْتَنَا، وَاجْعَلْهُ الْوَارِثَ مِنَّا، وَاجْعَلْ ثَأْرَنَا عَلَى مَنْ ظَلَمَنَا، وَانْصُرْنَا عَلَى مَنْ عَادَانَا، وَلَا تَجْعَلْ مُصِيبَتَنَا فِي دِينِنَا، وَلَا تَجْعَلِ الدُّنْيَا أَكْبَرَ هَمِّنَا وَلَا مَبْلَغَ عِلْمِنَا، وَلَا تُسَلِّطْ عَلَيْنَا مَنْ لَا يَرْحَمُنَا.\n\nاللَّهُمَّ لَا تَدَعْ لَنَا ذَنْباً إِلَّا غَفَرْتَهُ، وَلَا هَمّاً إِلَّا فَرَّجْتَهُ، وَلَا دَيْناً إِلَّا قَضَيْتَهُ، وَلَا حَاجَةً مِنْ حَوَائِجِ الدُّنْيَا وَالْآخِرَةِ إِلَّا قَضَيْتَهَا يَا أَرْحَمَ الرَّاحِمِينَ.\n\nرَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.\n\nوَصَلَّى اللَّهُ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلَّمَ تَسْلِيماً وَالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ.";

function openKhatmDua() {
  var html = '<div class="picker-overlay" onclick="closeKhatm(event)">';
  html += '<div class="picker-content" onclick="event.stopPropagation()">';
  html += '<div class="picker-header"><h3>🤲 دعاء ختم القرآن</h3>';
  html += '<button class="picker-close" onclick="closeKhatm()">✕</button></div>';
  html += '<div class="settings-body" style="max-height:75vh;overflow-y:auto">';
  html += '<div style="text-align:center;font-size:45px;margin:10px 0">🤲</div>';
  html += '<div style="text-align:center;color:#FFD700;font-size:16px;margin-bottom:15px">دعاء ختم القرآن الكريم</div>';
  html += '<div style="font-family:Amiri Quran,serif;font-size:19px;line-height:2.2;color:#fff;text-align:right;padding:18px;background:rgba(255,215,0,0.05);border-radius:15px;border:1px solid rgba(255,215,0,0.2)">';
  html += KHATM_DUA.replace(/\n/g, "<br><br>");
  html += '</div>';
  html += '<button class="setting-btn" onclick="copyKhatmDua()" style="margin-top:15px">📋 نسخ الدعاء</button>';
  html += '</div></div></div>';
  document.body.insertAdjacentHTML("beforeend", html);
}

function copyKhatmDua() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(KHATM_DUA).then(function() {
      alert("✅ تم نسخ الدعاء");
    });
  }
}

function closeKhatm(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains("picker-close")) return;
  var el = document.querySelector(".picker-overlay");
  if (el) el.remove();
}

/* ==== دوال مساعدة ==== */
function closeSidebar() {
  var sb = document.getElementById("sidebar");
  var ov = document.getElementById("overlay");
  if (sb) sb.classList.remove("open");
  if (ov) ov.classList.remove("show");
}
