/* ===============================
   تطبيق القرآن الكريم النهائي
   =============================== */

let reader = "ar.alafasy";
let currentAudio = null;

/* ===============================
   تحميل القرآن
   =============================== */

async function loadQuran(){

try{

let res = await fetch("https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran.json");
let quran = await res.json();

window.quranData = quran;

let list = document.getElementById("surahList");
list.innerHTML = "";

quran.forEach((s,i)=>{
list.innerHTML += `
<div onclick="openSurah(${i})">
📖 ${i+1} - ${s.name}
</div>
`;
});

/* فتح آخر سورة */
let last = localStorage.getItem("lastSurah");
if(last){
openSurah(last);
}

}catch(e){
alert("❌ تأكد من الاتصال بالإنترنت");
}

}

loadQuran();

/* ===============================
   تغيير القارئ
   =============================== */

function changeReader(){
reader = document.getElementById("reader").value;
}

/* ===============================
   فتح سورة (مصحح)
   =============================== */

function openSurah(index){

let s = quranData[index];

localStorage.setItem("lastSurah", index);

let view = document.getElementById("mushafView");

view.innerHTML = `<h2 style="text-align:center">${s.name}</h2>`;

/* حل اختلاف البيانات */
let ayahs = s.ayahs || s.verses || [];

ayahs.forEach((a,i)=>{

let text = a.text || a;

view.innerHTML += `
<div class="ayah">
${text}
<br>
<span style="color:gold">(${i+1})</span>
<br>
<button onclick="playAyah(${index+1},${i+1})">🎧 تشغيل</button>
</div>
`;

});

}

/* ===============================
   تشغيل آية
   =============================== */

function playAyah(surah, ayah){

if(!navigator.onLine){
alert("📡 لا يوجد إنترنت");
return;
}

let url = `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/${reader}`;

fetch(url)
.then(res => res.json())
.then(data => {

if(currentAudio){
currentAudio.pause();
}

currentAudio = new Audio(data.data.audio);
currentAudio.play();

})
.catch(()=>{
alert("❌ فشل تشغيل الصوت");
});

}

/* ===============================
   تشغيل سورة كاملة
   =============================== */

function playFullSurah(surah){

let s = String(surah).padStart(3,'0');

if(currentAudio){
currentAudio.pause();
}

currentAudio = new Audio(
`https://cdn.islamic.network/quran/audio/128/${reader}/${s}.mp3`
);

currentAudio.play();

}

/* ===============================
   إيقاف الصوت
   =============================== */

function stopAudio(){
if(currentAudio){
currentAudio.pause();
}
}