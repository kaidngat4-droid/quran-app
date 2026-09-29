/* ============================================================
   app.js — القرآن الكريم
   يعمل مع الإنترنت (API + صوت) وبدونه (quran.json المحلي)
   ============================================================ */

const surahList = document.getElementById("surahList");
const mushafView = document.getElementById("mushafView");
const readerSelect = document.getElementById("readerSelect");
const search = document.getElementById("search");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const playBtn = document.getElementById("playBtn");

let ayahs = [];
let currentIndex = 0;
let audio = new Audio();
let isPlaying = false;
let currentSurah = null;
let localQuran = null; // نخزّن quran.json هنا بعد التحميل

/* ============================================================
   1. تحميل قائمة السور (عند فتح التطبيق)
   ============================================================ */
async function loadSurahList() {
  surahList.innerHTML = "<p style='color:#FFD700'>جاري التحميل...</p>";

  // محاولة API أولاً (إذا يوجد إنترنت)
  if (navigator.onLine) {
    try {
      const res = await fetch("https://api.alquran.cloud/v1/surah");
      const data = await res.json();
      displaySurahList(data.data.map(s => ({
        number: s.number,
        name: s.name,
        englishName: s.englishName
      })));
      console.log("✅ تم تحميل السور من API");
      return;
    } catch (e) {
      console.warn("⚠️ فشل API، سنستخدم quran.json:", e.message);
    }
  } else {
    console.log("📴 لا يوجد إنترنت، استخدام quran.json");
  }

  // Fallback: quran.json المحلي
  try {
    await loadLocalQuran();
    if (localQuran && localQuran.length > 0) {
      displaySurahList(localQuran.map(s => ({
        number: s.id || s.number,
        name: s.name,
        englishName: s.englishName || ""
      })));
      console.log("✅ تم تحميل السور من quran.json");
    } else {
      surahList.innerHTML = "<p style='color:red'>❌ لا توجد بيانات</p>";
    }
  } catch (e) {
    surahList.innerHTML = "<p style='color:red'>❌ فشل تحميل quran.json</p>";
    console.error(e);
  }
}

/* ============================================================
   2. عرض قائمة السور
   ============================================================ */
function displaySurahList(surahs) {
  surahList.innerHTML = "";
  surahs.forEach(surah => {
    const btn = document.createElement("button");
    btn.textContent = `${surah.number}. ${surah.name}`;
    btn.onclick = () => loadSurah(surah.number);
    surahList.appendChild(btn);
  });
}

/* ============================================================
   3. تحميل سورة
   ============================================================ */
