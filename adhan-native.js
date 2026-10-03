/* adhan-native.js — أذان بإشعارات النظام (يعمل والتطبيق مغلق) */
var ADHAN_CHANNEL = "adhan_v1";
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
function _ds(d) {
  var p = new Intl.DateTimeFormat("en-GB", { timeZone: SANAA_TZ, day: "2-digit", month: "2-digit", year: "numeric" }).formatToParts(d);
  var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
  return o.day + "-" + o.month + "-" + o.year;
}
async function _timingsFor(ds) {
  var u = "https://api.aladhan.com/v1/timings/" + ds + "?latitude=" + SANAA.lat + "&longitude=" + SANAA.lon + "&method=4&timezonestring=" + SANAA_TZ;
  var r = await fetch(u); var j = await r.json(); return j.data.timings;
}

async function _prepNative() {
  var LN = _LN();
  var p = await LN.checkPermissions();
  if (p.display !== "granted") p = await LN.requestPermissions();
  if (p.display !== "granted") { alert("فعّل إذن الإشعارات للتطبيق من إعدادات الجهاز"); return false; }
  try {
    if (LN.checkExactNotificationSetting) {
      var s = await LN.checkExactNotificationSetting();
      if (s.exact_alarm !== "granted" && LN.changeExactNotificationSetting) await LN.changeExactNotificationSetting();
    }
  } catch (e) {}
  try {
    await LN.createChannel({ id: ADHAN_CHANNEL, name: "الأذان", description: "تنبيه أوقات الصلاة",
      importance: 5, visibility: 1, sound: "adhan.mp3", vibration: true });
  } catch (e) {}
  return true;
}

async function scheduleNativeAdhan(withTest) {
  if (!_isNative()) return 0;
  var LN = _LN();
  if (!(await _prepNative())) return 0;
  var items = [], now = Date.now();
  for (var d = 0; d < 7; d++) {
    var ds = _ds(new Date(now + d * 86400000));
    var t;
    try { t = await _timingsFor(ds); } catch (e) { continue; }
    var q = ds.split("-");
    for (var i = 0; i < _PRAYERS.length; i++) {
      var hm = String(t[_PRAYERS[i][1]]).slice(0, 5);
      var at = new Date(q[2] + "-" + q[1] + "-" + q[0] + "T" + hm + ":00+03:00");
      if (at.getTime() > now + 5000) {
        items.push({ id: 100 + d * 10 + i, title: "🕌 حان وقت صلاة " + _PRAYERS[i][0], body: "حيّ على الصلاة",
          schedule: { at: at, allowWhileIdle: true }, channelId: ADHAN_CHANNEL, sound: "adhan.mp3" });
      }
    }
  }
  if (withTest) {
    items.push({ id: 999, title: "🕌 تجربة الأذان", body: "إذا سمعت الأذان فالتنبيه يعمل",
      schedule: { at: new Date(now + 60000), allowWhileIdle: true }, channelId: ADHAN_CHANNEL, sound: "adhan.mp3" });
  }
  if (!items.length) return 0;
  try {
    var pend = await LN.getPending();
    if (pend.notifications && pend.notifications.length)
      await LN.cancel({ notifications: pend.notifications.map(function (n) { return { id: n.id }; }) });
  } catch (e) {}
  await LN.schedule({ notifications: items });
  return items.length;
}

async function cancelNativeAdhan() {
  if (!_isNative()) return;
  var LN = _LN();
  try {
    var pend = await LN.getPending();
    if (pend.notifications && pend.notifications.length)
      await LN.cancel({ notifications: pend.notifications.map(function (n) { return { id: n.id }; }) });
  } catch (e) {}
}

function _startAuto() {
  if (_isNative()) return;
  if (!autoPrayerInterval) autoPrayerInterval = setInterval(checkPrayerTime, 60000);
}
function _stopAuto() {
  if (autoPrayerInterval) { clearInterval(autoPrayerInterval); autoPrayerInterval = null; }
}

async function toggleAutoPrayer() {
  var on = localStorage.getItem("autoPrayer") === "1";
  if (on) {
    localStorage.setItem("autoPrayer", "0");
    _stopAuto(); await cancelNativeAdhan();
    _ptoast("🔕 تم إيقاف التنبيه التلقائي");
    return;
  }
  localStorage.setItem("autoPrayer", "1");
  _startAuto();
  if (_isNative()) {
    var n = await scheduleNativeAdhan(true);
    _ptoast(n ? "🔔 تم التفعيل. ستصلك تجربة الأذان بعد دقيقة" : "⚠️ تعذر الجدولة (تحقق من الإنترنت والإذن)");
  } else {
    _ptoast("🔔 تم تفعيل التنبيه التلقائي (والتطبيق مفتوح)");
  }
}

setTimeout(function () {
  if (localStorage.getItem("autoPrayer") !== "1") return;
  if (_isNative()) scheduleNativeAdhan(false); else _startAuto();
}, 1500);
