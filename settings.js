const READERS=[{id:"ar.alafasy",name:"مشاري راشد العفاسي",country:"الكويت",flag:"🇰🇼"},{id:"ar.abdulbasitmurattal",name:"عبد الباسط عبد الصمد",country:"مصر",flag:"🇪🇬"},{id:"ar.abdurrahmaansudais",name:"عبد الرحمن السديس",country:"السعودية",flag:"🇸🇦"},{id:"ar.abdullahbasfar",name:"عبد الله بصفر",country:"السعودية",flag:"🇸🇦"},{id:"ar.husary",name:"محمود خليل الحصري",country:"مصر",flag:"🇪🇬"},{id:"ar.minshawi",name:"محمد صديق المنشاوي",country:"مصر",flag:"🇪🇬"},{id:"ar.muhammadjibreel",name:"محمد جبريل",country:"مصر",flag:"🇪🇬"},{id:"ar.mahermuaiqly",name:"ماهر المعيقلي",country:"السعودية",flag:"🇸🇦"},{id:"ar.shaatree",name:"أبو بكر الشاطري",country:"السعودية",flag:"🇸🇦"},{id:"ar.hudhaify",name:"علي الحذيفي",country:"السعودية",flag:"🇸🇦"},{id:"ar.ahmedajamy",name:"أحمد العجمي",country:"السعودية",flag:"🇸🇦"},{id:"ar.hanirifai",name:"هاني الرفاعي",country:"السعودية",flag:"🇸🇦"},{id:"ar.muhammadayyoub",name:"محمد أيوب",country:"السعودية",flag:"🇸🇦"},{id:"ar.aymanswoaid",name:"أيمن سويد",country:"سوريا",flag:"🇸🇾"}];

const FONTS=[{id:"Amiri Quran",name:"أميري قرآن"},{id:"Scheherazade New",name:"شهرزاد"},{id:"Noto Naskh Arabic",name:"نسخ"},{id:"Lateef",name:"لطيف"},{id:"Tajawal",name:"تجوّل"}];

const THEMES=[{id:"dark",name:"داكن",bg:"#0f2027",accent:"#FFD700"},{id:"night",name:"ليلي",bg:"#000000",accent:"#FFD700"},{id:"sepia",name:"بني",bg:"#f5e6c8",accent:"#8B4513"},{id:"light",name:"فاتح",bg:"#f5f5dc",accent:"#8B4513"},{id:"green",name:"أخضر",bg:"#1a3a2e",accent:"#7DD3A0"},{id:"blue",name:"أزرق",bg:"#0a1929",accent:"#64B5F6"}];

const DEFAULT_SETTINGS={reader:"ar.alafasy",fontFamily:"Amiri Quran",fontSize:26,theme:"dark"};

function getSettings(){try{var saved=JSON.parse(localStorage.getItem("settings")||"{}");var s={};for(var k in DEFAULT_SETTINGS)s[k]=DEFAULT_SETTINGS[k];for(var k in saved)s[k]=saved[k];return s;}catch(e){return DEFAULT_SETTINGS;}}

function saveSetting(key,value){var s=getSettings();s[key]=value;localStorage.setItem("settings",JSON.stringify(s));applySettings();}

function applySettings() {
  var s = getSettings();
  
  // ✅ تطبيق على الآيات (وضع الآيات)
  var ayahs = document.querySelectorAll(".ayah");
  for (var i = 0; i < ayahs.length; i++) {
    ayahs[i].style.fontFamily = "'" + s.fontFamily + "', 'Amiri Quran', serif";
    ayahs[i].style.fontSize = s.fontSize + "px";
  }
  
  // ✅ تطبيق على المصحف (وضع المصحف) — تكبير الصورة
  if (typeof applyFontSizeToMushaf === "function") {
    applyFontSizeToMushaf();
  }
  
  // ✅ الثيمات
  document.body.classList.remove("theme-dark", "theme-night", "theme-sepia", "theme-light", "theme-green", "theme-blue");
  document.body.classList.add("theme-" + s.theme);
  
  // ✅ اسم القارئ
  var rn = document.querySelector(".reader-name");
  if (rn) {
    for (var j = 0; j < READERS.length; j++) {
      if (READERS[j].id === s.reader) {
        rn.textContent = READERS[j].name;
        break;
      }
    }
  }
}

function openReaderPicker(){var s=getSettings();var html='<div class="picker-overlay" onclick="closePicker(event)"><div class="picker-content" onclick="event.stopPropagation()"><div class="picker-header"><h3>🎙️ اختر القارئ</h3><button class="picker-close" onclick="closePicker()">✕</button></div><div class="picker-list">';for(var i=0;i<READERS.length;i++){var r=READERS[i];var cls=r.id===s.reader?" active":"";html+='<button class="picker-item'+cls+'" onclick="selectReader(\''+r.id+'\')"><span class="picker-flag">'+r.flag+'</span><div class="picker-info"><div class="picker-name">'+r.name+'</div><div class="picker-country">'+r.country+'</div></div>'+(r.id===s.reader?'<span class="picker-check">✓</span>':'')+'</button>';}html+='</div></div></div>';document.body.insertAdjacentHTML("beforeend",html);}

