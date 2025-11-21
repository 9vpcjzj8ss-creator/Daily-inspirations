const quoteText = document.getElementById('quoteText');
const fontSelect = document.getElementById('fontSelect');
const fontSize = document.getElementById('fontSize');
const textColor = document.getElementById('textColor');
const bgColor = document.getElementById('bgColor');
const preview = document.getElementById('preview');
const saveBtn = document.getElementById('saveBtn');
const quotesGrid = document.getElementById('quotesGrid');
const setWidgetBtn = document.getElementById('setWidgetBtn');
const liveWidget = document.getElementById('liveWidget');
const exportBtn = document.getElementById('exportBtn');
const rotateToggle = document.getElementById('rotateToggle');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const clearWidgetBtn = document.getElementById('clearWidgetBtn');

let quotes = JSON.parse(localStorage.getItem('dailyWords_quotes') || '[]');
let widgetIndex = parseInt(localStorage.getItem('dailyWords_widgetIndex')||'0');
let rotationEnabled = (localStorage.getItem('dailyWords_rotation')==='true');

function renderPreview(){
  preview.style.fontFamily = fontSelect.value;
  preview.style.fontSize = fontSize.value + 'px';
  preview.style.color = textColor.value;
  preview.style.background = bgColor.value;
  preview.innerText = quoteText.value || 'Your quote preview here';
}
function renderLiveWidget(){
  if(quotes.length===0){ 
    liveWidget.innerText = 'No quote set. Save a quote and click "Set as Widget".'; 
    liveWidget.style.fontFamily='system-ui'; 
    liveWidget.style.fontSize='20px'; 
    liveWidget.style.color='#111'; 
    liveWidget.style.background='linear-gradient(180deg,#fff,#fefcfb)'; 
    return; 
  }
  const q = quotes[widgetIndex % quotes.length];
  liveWidget.style.fontFamily = q.font;
  liveWidget.style.fontSize = q.size + 'px';
  liveWidget.style.color = q.textColor;
  liveWidget.style.background = q.bgColor;
  liveWidget.innerText = q.text;
}
function saveQuotes(){
  localStorage.setItem('dailyWords_quotes', JSON.stringify(quotes));
}
function addQuote(){
  const q = {
    id: Date.now(),
    text: quoteText.value || '...',
    font: fontSelect.value,
    size: fontSize.value,
    textColor: textColor.value,
    bgColor: bgColor.value,
    createdAt: new Date().toISOString()
  };
  quotes.unshift(q);
  saveQuotes();
  renderLibrary();
  alert('Quote saved! You can now set it as widget.');
}
function renderLibrary(){
  quotesGrid.innerHTML='';
  for(const q of quotes){
    const card = document.createElement('div'); card.className='quoteCard';
    const txt = document.createElement('div'); txt.className='quoteText';
    txt.style.fontFamily = q.font; txt.style.color=q.textColor; txt.style.fontSize=(q.size-2)+'px';
    txt.innerText = q.text;
    const btns = document.createElement('div'); btns.className='cardButtons';
    const setBtn = document.createElement('button'); setBtn.className='smallBtn'; setBtn.innerText='Set'; setBtn.onclick = ()=>{ widgetIndex = quotes.indexOf(q); localStorage.setItem('dailyWords_widgetIndex', widgetIndex); renderLiveWidget(); };
    const editBtn = document.createElement('button'); editBtn.className='smallBtn'; editBtn.innerText='Edit'; editBtn.onclick = ()=>{ quoteText.value=q.text; fontSelect.value=q.font; fontSize.value=q.size; textColor.value=q.textColor; bgColor.value=q.bgColor; renderPreview(); };
    const delBtn = document.createElement('button'); delBtn.className='smallBtn'; delBtn.innerText='Delete'; delBtn.onclick = ()=>{ if(confirm('Delete this quote?')){ quotes = quotes.filter(x=>x.id!==q.id); saveQuotes(); renderLibrary(); renderLiveWidget(); } };
    btns.appendChild(setBtn); btns.appendChild(editBtn); btns.appendChild(delBtn);
    card.appendChild(txt); card.appendChild(btns);
    quotesGrid.appendChild(card);
  }
}

// Event bindings
quoteText.addEventListener('input', renderPreview);
fontSelect.addEventListener('change', renderPreview);
fontSize.addEventListener('input', renderPreview);
textColor.addEventListener('input', renderPreview);
bgColor.addEventListener('input', renderPreview);
saveBtn.addEventListener('click', ()=>{ addQuote(); });
setWidgetBtn.addEventListener('click', ()=>{ if(quotes.length===0){ alert('Save at least one quote first.'); return;} widgetIndex = 0; localStorage.setItem('dailyWords_widgetIndex', widgetIndex); renderLiveWidget(); alert('Widget set to your most recent quote.'); });
exportBtn.addEventListener('click', ()=>{ const dataStr = 'data:text/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(quotes, null, 2)); const a=document.createElement('a'); a.href=dataStr; a.download='daily_words_quotes.json'; a.click(); });
rotateToggle.addEventListener('change', ()=>{ rotationEnabled = rotateToggle.checked; localStorage.setItem('dailyWords_rotation', rotationEnabled); if(rotationEnabled) startRotation(); });
prevBtn.addEventListener('click', ()=>{ if(quotes.length===0) return; widgetIndex = (widgetIndex-1 + quotes.length)%quotes.length; localStorage.setItem('dailyWords_widgetIndex', widgetIndex); renderLiveWidget(); });
nextBtn.addEventListener('click', ()=>{ if(quotes.length===0) return; widgetIndex = (widgetIndex+1)%quotes.length; localStorage.setItem('dailyWords_widgetIndex', widgetIndex); renderLiveWidget(); });
clearWidgetBtn.addEventListener('click', ()=>{ if(confirm('Clear widget selection?')){ widgetIndex=0; quotes=[]; saveQuotes(); renderLibrary(); renderLiveWidget(); } });

// Rotation (simple hourly rotation using setInterval — will run while page is open)
let rotationTimer = null;
function startRotation(){
  if(rotationTimer) clearInterval(rotationTimer);
  if(!rotationEnabled) return;
  rotationTimer = setInterval(()=>{ if(quotes.length===0) return; widgetIndex = (widgetIndex+1)%quotes.length; localStorage.setItem('dailyWords_widgetIndex', widgetIndex); renderLiveWidget(); }, 1000*60*60);
}

// initial render
renderPreview();
renderLibrary();
renderLiveWidget();
rotateToggle.checked = rotationEnabled;
if(rotationEnabled) startRotation();