async function loadSurah(num) {
  currentSurah = num;
  mushafView.innerHTML = "<h2>جاري التحميل...</h2>";

  // محاولة API أولاً
  if (navigator.onLine) {
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${num}/${readerSelect.value}`);
      const data = await res.json();
      mushafView.innerHTML = `<h2>${data.data.name}</h2>`;
      ayahs = data.data.ayahs;
      currentIndex = 0;
      displayAyahs();
      enablePlayer(true);
      console.log("✅ تم تحميل السورة من API");
      return;
    } catch (e) {
      console.warn("⚠️ فشل API، استخدام quran.json");
    }
  }

  // Fallback: quran.json
  try {
    await loadLocalQuran();
    const surah = localQuran.find(s => (s.id || s.number) === num);
    if (!surah) {
      mushafView.innerHTML = "<h2>❌ السورة غير موجودة</h2>";
      return;
    }
    mushafView.innerHTML = `<h2>${surah.name}</h2>`;
    ayahs = (surah.ayahs || surah.verses || []).map((a, i) => ({
      text: a.text || a.arabicText || a,
      numberInSurah: a.numberInSurah || i + 1
    }));
    currentIndex = 0;
    displayAyahs();
    enablePlayer(false);
    console.log("✅ تم تحميل السورة من quran.json (بدون صوت)");
  } catch (e) {
    mushafView.innerHTML = "<h2>❌ فشل تحميل السورة</h2>";
    console.error(e);
  }
}

/* ============================================================
   4. تحميل quran.json مرة واحدة (وتخزينه بالذاكرة)
   ============================================================ */
async function loadLocalQuran() {
  if (localQuran) return localQuran;
  const res = await fetch("quran.json");
  const data = await res.json();

  // دعم عدة أشكال للبيانات
  if (Array.isArray(data)) {
    localQuran = data;
  } else if (data.data && Array.isArray(data.data)) {
    localQuran = data.data;
  } else if (data.surahs) {
    localQuran = data.surahs;
  } else {
    localQuran = [];
  }
  console.log("📖 تم تحميل quran.json، عدد السور:", localQuran.length);
  return localQuran;
}

/* ============================================================
   5. عرض الآيات
   ============================================================ */
function displayAyahs() {
  mushafView.innerHTML = "";
  ayahs.forEach((ayah, index) => {
    const div = document.createElement("div");
    div.className = "ayah";
    div.dataset.index = index;
    div.innerHTML = `${ayah.text} <span class="num">(${ayah.numberInSurah})</span>`;
    div.onclick = () => {
      document.querySelectorAll(".ayah.active").forEach(el => el.classList.remove("active"));
      div.classList.add("active");
      currentIndex = index;
      playAyah();
    };
    mushafView.appendChild(div);
  });
}

/* ============================================================
   6. تشغيل الآية
   ============================================================ */
function playAyah() {
  if (!navigator.onLine) {
    alert("⚠️ التلاوة الصوتية تحتاج إنترنت");
    return;
  }
  if (!ayahs[currentIndex]) return;

  // بناء رابط الصوت من API
  const surahNum = currentSurah;
  const ayahNum = ayahs[currentIndex].numberInSurah;
  const reader = readerSelect.value;
  const url = `https://cdn.islamic.network/quran/audio/128/${reader}/${ayahNum}.mp3`;
  // أو من API آخر
  // audio.src = `https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}/${reader}`;

  audio.src = url;
  audio.play().catch(e => console.warn("خطأ الصوت:", e));

  isPlaying = true;
  if (playBtn) playBtn.textContent = "⏸";
}

/* ============================================================
   7. أزرار التحكم
   ============================================================ */
function prevAyah() {
  if (currentIndex > 0) { currentIndex--; playAyah(); }
}
function nextAyah() {
  if (currentIndex < ayahs.length - 1) { currentIndex++; playAyah(); }
}
function togglePlay() {
  if (audio.paused) audio.play();
  else audio.pause();
}

/* ============================================================
   8. ربط عناصر المشغل
   ============================================================ */
if (playBtn) {
  playBtn.onclick = () => {
    if (audio.paused) audio.play();
    else audio.pause();
  };
}
audio.onplay = () => { if (playBtn) playBtn.textContent = "⏸"; };
audio.onpause = () => { if (playBtn) playBtn.textContent = "▶"; };
audio.onended = () => nextAyah();
audio.ontimeupdate = () => {
  if (audio.duration && progress) {
    progress.value = (audio.currentTime / audio.duration) * 100;
  }
  if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
  if (durationEl) durationEl.textContent = formatTime(audio.duration);
};
if (progress) {
  progress.oninput = () => {
    if (audio.duration) audio.currentTime = (progress.value / 100) * audio.duration;
  };
}

/* ============================================================
   9. البحث
   ============================================================ */
if (search) {
  search.addEventListener("input", () => {
    const value = search.value.trim();
    if (value === "") {
      if (currentSurah) loadSurah(currentSurah);
      return;
    }
    mushafView.innerHTML = "<h2>نتائج البحث</h2>";
    let count = 0;
    ayahs.forEach((a, i) => {
      if (a.text.includes(value)) {
        const d = document.createElement("div");
        d.className = "ayah";
        d.innerHTML = a.text;
        d.onclick = () => { currentIndex = i; playAyah(); };
        mushafView.appendChild(d);
        count++;
      }
    });
    if (count === 0) mushafView.innerHTML += "<p style='color:#FFAA00'>لا توجد نتائج</p>";
  });
}

/* ============================================================
   10. تنسيق الوقت
   ============================================================ */
function formatTime(time) {
  if (!time) return "0:00";
  let min = Math.floor(time / 60);
  let sec = Math.floor(time % 60);
  if (sec < 10) sec = "0" + sec;
  return `${min}:${sec}`;
}

/* ============================================================
   11. تمكين/تعطيل المشغل (حسب وجود إنترنت)
   ============================================================ */
function enablePlayer(enabled) {
  const player = document.querySelector(".player");
  if (player) {
    player.style.opacity = enabled ? "1" : "0.4";
    player.style.pointerEvents = enabled ? "auto" : "none";
  }
}

/* ============================================================
   12. بدء التشغيل
   ============================================================ */
window.addEventListener("online", () => {
  console.log("🌐 عاد الإنترنت");
  if (surahList.innerHTML.includes("❌")) loadSurahList();
});
window.addEventListener("offline", () => {
  console.log("📴 انقطع الإنترنت");
});

// تحميل قائمة السور عند الجاهزية
document.addEventListener("DOMContentLoaded", loadSurahList);
