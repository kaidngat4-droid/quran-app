/* prayer.js — مواقيت الصلاة والقبلة والتنبيهات */

async function getCurrentLocation() {
  try {
    if (typeof Capacitor === "undefined" || !Capacitor.Plugins.Geolocation) {
      // fallback: استخدام موقع افتراضي (اليمن - صنعاء)
      console.warn("Capacitor Geolocation غير متوفر، استخدام موقع افتراضي");
      return { lat: 15.3694, lon: 44.1910 };
    }
    var perm = await Capacitor.Plugins.Geolocation.checkPermissions();
    if (perm.location !== "granted") {
      perm = await Capacitor.Plugins.Geolocation.requestPermissions();
    }
    if (perm.location !== "granted") {
      alert("⚠️ نحتاج إذن الموقع لحساب مواقيت الصلاة");
      return { lat: 15.3694, lon: 44.1910 };
    }
    var pos = await Capacitor.Plugins.Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000
    });
    return { lat: pos.coords.latitude, lon: pos.coords.longitude };
  } catch (e) {
    console.error("خطأ الموقع:", e);
    return { lat: 15.3694, lon: 44.1910 };
  }
}

async function fetchPrayerTimes(lat, lon) {
  var today = new Date();
  var d = String(today.getDate()).padStart(2, "0");
  var m = String(today.getMonth() + 1).padStart(2, "0");
  var y = today.getFullYear();
  var dateStr = d + "-" + m + "-" + y;
  var url = "https://api.aladhan.com/v1/timings/" + dateStr + "?latitude=" + lat + "&longitude=" + lon + "&method=3";
  var res = await fetch(url);
  var data = await res.json();
  return data.data;
}

async function openPrayerTimes() {
  var html = '<div class="picker-overlay" onclick="closePrayerTimes(event)">';
  html += '<div class="picker-content" onclick="event.stopPropagation()">';
  html += '<div class="picker-header"><h3>🕌 مواقيت الصلاة</h3>';
  html += '<button class="picker-close" onclick="closePrayerTimes()">✕</button></div>';
  html += '<div class="settings-body" id="prayerBody">';
  html += '<p style="text-align:center;color:#FFD700;padding:20px">📍 جاري تحديد الموقع...</p>';
  html += '</div></div></div>';
  document.body.insertAdjacentHTML("beforeend", html);

  var loc = await getCurrentLocation();
  var body = document.getElementById("prayerBody");
  body.innerHTML = '<p style="text-align:center;color:#FFD700;padding:20px">🕌 جاري جلب المواقيت...</p>';

  try {
    var data = await fetchPrayerTimes(loc.lat, loc.lon);
    var t = data.timings;
    var hijri = data.date.hijri;
    var prayers = [
      { name: "الفجر", icon: "🌅", time: t.Fajr },
      { name: "الشروق", icon: "☀️", time: t.Sunrise },
      { name: "الظهر", icon: "🌤️", time: t.Dhuhr },
      { name: "العصر", icon: "🌇", time: t.Asr },
      { name: "المغرب", icon: "🌆", time: t.Maghrib },
      { name: "العشاء", icon: "🌙", time: t.Isha }
    ];

    var h = '<div style="text-align:center;padding:10px;margin-bottom:10px">';
    h += '<div style="color:#FFD700;font-size:16px">' + hijri.weekday.ar + " " + hijri.day + " " + hijri.month.ar + " " + hijri.year + " هـ</div>";
    h += '</div>';

    for (var i = 0; i < prayers.length; i++) {
      var p = prayers[i];
      h += '<div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:14px;margin:8px 0;display:flex;justify-content:space-between;align-items:center">';
      h += '<div style="display:flex;align-items:center;gap:12px"><span style="font-size:24px">' + p.icon + '</span>';
      h += '<span style="color:#fff;font-size:16px;font-weight:600">' + p.name + '</span></div>';
      h += '<span style="color:#FFD700;font-size:18px;font-weight:700">' + p.time + '</span>';
      h += '</div>';
    }
    h += '<button class="setting-btn" onclick="openQibla(' + loc.lat + ',' + loc.lon + ')" style="margin-top:15px">🧭 اتجاه القبلة</button>';
    body.innerHTML = h;
  } catch (e) {
    body.innerHTML = '<p style="text-align:center;color:#f44336;padding:20px">⚠️ فشل جلب المواقيت: ' + e.message + '</p>';
  }
}

function closePrayerTimes(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains("picker-close")) return;
  var el = document.querySelector(".picker-overlay");
  if (el) el.remove();
}

async function openQibla(lat, lon) {
  var qibla = calculateQibla(lat, lon);
  var html = '<div class="picker-overlay" onclick="closeQibla(event)">';
  html += '<div class="picker-content" onclick="event.stopPropagation()">';
  html += '<div class="picker-header"><h3>🧭 اتجاه القبلة</h3>';
  html += '<button class="picker-close" onclick="closeQibla()">✕</button></div>';
  html += '<div class="settings-body" style="text-align:center">';
  html += '<div style="position:relative;width:250px;height:250px;margin:20px auto">';
  html += '<div style="position:absolute;inset:0;border:5px solid #FFD700;border-radius:50%;background:rgba(0,0,0,0.3)">';
  html += '<div style="position:absolute;top:10px;left:50%;transform:translateX(-50%);color:#FFD700;font-size:14px">ش</div>';
  html += '<div style="position:absolute;bottom:10px;left:50%;transform:translateX(-50%);color:#FFD700;font-size:14px">ج</div>';
  html += '<div style="position:absolute;right:10px;top:50%;transform:translateY(-50%);color:#FFD700;font-size:14px">ق</div>';
  html += '<div style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#FFD700;font-size:14px">غ</div>';
  html += '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-100%) rotate(' + qibla + 'deg);transform-origin:50% 100%;font-size:60px;color:#4CAF50">⬆️</div>';
  html += '</div></div>';
  html += '<p style="color:#fff;font-size:20px;margin:15px 0">اتجاه القبلة: <b style="color:#FFD700">' + qibla + '°</b></p>';
  html += '<p style="color:#aaa;font-size:13px">وجّه هاتفك حتى يشير السهم للأعلى</p>';
  html += '</div></div></div>';
  document.body.insertAdjacentHTML("beforeend", html);
}

function calculateQibla(lat, lon) {
  var kaabaLat = 21.4225;
  var kaabaLon = 39.8262;
  var latRad = lat * Math.PI / 180;
  var lonRad = lon * Math.PI / 180;
  var kaabaLatRad = kaabaLat * Math.PI / 180;
  var kaabaLonRad = kaabaLon * Math.PI / 180;
  var dLon = kaabaLonRad - lonRad;
  var y = Math.sin(dLon);
  var x = Math.cos(latRad) * Math.tan(kaabaLatRad) - Math.sin(latRad) * Math.cos(dLon);
  var qibla = Math.atan2(y, x) * 180 / Math.PI;
  return Math.round((qibla + 360) % 360);
}

function closeQibla(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains("picker-close")) return;
  var el = document.querySelector(".picker-overlay");
  if (el) el.remove();
}
