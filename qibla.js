/* qibla.js — بوصلة القبلة الحية */
var Q_KAABA = { lat: 21.422487, lon: 39.826206 };
var _qHeading = null, _qSmooth = null, _qAligned = false, _qQibla = 0, _qOn = false;

function qiblaBearing(lat, lon) {
  var r = Math.PI / 180, p1 = lat * r, p2 = Q_KAABA.lat * r, dl = (Q_KAABA.lon - lon) * r;
  var y = Math.sin(dl) * Math.cos(p2);
  var x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return (Math.atan2(y, x) / r + 360) % 360;
}
function qiblaDistance(lat, lon) {
  var r = Math.PI / 180, dp = (Q_KAABA.lat - lat) * r, dl = (Q_KAABA.lon - lon) * r;
  var a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(lat * r) * Math.cos(Q_KAABA.lat * r) * Math.sin(dl / 2) * Math.sin(dl / 2);
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function _qOnOrient(e) {
  var h = null;
  if (typeof e.webkitCompassHeading === "number") h = e.webkitCompassHeading;
  else if (e.absolute === true && e.alpha != null) h = (360 - e.alpha) % 360;
  else return;
  if (_qSmooth === null) _qSmooth = h;
  else { var d = ((h - _qSmooth + 540) % 360) - 180; _qSmooth = (_qSmooth + d * 0.2 + 360) % 360; }
  _qHeading = _qSmooth;
  _qRender();
}

async function qiblaStart() {
  try {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      var r = await DeviceOrientationEvent.requestPermission();
      if (r !== "granted") return false;
    }
  } catch (e) { return false; }
  window.addEventListener("deviceorientationabsolute", _qOnOrient, true);
  window.addEventListener("deviceorientation", _qOnOrient, true);
  _qOn = true;
  return true;
}

function qiblaStop() {
  window.removeEventListener("deviceorientationabsolute", _qOnOrient, true);
  window.removeEventListener("deviceorientation", _qOnOrient, true);
  _qOn = false; _qHeading = null; _qSmooth = null; _qAligned = false;
}

function _qDial() {
  var s = '<circle cx="150" cy="150" r="140" fill="rgba(0,0,0,0.35)" stroke="rgba(255,215,0,0.25)" stroke-width="1"/>';
  s += '<circle id="qRing" cx="150" cy="150" r="130" fill="none" stroke="#FFD700" stroke-width="3"/>';
  s += '<circle cx="150" cy="150" r="92" fill="none" stroke="rgba(255,215,0,0.15)" stroke-width="1"/>';
  for (var i = 0; i < 36; i++) {
    if (i % 9 === 0) continue;
    var len = i % 3 === 0 ? 10 : 5;
    s += '<line x1="150" y1="20" x2="150" y2="' + (20 + len) + '" stroke="rgba(255,215,0,0.55)" stroke-width="1.5" transform="rotate(' + (i * 10) + ' 150 150)"/>';
  }
  var L = [["ش", 0, "#ff5252"], ["ق", 90, "#FFD700"], ["ج", 180, "#FFD700"], ["غ", 270, "#FFD700"]];
  L.forEach(function (c) {
    s += '<text x="150" y="52" text-anchor="middle" font-size="22" font-weight="700" font-family="Tajawal" fill="' + c[2] + '" transform="rotate(' + c[1] + ' 150 150)">' + c[0] + '</text>';
  });
  s += '<g transform="rotate(' + _qQibla + ' 150 150)"><line x1="150" y1="150" x2="150" y2="62" stroke="rgba(76,175,80,0.55)" stroke-width="2" stroke-dasharray="4 4"/>' +
    '<circle cx="150" cy="40" r="19" fill="#0f2027" stroke="#FFD700" stroke-width="2"/>' +
    '<text x="150" y="48" text-anchor="middle" font-size="22" transform="rotate(' + (-_qQibla) + ' 150 40)">🕋</text></g>';
  return s;
}

