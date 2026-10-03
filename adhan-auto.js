/* adhan-auto.js — الأذان والتنبيه التلقائي بتوقيت صنعاء */
var _todayTimings = null, _todayKey = "";
var _adhanAudio = null, _adhanUnlocked = false;

function _unlockAdhan() {
  if (_adhanUnlocked) return;
  _adhanUnlocked = true;
  try {
    var a = new Audio("adhan.mp3");
    a.volume = 0;
    var p = a.play();
    if (p && p.then) p.then(function () { a.pause(); }).catch(function () { _adhanUnlocked = false; });
  } catch (e) { _adhanUnlocked = false; }
}
["touchstart", "click"].forEach(function (ev) {
  document.addEventListener(ev, _unlockAdhan, { once: true, passive: true });
});

function playAdhan(prayerName) {
  stopAdhan();
  try { if (typeof audio !== "undefined" && audio && !audio.paused) audio.pause(); } catch (e) {}
  var src = (prayerName === "الفجر") ? "adhan-fajr.mp3" : "adhan.mp3";
  _adhanAudio = new Audio(src);
  _adhanAudio.onerror = function () {
    if (src !== "adhan.mp3") { _adhanAudio = new Audio("adhan.mp3"); _adhanAudio.play().catch(function () {}); }
  };
  _adhanAudio.play().catch(function (e) { console.warn("تعذر تشغيل الأذان:", e); });
  var t = document.getElementById("prayerToast");
  if (t) {
    t.style.display = "block";
    t.innerHTML = "🕌 حان وقت صلاة " + prayerName + ' <button onclick="stopAdhan()" style="margin-right:10px;border:none;border-radius:12px;padding:4px 12px;background:#000;color:#FFD700;font-family:Tajawal">⏹ إيقاف</button>';
  }
}

function stopAdhan() {
  if (_adhanAudio) { try { _adhanAudio.pause(); _adhanAudio.currentTime = 0; } catch (e) {} _adhanAudio = null; }
  var t = document.getElementById("prayerToast");
  if (t) t.style.display = "none";
}

function sanaaNowHM() {
  var p = new Intl.DateTimeFormat("en-GB", { timeZone: SANAA_TZ, hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
  var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
  return (o.hour === "24" ? "00" : o.hour) + ":" + o.minute;
}

async function checkPrayerTime() {
  var key = sanaaDateStr();
  if (!_todayTimings || _todayKey !== key) {
    try {
      var d = await fetchPrayerTimes(SANAA.lat, SANAA.lon);
      _todayTimings = d.timings; _todayKey = key;
    } catch (e) { return; }
  }
  var now = sanaaNowHM();
  var list = [["الفجر", "Fajr"], ["الظهر", "Dhuhr"], ["العصر", "Asr"], ["المغرب", "Maghrib"], ["العشاء", "Isha"]];
  list.forEach(function (it) {
    var t = String(_todayTimings[it[1]] || "").slice(0, 5);
    var id = it[0] + key + t;
    if (t === now && lastNotifiedPrayer !== id) {
      lastNotifiedPrayer = id;
      showPrayerNotification(it[0]);
      playAdhan(it[0]);
    }
  });
}
