/* ============================================================
   settings.js — إعدادات التطبيق والقراء
   ============================================================ */

/* قائمة القراء الرسميين مع صور وأسماء */
const READERS = [
  { id: "ar.alafasy",            name: "مشاري راشد العفاسي",        country: "الكويت",    flag: "🇰🇼" },
  { id: "ar.abdulbasitmurattal", name: "عبد الباسط عبد الصمد",       country: "مصر",       flag: "🇪🇬" },
  { id: "ar.abdurrahmaansudais", name: "عبد الرحمن السديس",          country: "السعودية",  flag: "🇸🇦" },
  { id: "ar.abdullahbasfar",     name: "عبد الله بصفر",              country: "السعودية",  flag: "🇸🇦" },
  { id: "ar.husary",             name: "محمود خليل الحصري",          country: "مصر",       flag: "🇪🇬" },
  { id: "ar.husarymujawwad",     name: "الحصري (مجوّد)",             country: "مصر",       flag: "🇪🇬" },
  { id: "ar.minshawi",           name: "محمد صديق المنشاوي",         country: "مصر",       flag: "🇪🇬" },
  { id: "ar.minshawimujawwad",   name: "المنشاوي (مجوّد)",           country: "مصر",       flag: "🇪🇬" },
  { id: "ar.muhammadjibreel",    name: "محمد جبريل",                 country: "مصر",       flag: "🇪🇬" },
  { id: "ar.mahermuaiqly",       name: "ماهر المعيقلي",              country: "السعودية",  flag: "🇸🇦" },
  { id: "ar.shaatree",           name: "أبو بكر الشاطري",            country: "السعودية",  flag: "🇸🇦" },
  { id: "ar.hudhaify",           name: "علي بن عبد الرحمن الحذيفي",  country: "السعودية",  flag: "🇸🇦" },
  { id: "ar.ahmedajamy",         name: "أحمد بن علي العجمي",         country: "السعودية",  flag: "🇸🇦" },
  { id: "ar.hanirifai",          name: "هاني الرفاعي",               country: "السعودية",  flag: "🇸🇦" },
  { id: "ar.muhammadayyoub",     name: "محمد أيوب",                  country: "السعودية",  flag: "🇸🇦" },
  { id: "ar.ibrahimakhbar",      name: "إبراهيم الأخضر",             country: "السعودية",  flag: "🇸🇦" },
  { id: "ar.aymanswoaid",        name: "أيمن سويد",                  country: "سوريا",     flag: "🇸🇾" },
  { id: "ar.parhizgar",          name: "پرويز پارساي",               country: "إيران",     flag: "🇮🇷" }
];

/* الخطوط القرآنية */
const FONTS = [
  { id: "Amiri Quran",        name: "أميري قرآن" },
  { id: "Scheherazade New",   name: "شهرزاد" },
  { id: "Noto Naskh Arabic",  name: "نسخ" },
  { id: "Lateef",             name: "لطيف" },
  { id: "Tajawal",            name: "تجوّل (عادي)" }
];

/* الألوان */
const THEMES = [
  { id: "dark",   name: "داكن",        bg: "#0f2027", accent: "#FFD700" },
  { id: "night",  name: "ليلي",        bg: "#000000", accent: "#FFD700" },
  { id: "sepia",  name: "بني فاتح",    bg: "#f5e6c8", accent: "#8B4513" },
  { id: "light",  name: "فاتح",        bg: "#f5f5dc", accent: "#8B4513" },
  { id: "green",  name: "أخضر",        bg: "#1a3a2e", accent: "#7DD3A0" },
  { id: "blue",   name: "أزرق",        bg: "#0a1929", accent: "#64B5F6" }
];

/* ============================================================
   الإعدادات الافتراضية
   ============================================================ */
const DEFAULT_SETTINGS = {
  reader: "ar.alafasy",
  fontFamily: "Amiri Quran",
  fontSize: 26,
  theme: "dark",
  autoScroll: true,
  autoPlayNext: true
};

/* ============================================================
   تحميل وحفظ الإعدادات
   ============================================================ */
function getSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem("settings") || "{}") };
  } catch { return DEFAULT_SETTINGS; }
}

function saveSetting(key, value) {
  const s = getSettings();
  s[key] = value;
  localStorage.setItem("settings", JSON.stringify(s));
  applySettings();
}

function applySettings() {
  const s = getSettings();

  // الخط
  const ayahs = document.querySelectorAll(".ayah");
  ayahs.forEach(el => {
    el.style.fontFamily = `'${s.fontFamily}', 'Amiri Quran', serif`;
    el.style.fontSize = s.fontSize + "px";
  });

  // الثيم
  document.body.className = "";
  document.body.classList.add("theme-" + s.theme);
  document.body.style.setProperty("--accent", THEMES.find(t => t.id === s.theme)?.accent || "#FFD700");
}

/* ============================================================
   واجهة اختيار القارئ
   ============================================================ */
