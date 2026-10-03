/* adhan-auto.js — الأذان والتنبيه التلقائي بتوقيت صنعاء (نسخة محسنة) */
var _todayTimings = null, _todayKey = "";
var _adhanAudio = null, _adhanUnlocked = false;
var _nextAdhanTimer = null;
var lastNotifiedPrayer = "";

function _preloadAdhan() {
  if (_adhanAudio) return;
  try {
    _adhanAudio = new Audio("adhan.mp3");
    _adhanAudio.preload = "auto";
    _adhanAudio.load();
  } catch (e) { console.warn("تعذر تحميل الأذان:", e); }
}

function _unlockAdhan() {
  if (_adhanUnlocked) return;
  _adhanUnlocked = true;
  try {
    _preloadAdhan();
    var p = _adhanAudio.play();
    if (p && p.then) {
      p.then(function () { _adhanAudio.pause(); _adhanAudio.currentTime = 0; })
       .catch(function () { _adhanUnlocked = false; });
    }
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
    if (src !== "adhan.mp3") {
      _adhanAudio = new Audio("adhan.mp3");
      _adhanAudio.play().catch(function () {});
    }
  };

  var p = _adhanAudio.play();
  if (p && p.catch) {
    p.catch(function (e) {
      console.warn("تعذر تشغيل الأذان تلقائياً:", e);
      var btn = document.createElement("button");
      btn.textContent = "🔔 اضغط لتشغيل الأذان";
      btn.style.cssText = "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999;padding:10px 20px;background:#c8952a;color:#000;border:none;border-radius:20px;font-weight:bold;";
      btn.onclick = function() { _adhanAudio.play(); btn.remove(); };
      document.body.appendChild(btn);
    });
  }

  var t = document.getElementById("prayerToast");
  if (t) {
    t.style.display = "block";
    t.innerHTML = "🕌 حان وقت صلاة " + prayerName +
      ' <button onclick="stopAdhan()" style="margin-right:10px;border:none;border-radius:12px;padding:4px 12px;background:#000;color:#FFD700;font-family:Tajawal">⏹ إيقاف</button>';
  }
}

function stopAdhan() {
  if (_adhanAudio) {
    try { _adhanAudio.pause(); _adhanAudio.currentTime = 0; } catch (e) {}
    _adhanAudio = null;
  }
  var t = document.getElementById("prayerToast");
  if (t) t.style.display = "none";
}

function sanaaNowHM() {
  var p = new Intl.DateTimeFormat("en-GB", { timeZone: SANAA_TZ, hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
  var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
  return (o.hour === "24" ? "00" : o.hour) + ":" + o.minute;
}

function _scheduleNextAdhan() {
  if (_nextAdhanTimer) clearTimeout(_nextAdhanTimer);
  if (!_todayTimings) return;

  var now = new Date();
  var list = [
    ["الفجر", "Fajr"], ["الظهر", "Dhuhr"], ["العصر", "Asr"],
    ["المغرب", "Maghrib"], ["العشاء", "Isha"]
  ];

  var nextTime = null;
  var nextPrayer = null;

  list.forEach(function (it) {
    var t = String(_todayTimings[it[1]] || "").slice(0, 5);
    if (!t) return;
    var parts = t.split(":");
    var target = new Date(now);
    target.setUTCHours(parseInt(parts[0]) - 3, parseInt(parts[1]), 0, 0);

    if (target.getTime() > now.getTime()) {
      if (!nextTime || target.getTime() < nextTime.getTime()) {
        nextTime = target;
        nextPrayer = it[0];
      }
    }
  });

  if (nextTime && nextPrayer) {
    var delay = nextTime.getTime() - now.getTime();
    console.log("⏰ الأذان القادم: " + nextPrayer + " بعد " + Math.round(delay / 60000) + " دقيقة");

    _nextAdhanTimer = setTimeout(function () {
      console.log("🔔 حان وقت " + nextPrayer);
      lastNotifiedPrayer = nextPrayer + _todayKey;
      showPrayerNotification(nextPrayer);
      playAdhan(nextPrayer);
      _scheduleNextAdhan();
    }, delay);
  } else {
    setTimeout(function () {
      _todayTimings = null;
      checkPrayerTime();
    }, 3600000);
  }
}

async function checkPrayerTime() {
  var key = sanaaDateStr();
  if (!_todayTimings || _todayKey !== key) {
    try {
      var d = await fetchPrayerTimes(SANAA.lat, SANAA.lon);
      _todayTimings = d.timings;
      _todayKey = key;
      console.log("✅ تم جلب مواقيت اليوم:", _todayTimings);
    } catch (e) {
      console.error("❌ فشل جلب المواقيت:", e);
      return;
    }
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

  _scheduleNextAdhan();
}

function toggleAutoPrayer() {
  // في التطبيق الأصلي (APK): استخدم Native (يعمل حتى مع إغلاق التطبيق)
  if (typeof Capacitor !== "undefined" && Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
    if (typeof window.toggleAutoPrayerNative === "function") {
      return window.toggleAutoPrayerNative();
    }
  }
  // في المتصفح: استخدم الوضع العادي
  var toast = document.getElementById("prayerToast");
  var isOn = localStorage.getItem("autoPrayer") === "1";

  if (isOn) {
    localStorage.setItem("autoPrayer", "0");
    if (_nextAdhanTimer) { clearTimeout(_nextAdhanTimer); _nextAdhanTimer = null; }
    if (toast) {
      toast.textContent = "🔕 تم إيقاف التنبيه التلقائي للصلاة";
      toast.style.display = "block";
      setTimeout(function () { toast.style.display = "none"; }, 2000);
    }
    console.log("🔕 Auto prayer disabled");
  } else {
    localStorage.setItem("autoPrayer", "1");
    checkPrayerTime();
    if (toast) {
      toast.textContent = "🔔 تم تفعيل التنبيه التلقائي. سيتم تشغيل الأذان عند دخول الوقت";
      toast.style.display = "block";
      setTimeout(function () { toast.style.display = "none"; }, 3000);
    }
    console.log("🔔 Auto prayer enabled");
  }
}

setTimeout(function () {
  if (localStorage.getItem("autoPrayer") !== "1") return;
  checkPrayerTime();
}, 1500);

document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible" && localStorage.getItem("autoPrayer") === "1") {
    checkPrayerTime();
  }
});
