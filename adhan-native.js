/* adhan-native.js — أذان بإشعارات النظام (يعمل والتطبيق مغلق) */
var ADHAN_CHANNEL = "adhan_v2";
var _PRAYERS = [["الفجر","Fajr"],["الظهر","Dhuhr"],["العصر","Asr"],["المغرب","Maghrib"],["العشاء","Isha"]];

function _LN() { return (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.LocalNotifications) || null; }
function _isNative() {
  return !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform() && _LN());
}

function _ptoast(msg) {
  var t = document.getElementById("prayerToast");
  if (!t) return;
  t.style.display = "block"; t.textContent = msg;
  setTimeout(function () { t.style.display = "none"; }, 3500);
}

function _sanaaDate(d) {
  var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Aden", day: "2-digit", month: "2-digit", year: "numeric" }).formatToParts(d);
  var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
  return o.day + "-" + o.month + "-" + o.year;
}

async function _timingsFor(ds) {
  var u = "https://api.aladhan.com/v1/timings/" + ds + "?latitude=" + SANAA.lat + "&longitude=" + SANAA.lon + "&method=4&timezonestring=" + SANAA_TZ;
  var r = await fetch(u); 
  var j = await r.json(); 
  return j.data.timings;
}

async function _prepNative() {
  var LN = _LN();
  var p = await LN.checkPermissions();
  if (p.display !== "granted") p = await LN.requestPermissions();
  if (p.display !== "granted") { 
    _ptoast("⚠️ فعّل إذن الإشعارات من إعدادات الجهاز"); 
    return false; 
  }
  try {
    if (LN.checkExactNotificationSetting) {
      var s = await LN.checkExactNotificationSetting();
      if (s.exact_alarm !== "granted" && LN.changeExactNotificationSetting) 
        await LN.changeExactNotificationSetting();
    }
  } catch (e) {}
  try {
    await LN.createChannel({ 
      id: ADHAN_CHANNEL, 
      name: "الأذان", 
      description: "تنبيه أوقات الصلاة",
      importance: 5, 
      visibility: 1, 
      sound: "adhan.mp3", 
      vibration: true 
    });
  } catch (e) {}
  return true;
}

async function scheduleNativeAdhan(withTest) {
  if (!_isNative()) return 0;
  var LN = _LN();
  if (!(await _prepNative())) return 0;
  
  var items = [], now = Date.now();
  
  // جدولة 7 أيام قادمة
  for (var d = 0; d < 7; d++) {
    var ds = _sanaaDate(new Date(now + d * 86400000));
    var t;
    try { t = await _timingsFor(ds); } catch (e) { 
      console.warn("فشل جلب مواقيت " + ds, e);
      continue; 
    }
    var q = ds.split("-");
    for (var i = 0; i < _PRAYERS.length; i++) {
      var hm = String(t[_PRAYERS[i][1]] || "").slice(0, 5);
      if (!hm) continue;
      // وقت الصلاة بتوقيت صنعاء (UTC+3) -> تحويل إلى UTC
      var at = new Date(Date.UTC(parseInt(q[2]), parseInt(q[1]) - 1, parseInt(q[0]), parseInt(hm.split(":")[0]) - 3, parseInt(hm.split(":")[1]), 0));
      if (at.getTime() > now + 5000) {
        items.push({ 
          id: 100 + d * 10 + i, 
          title: "🕌 حان وقت صلاة " + _PRAYERS[i][0], 
          body: "حيّ على الصلاة",
          schedule: { at: at, allowWhileIdle: true }, 
          channelId: ADHAN_CHANNEL, 
          sound: "adhan.mp3" 
        });
      }
    }
  }
  
  if (withTest) {
    items.push({ 
      id: 999, 
      title: "🕌 تجربة الأذان", 
      body: "إذا سمعت الأذان فالتنبيه يعمل",
      schedule: { at: new Date(now + 60000), allowWhileIdle: true }, 
      channelId: ADHAN_CHANNEL, 
      sound: "adhan.mp3" 
    });
  }
  
  if (!items.length) return 0;
  
  try {
    var pend = await LN.getPending();
    if (pend.notifications && pend.notifications.length)
      await LN.cancel({ notifications: pend.notifications.map(function (n) { return { id: n.id }; }) });
  } catch (e) {}
  
  await LN.schedule({ notifications: items });
  console.log("✅ تم جدولة " + items.length + " إشعار أذان");
  return items.length;
}

async function cancelNativeAdhan() {
  if (!_isNative()) return;
  var LN = _LN();
  try {
    var pend = await LN.getPending();
    if (pend.notifications && pend.notifications.length)
      await LN.cancel({ notifications: pend.notifications.map(function (n) { return { id: n.id }; }) });
    console.log("✅ تم إلغاء جميع إشعارات الأذان");
  } catch (e) {}
}

async function toggleAutoPrayerNative() {
  var isOn = localStorage.getItem("autoPrayer") === "1";
  
  if (isOn) {
    localStorage.setItem("autoPrayer", "0");
    await cancelNativeAdhan();
    _ptoast("🔕 تم إيقاف التنبيه التلقائي");
    console.log("🔕 Auto prayer disabled");
  } else {
    localStorage.setItem("autoPrayer", "1");
    var n = await scheduleNativeAdhan(true);
    _ptoast(n ? "🔔 تم التفعيل. ستصلك تجربة الأذان بعد دقيقة" : "⚠️ تعذر الجدولة (تحقق من الإنترنت والإذن)");
    console.log("🔔 Auto prayer enabled, scheduled " + n + " notifications");
  }
}

// استئناف الجدولة عند فتح التطبيق (إذا كان مفعّلاً)
setTimeout(function () {
  if (localStorage.getItem("autoPrayer") !== "1") return;
  if (!_isNative()) return;
  scheduleNativeAdhan(false);
}, 2000);

window.toggleAutoPrayerNative = toggleAutoPrayerNative;