function openReaderPicker() {
  const s = getSettings();
  const html = `
    <div class="picker-overlay" onclick="closePicker(event)">
      <div class="picker-content" onclick="event.stopPropagation()">
        <div class="picker-header">
          <h3>🎙️ اختر القارئ</h3>
          <button class="picker-close" onclick="closePicker()">✕</button>
        </div>
        <div class="picker-list">
          ${READERS.map(r => `
            <button class="picker-item ${r.id === s.reader ? 'active' : ''}" onclick="selectReader('${r.id}')">
              <span class="picker-flag">${r.flag}</span>
              <div class="picker-info">
                <div class="picker-name">${r.name}</div>
                <div class="picker-country">${r.country}</div>
              </div>
              ${r.id === s.reader ? '<span class="picker-check">✓</span>' : ''}
            </button>
          `).join("")}
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);
}

function selectReader(id) {
  saveSetting("reader", id);
  document.querySelector(".reader-name").textContent = READERS.find(r => r.id === id)?.name || "";
  closePicker();
}

function closePicker(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains("picker-close")) return;
  const el = document.querySelector(".picker-overlay");
  if (el) el.remove();
}

/* ============================================================
   واجهة الإعدادات
   ============================================================ */
function openSettings() {
  const s = getSettings();
  const html = `
    <div class="picker-overlay" onclick="closeSettings(event)">
      <div class="picker-content settings-content" onclick="event.stopPropagation()">
        <div class="picker-header">
          <h3>⚙️ الإعدادات</h3>
          <button class="picker-close" onclick="closeSettings()">✕</button>
        </div>
        <div class="settings-body">

          <div class="setting-group">
            <label>🎙️ القارئ</label>
            <button class="setting-btn" onclick="closeSettings(); setTimeout(openReaderPicker, 200)">
              ${READERS.find(r => r.id === s.reader)?.name || "اختر القارئ"} ▸
            </button>
          </div>

          <div class="setting-group">
            <label>📖 الخط</label>
            <select class="setting-select" onchange="saveSetting('fontFamily', this.value)">
              ${FONTS.map(f => `<option value="${f.id}" ${f.id === s.fontFamily ? 'selected' : ''}>${f.name}</option>`).join("")}
            </select>
          </div>

          <div class="setting-group">
            <label>🔤 حجم الخط: <span id="fontSizeValue">${s.fontSize}</span> px</label>
            <div class="size-controls">
              <button onclick="changeFontSize(-2)">−</button>
              <button onclick="changeFontSize(2)">+</button>
            </div>
          </div>

          <div class="setting-group">
            <label>🎨 الثيم</label>
            <div class="theme-grid">
              ${THEMES.map(t => `
                <button class="theme-item ${t.id === s.theme ? 'active' : ''}"
                        style="background:${t.bg};color:${t.accent};border-color:${t.accent}"
                        onclick="saveSetting('theme', '${t.id}')">
                  ${t.name}
                </button>
              `).join("")}
            </div>
          </div>

          <div class="setting-group">
            <label>🔖 العلامات المرجعية (${JSON.parse(localStorage.getItem("bookmarks") || "[]").length})</label>
            <button class="setting-btn" onclick="closeSettings(); setTimeout(openBookmarks, 200)">
              عرض الكل ▸
            </button>
          </div>

        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);
}

function closeSettings(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains("picker-close")) return;
  const el = document.querySelector(".picker-overlay");
  if (el) el.remove();
}

function changeFontSize(delta) {
  const s = getSettings();
  const newSize = Math.max(16, Math.min(48, s.fontSize + delta));
  saveSetting("fontSize", newSize);
  const el = document.getElementById("fontSizeValue");
  if (el) el.textContent = newSize;
}

/* ============================================================
   عرض العلامات المرجعية
   ============================================================ */
async function openBookmarks() {
  const bms = JSON.parse(localStorage.getItem("bookmarks") || "[]");
  if (bms.length === 0) {
    alert("لا توجد إشارات مرجعية بعد.\nاضغط ضغطة طويلة على أي آية لإضافتها.");
    return;
  }
  const html = `
    <div class="picker-overlay" onclick="closeBookmarks(event)">
      <div class="picker-content" onclick="event.stopPropagation()">
        <div class="picker-header">
          <h3>🔖 العلامات المرجعية</h3>
          <button class="picker-close" onclick="closeBookmarks()">✕</button>
        </div>
        <div class="picker-list">
          ${bms.map(b => `
            <button class="picker-item" onclick="closeBookmarks(); loadSurah(${b.surah}); setTimeout(()=>{const el=document.querySelector('.ayah[data-index=\\'${b.ayah-1}\\']'); if(el) el.scrollIntoView({behavior:'smooth',block:'center'});}, 800)">
              <span class="picker-flag">🔖</span>
              <div class="picker-info">
                <div class="picker-name">سورة ${b.surah} — الآية ${b.ayah}</div>
              </div>
            </button>
          `).join("")}
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);
}

function closeBookmarks(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains("picker-close")) return;
  const el = document.querySelector(".picker-overlay");
  if (el) el.remove();
}

/* ============================================================
   تطبيق الإعدادات عند الفتح
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  applySettings();
});