function _qRender() {
  var dial = document.getElementById("qDial");
  if (!dial || _qHeading === null) return;
  dial.setAttribute("transform", "rotate(" + (-_qHeading).toFixed(1) + " 150 150)");
  var diff = ((_qQibla - _qHeading + 540) % 360) - 180, ad = Math.abs(diff);
  var ok = ad <= 4;
  var ring = document.getElementById("qRing"), msg = document.getElementById("qMsg"), hd = document.getElementById("qHead"), pt = document.getElementById("qPtr");
  if (ring) ring.setAttribute("stroke", ok ? "#4CAF50" : "#FFD700");
  if (pt) pt.setAttribute("fill", ok ? "#4CAF50" : "#FFD700");
  var wrap = document.getElementById("qWrap");
  if (wrap) wrap.style.filter = ok ? "drop-shadow(0 0 18px rgba(76,175,80,0.8))" : "none";
  if (hd) hd.textContent = Math.round(_qHeading) + "°";
  if (msg) {
    msg.textContent = ok ? "✅ أنت باتجاه القبلة" : "أدر الجهاز " + (diff > 0 ? "يمينًا" : "يسارًا") + " " + Math.round(ad) + "°";
    msg.style.color = ok ? "#4CAF50" : "#fff";
  }
  if (ok && !_qAligned && navigator.vibrate) navigator.vibrate(60);
  _qAligned = ok;
}

async function openQibla(lat, lon) {
  if (typeof lat !== "number" || typeof lon !== "number") { lat = 15.3694; lon = 44.1910; }
  closeQibla();
  _qQibla = qiblaBearing(lat, lon);
  var km = qiblaDistance(lat, lon);
  var h = '<div id="qiblaOverlay" class="picker-overlay" onclick="closeQibla(event)">' +
    '<div class="picker-content" onclick="event.stopPropagation()" style="max-width:420px">' +
    '<div class="picker-header"><h3>🧭 اتجاه القبلة</h3><button class="picker-close" onclick="closeQibla()">✕</button></div>' +
    '<div class="settings-body" style="text-align:center;padding:14px">' +
    '<div id="qWrap" style="width:min(86vw,320px);margin:6px auto;transition:filter .3s">' +
    '<svg viewBox="0 0 300 300" style="width:100%;height:auto;display:block">' +
    '<g id="qDial">' + _qDial() + '</g>' +
    '<polygon id="qPtr" points="150,2 140,24 160,24" fill="#FFD700"/>' +
    '<circle cx="150" cy="150" r="5" fill="#FFD700"/></svg></div>' +
    '<div id="qMsg" style="font-size:20px;font-weight:700;color:#fff;margin:10px 0 4px">جاري قراءة البوصلة...</div>' +
    '<div style="color:#aaa;font-size:13px">اتجاهك: <b id="qHead" style="color:#FFD700">--</b> &nbsp;|&nbsp; القبلة: <b style="color:#FFD700">' + Math.round(_qQibla) + '°</b> &nbsp;|&nbsp; المسافة: <b style="color:#FFD700">' + km + ' كم</b></div>' +
    '<div style="color:#888;font-size:12px;margin-top:12px;line-height:1.8">أمسك الجهاز أفقيًا ثم أدِره حتى يصل 🕋 إلى المؤشر العلوي.<br>للمعايرة: حرّك الجهاز على شكل ٨، وابتعد عن المعادن والمغناطيس.</div>' +
    '</div></div></div>';
  document.body.insertAdjacentHTML("beforeend", h);
  var ok = await qiblaStart();
  setTimeout(function () {
    if (_qHeading === null) {
      var m = document.getElementById("qMsg");
      if (m) { m.style.fontSize = "15px"; m.textContent = ok ? "لم يصل أي قراءة من حساس الاتجاه. اتجاه القبلة " + Math.round(_qQibla) + "° من الشمال." : "تم رفض إذن حساس الاتجاه. اتجاه القبلة " + Math.round(_qQibla) + "° من الشمال."; }
    }
  }, 2500);
}

function closeQibla(e) {
  if (e && e.target !== e.currentTarget) return;
  qiblaStop();
  var el = document.getElementById("qiblaOverlay");
  if (el) el.remove();
}