function selectReader(id){saveSetting("reader",id);var rn=document.querySelector(".reader-name");if(rn){for(var i=0;i<READERS.length;i++){if(READERS[i].id===id){rn.textContent=READERS[i].name;break;}}}closePicker();}

function closePicker(e){if(e&&e.target!==e.currentTarget&&!e.target.classList.contains("picker-close"))return;var el=document.querySelector(".picker-overlay");if(el)el.remove();}

function openSettings(){var s=getSettings();var readerName="";for(var i=0;i<READERS.length;i++)if(READERS[i].id===s.reader)readerName=READERS[i].name;var html='<div class="picker-overlay" onclick="closeSettings(event)"><div class="picker-content" onclick="event.stopPropagation()"><div class="picker-header"><h3>⚙️ الإعدادات</h3><button class="picker-close" onclick="closeSettings()">✕</button></div><div class="settings-body"><div class="setting-group"><label>🎙️ القارئ</label><button class="setting-btn" onclick="closeSettings();setTimeout(openReaderPicker,200)">'+readerName+' ▸</button></div><div class="setting-group"><label>📖 الخط</label><select class="setting-select" onchange="saveSetting(\'fontFamily\',this.value)">';for(var j=0;j<FONTS.length;j++){var sel=FONTS[j].id===s.fontFamily?" selected":"";html+='<option value="'+FONTS[j].id+'"'+sel+'>'+FONTS[j].name+'</option>';}html+='</select></div><div class="setting-group"><label>🔤 حجم الخط: <span id="fontSizeValue">'+s.fontSize+'</span> px</label><div class="size-controls"><button onclick="changeFontSize(-2)">−</button><button onclick="changeFontSize(2)">+</button></div></div><div class="setting-group"><label>🎨 الثيم</label><div class="theme-grid">';for(var k=0;k<THEMES.length;k++){var t=THEMES[k];var cls2=t.id===s.theme?" active":"";html+='<button class="theme-item'+cls2+'" style="background:'+t.bg+';color:'+t.accent+';border-color:'+t.accent+'" onclick="saveSetting(\'theme\',\''+t.id+'\')">'+t.name+'</button>';}html+='</div></div><div class="setting-group"><label>🔖 العلامات المرجعية</label><button class="setting-btn" onclick="closeSettings();setTimeout(openBookmarks,200)">عرض الكل ▸</button></div></div></div></div>';document.body.insertAdjacentHTML("beforeend",html);}

function closeSettings(e){if(e&&e.target!==e.currentTarget&&!e.target.classList.contains("picker-close"))return;var el=document.querySelector(".picker-overlay");if(el)el.remove();}

function changeFontSize(delta){
  var s = getSettings();
  var newSize = Math.max(16, Math.min(48, s.fontSize + delta));
  saveSetting("fontSize", newSize);
  var el = document.getElementById("fontSizeValue");
  if (el) el.textContent = newSize;
  
  // ✅ أطلق حدث تغيير حجم الخط (لتكبير صورة المصحف)
  window.dispatchEvent(new CustomEvent("fontSizeChanged", { detail: { size: newSize } }));
}

function openBookmarks(){var bms=[];try{bms=JSON.parse(localStorage.getItem("bookmarks")||"[]");}catch(e){}if(bms.length===0){alert("لا توجد إشارات مرجعية بعد.\nاضغط ضغطة طويلة على أي آية.");return;}var html='<div class="picker-overlay" onclick="closeBookmarks(event)"><div class="picker-content" onclick="event.stopPropagation()"><div class="picker-header"><h3>🔖 العلامات</h3><button class="picker-close" onclick="closeBookmarks()">✕</button></div><div class="picker-list">';for(var i=0;i<bms.length;i++){var b=bms[i];html+='<button class="picker-item" onclick="closeBookmarks();jumpToBookmark('+b.surah+','+b.ayah+')"><span class="picker-flag">🔖</span><div class="picker-info"><div class="picker-name">سورة '+b.surah+' — الآية '+b.ayah+'</div></div></button>';}html+='</div></div></div>';document.body.insertAdjacentHTML("beforeend",html);}

function closeBookmarks(e){if(e&&e.target!==e.currentTarget&&!e.target.classList.contains("picker-close"))return;var el=document.querySelector(".picker-overlay");if(el)el.remove();}

function jumpToBookmark(surah,ayah){if(typeof loadSurah==="function"){loadSurah(surah);setTimeout(function(){var el=document.querySelector('.ayah[data-index="'+(ayah-1)+'"]');if(el)el.scrollIntoView({behavior:"smooth",block:"center"});},800);}}

document.addEventListener("DOMContentLoaded",applySettings);
