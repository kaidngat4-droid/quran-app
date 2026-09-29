const surahList = document.getElementById("surahList");
const mushafView = document.getElementById("mushafView");
const readerSelect = document.getElementById("readerSelect");
const search = document.getElementById("search");

const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");

let ayahs = [];
let currentIndex = 0;
let audio = new Audio();
let isPlaying = false;

/* ================= تحميل السور ================= */
fetch("https://api.alquran.cloud/v1/surah")
.then(res => res.json())
.then(data => {
  data.data.forEach(surah => {

    const btn = document.createElement("button");
    btn.textContent = surah.name;

    btn.onclick = () => loadSurah(surah.number);

    surahList.appendChild(btn);
  });
});

/* ================= تحميل سورة ================= */
function loadSurah(num){

  mushafView.innerHTML = "جاري التحميل...";

  fetch(`https://api.alquran.cloud/v1/surah/${num}/${readerSelect.value}`)
  .then(res => res.json())
  .then(data => {

    mushafView.innerHTML = `<h2>${data.data.name}</h2>`;
    ayahs = data.data.ayahs;
    currentIndex = 0;

    displayAyahs();
  });
}

/* ================= عرض الآيات ================= */
function displayAyahs(){

  ayahs.forEach((ayah, index) => {

    const div = document.createElement("div");
    div.className = "ayah";

    div.innerHTML = `
      ${ayah.text}
      <span class="num">(${ayah.numberInSurah})</span>
    `;

    // آية سجدة
    if(ayah.sajda){
      div.classList.add("sajda");
    }

    // تشغيل عند الضغط
    div.onclick = () => playAyah(index);

    mushafView.appendChild(div);
  });
}

/* ================= تشغيل آية ================= */
function playAyah(index){

  currentIndex = index;

  audio.src = ayahs[index].audio;
  audio.play();
  isPlaying = true;

  highlightAyah(index);

  // تشغيل التالي تلقائي
  audio.onended = () => {
    nextAyah();
  };
}

/* ================= التحكم ================= */
function togglePlay(){
  if(isPlaying){
    audio.pause();
    isPlaying = false;
  }else{
    audio.play();
    isPlaying = true;
  }
}

function nextAyah(){
  if(currentIndex + 1 < ayahs.length){
    playAyah(currentIndex + 1);
  }
}

function prevAyah(){
  if(currentIndex > 0){
    playAyah(currentIndex - 1);
  }
}

/* ================= تمييز الآية ================= */
function highlightAyah(index){

  const all = document.querySelectorAll(".ayah");

  all.forEach(a => a.classList.remove("active"));

  if(all[index]){
    all[index].classList.add("active");

    // تمرير تلقائي
    all[index].scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}

/* ================= شريط التقدم ================= */
audio.ontimeupdate = () => {

  if(audio.duration){
    progress.value = (audio.currentTime / audio.duration) * 100;
  }

  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent = formatTime(audio.duration);
};

// التحكم بالسحب
progress.oninput = () => {
  if(audio.duration){
    audio.currentTime = (progress.value / 100) * audio.duration;
  }
};

/* ================= تنسيق الوقت ================= */
function formatTime(time){
  if(!time) return "0:00";

  let min = Math.floor(time / 60);
  let sec = Math.floor(time % 60);

  if(sec < 10) sec = "0" + sec;

  return `${min}:${sec}`;
}

/* ================= البحث داخل السورة ================= */
search.addEventListener("input", () => {

  const value = search.value.trim();

  if(value === ""){
    mushafView.innerHTML = `<h2>السورة</h2>`;
    displayAyahs();
    return;
  }

  const filtered = ayahs.filter(a => a.text.includes(value));

  mushafView.innerHTML = `<h2>نتائج البحث</h2>`;

  filtered.forEach(ayah => {
    const div = document.createElement("div");
    div.className = "ayah";

    div.innerHTML = `
      ${ayah.text}
      <span class="num">(${ayah.numberInSurah})</span>
    `;

    mushafView.appendChild(div);
  });
});
