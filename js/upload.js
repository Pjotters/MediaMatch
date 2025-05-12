// upload.js - Wizard voor uploaden, AI, zoek je gezicht, quota etc.

// --- Config & helpers ---
const API = window.config.photoApiUrl;
function getUserInfo() {
  // Haal userId en userType uit localStorage/token (dummy fallback)
  let userId = localStorage.getItem('mediamatch_userid') || 'anon';
  let userType = localStorage.getItem('mediamatch_usertype') || 'free';
  // Optioneel: uit token decoderen
  return { userId, userType };
}
function showStatus(msg, error=false) {
  document.getElementById('uploadStatus').textContent = msg;
  document.getElementById('uploadStatus').style.color = error ? '#e53935' : '#fff';
}

// --- Wizard logica ---
const wizardSteps = Array.from(document.querySelectorAll('.wizard-step'));
let currentStep = 0;
function showStep(idx) {
  wizardSteps.forEach((s,i)=>s.style.display = (i===idx?'flex':'none'));
  document.querySelectorAll('.wizard-dot').forEach((d,i)=>d.classList.toggle('active',i<=idx));
  currentStep = idx;
  if(idx===6) updateWatermarkStep && updateWatermarkStep();
  if(idx===7) updatePriceFields && updatePriceFields();
}
document.querySelectorAll('.next-btn').forEach(btn=>btn.onclick=()=>showStep(Math.min(currentStep+1,wizardSteps.length-1)));
document.querySelectorAll('.prev-btn').forEach(btn=>btn.onclick=()=>showStep(Math.max(currentStep-1,0)));
showStep(0);

// --- Albums ophalen/aanmaken ---
const albumSelect = document.getElementById('albumSelect');
const addAlbumBtn = document.getElementById('addAlbumBtn');
const newAlbumInput = document.getElementById('newAlbumInput');
addAlbumBtn.onclick = ()=>{
  newAlbumInput.style.display = 'block';
  newAlbumInput.focus();
};
newAlbumInput.onblur = ()=>{ newAlbumInput.style.display = 'none'; };
function loadAlbums(photographer) {
  fetch(`${API}/api/albums?photographer=${encodeURIComponent(photographer)}`)
    .then(res=>res.json()).then(data=>{
      albumSelect.innerHTML = '<option value="">Selecteer album...</option>';
      (data.albums||[]).forEach(a=>{
        const opt = document.createElement('option');
        opt.value = a.name; opt.textContent = a.name;
        albumSelect.appendChild(opt);
      });
    });
}
document.querySelector('input[name=photographer]').onblur = e=>{
  if(e.target.value) loadAlbums(e.target.value);
};

// --- Foto's kiezen & previews ---
const dropzone = document.getElementById('dropzone');
const photoInput = document.getElementById('photoInput');
const selectedPhotos = document.getElementById('selectedPhotos');
dropzone.onclick = ()=>photoInput.click();
dropzone.ondragover = e=>{e.preventDefault();dropzone.classList.add('dragover');};
dropzone.ondragleave = ()=>dropzone.classList.remove('dragover');
dropzone.ondrop = e=>{
  e.preventDefault(); dropzone.classList.remove('dragover');
  photoInput.files = e.dataTransfer.files; renderPreviews();
};
photoInput.onchange = renderPreviews;
function renderPreviews() {
  selectedPhotos.innerHTML = '';
  Array.from(photoInput.files).forEach((file,i)=>{
    const div = document.createElement('div');
    div.className = 'photo-preview';
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    div.appendChild(img);
    selectedPhotos.appendChild(div);
  });
}

// --- AI-suggesties per foto (Pjotters) ---
const photoDetailsContainer = document.getElementById('photoDetailsContainer');
document.querySelector('.wizard-step#step-3 .next-btn').onclick = ()=>{
  // Stap 4: per foto details + AI suggesties
  photoDetailsContainer.innerHTML = '';
  Array.from(photoInput.files).forEach((file,i)=>{
    const div = document.createElement('div');
    div.className = 'photo-detail-row';
    div.innerHTML = `<b>Foto ${i+1}</b><br><img src="${URL.createObjectURL(file)}" style="max-width:80px;max-height:80px;border-radius:8px;"/><br>
      Titel: <input type="text" name="titel${i}" placeholder="Titel" />
      Beschrijving: <textarea name="beschrijving${i}" placeholder="Beschrijving"></textarea>
      <span class="ai-suggestie" id="ai-suggestie-${i}">AI (Pjotters): <i>laden...</i></span>`;
    photoDetailsContainer.appendChild(div);
    // AI suggestie ophalen
    const fd = new FormData(); fd.append('photo', file);
    fetch(`${API}/api/ai_suggest`,{method:'POST',body:fd})
      .then(r=>r.json()).then(sug=>{
        document.getElementById(`ai-suggestie-${i}`).innerHTML = `AI (Pjotters): <b>${sug.titel||'-'}</b><br>${sug.beschrijving||''}`;
        div.querySelector(`input[name=titel${i}]`).value = sug.titel||'';
        div.querySelector(`textarea[name=beschrijving${i}]`).value = sug.beschrijving||'';
      }).catch(()=>{
        document.getElementById(`ai-suggestie-${i}`).innerHTML = 'AI (Pjotters): <span style="color:#e53935">geen suggestie</span>';
      });
  });
  showStep(3);
};

// --- Portretrechten & AI check ---
const portraitInput = document.querySelector('input[name=portraitRights]');
const portraitAIResult = document.getElementById('portraitAIResult');
const contentAIResult = document.getElementById('contentAIResult');
const adminReview = document.getElementById('adminReview');
document.querySelector('.wizard-step#step-4 .next-btn').onclick = ()=>showStep(5);
portraitInput.onchange = ()=>{
  const fd = new FormData(); fd.append('portraitRights', portraitInput.files[0]);
  fetch(`${API}/api/portrait`,{method:'POST',body:fd})
    .then(r=>r.json()).then(r=>{
      portraitAIResult.innerHTML = 'AI controle: <span class="ai-status">'+(r.aiApproved?'Goedgekeurd':'Afgekeurd')+'</span>';
      if(!r.aiApproved) adminReview.style.display = 'block';
      else adminReview.style.display = 'none';
    });
};

// --- Watermerk functionaliteit ---
const watermarkStep = document.getElementById('step-6');
const watermarkLocked = document.getElementById('watermarkLocked');
const watermarkMain = document.getElementById('watermarkMain');
const watermarkPngInput = document.getElementById('watermarkPngInput');
const watermarkText = document.getElementById('watermarkText');
const watermarkFont = document.getElementById('watermarkFont');
const watermarkStyle = document.getElementById('watermarkStyle');
const watermarkColor = document.getElementById('watermarkColor');
const watermarkSize = document.getElementById('watermarkSize');
const watermarkPosition = document.getElementById('watermarkPosition');
const watermarkPreview = document.getElementById('watermarkPreviewText');
const watermarkQuotaInfo = document.getElementById('watermarkQuotaInfo');
const watermarkAIInfo = document.getElementById('watermarkAIInfo');
const watermarkObjectionBtn = document.getElementById('watermarkObjectionBtn');

let watermarkPlan = 'free';
let watermarkQuota = { used: 0, limit: 2 };

function updateWatermarkStep() {
  // Haal plan & quota op uit localStorage of API
  let userType = localStorage.getItem('mediamatch_usertype') || 'free';
  watermarkPlan = userType;
  if (userType === 'free') { watermarkQuota.limit = 2; }
  else if (userType === 'pro') { watermarkQuota.limit = 10; }
  else { watermarkQuota.limit = Infinity; }
  // Simuleer quota teller (TODO: uit backend halen)
  watermarkQuota.used = parseInt(localStorage.getItem('watermark_used')||'0',10);
  // Toon juiste opties
  if (userType === 'free') {
    watermarkLocked.style.display = 'block';
    watermarkMain.style.display = 'none';
    watermarkQuotaInfo.innerHTML = `Nog ${watermarkQuota.limit-watermarkQuota.used} watermerk-foto's toegestaan deze maand.`;
  } else {
    watermarkLocked.style.display = 'none';
    watermarkMain.style.display = 'block';
    watermarkQuotaInfo.innerHTML = (watermarkQuota.limit===Infinity)?'Onbeperkt watermerken':'Nog '+(watermarkQuota.limit-watermarkQuota.used)+' watermerk-foto\'s deze maand';
  }
}

function updateWatermarkPreview() {
  watermarkPreview.style.fontFamily = watermarkFont.value;
  watermarkPreview.style.fontWeight = watermarkStyle.value==='bold'?'bold':'normal';
  watermarkPreview.style.fontStyle = watermarkStyle.value==='italic'?'italic':'normal';
  watermarkPreview.style.color = watermarkColor.value;
  watermarkPreview.style.fontSize = watermarkSize.value+'px';
  watermarkPreview.textContent = watermarkText.value||'(voorbeeld)';
}

if (watermarkStep) {
  updateWatermarkStep();
  [watermarkText, watermarkFont, watermarkStyle, watermarkColor, watermarkSize].forEach(el=>el && el.addEventListener('input', updateWatermarkPreview));
  watermarkPngInput && watermarkPngInput.addEventListener('change', updateWatermarkPreview);
  // Simuleer AI check na keuze
  watermarkText && watermarkText.addEventListener('blur', ()=>{
    if (watermarkPlan==='free' && watermarkText.value) {
      watermarkAIInfo.style.display = 'block';
      watermarkAIInfo.innerHTML = 'AI: Watermerk niet toegestaan bij Basis. <a href="prijzen-fotografen.html">Upgrade?</a>';
      watermarkObjectionBtn.style.display = 'inline-block';
    } else {
      watermarkAIInfo.style.display = 'none';
      watermarkObjectionBtn.style.display = 'none';
    }
  });
  watermarkObjectionBtn && watermarkObjectionBtn.addEventListener('click', ()=>{
    fetch(`${API}/api/watermark_objection`,{method:'POST',body:JSON.stringify({userId:getUserInfo().userId,reason:'AI afkeuring watermerk'})});
    watermarkAIInfo.innerHTML = 'Bezwaar ingediend! Admin beoordeelt je foto.';
  });
}
// Wizard step logica updaten
// const wizardSteps = Array.from(document.querySelectorAll('.wizard-step')); // AL REEDS GEDECLAREERD BOVENAAN
function showStep(idx) {
  wizardSteps.forEach((s,i)=>s.style.display = (i===idx?'flex':'none'));
  document.querySelectorAll('.wizard-dot').forEach((d,i)=>d.classList.toggle('active',i<=idx));
  currentStep = idx;
  if(idx===6) updateWatermarkStep && updateWatermarkStep();
  if(idx===7) updatePriceFields && updatePriceFields();
}

// --- Prijzen & shares stap ---
const priceFieldsDiv = document.getElementById('priceFields');
const userEmailPlaceholder = document.getElementById('userEmailPlaceholder');
function updatePriceFields() {
  // Haal e-mail op uit backend
  fetch(`${API}/api/account`).then(r=>r.json()).then(acc=>{
    userEmailPlaceholder.textContent = acc.email||'(onbekend)';
  });
  // Toon per foto een prijsveld en optioneel linkveld
  priceFieldsDiv.innerHTML = '';
  if (!photoInput.files || photoInput.files.length===0) {
    priceFieldsDiv.innerHTML = '<i>Upload eerst foto\'s om prijzen in te stellen.</i>';
    return;
  }
  Array.from(photoInput.files).forEach((file,i)=>{
    const fId = 'photo'+i;
    priceFieldsDiv.innerHTML += `
      <div class="price-photo-block">
        <b>Foto ${i+1}:</b> ${file.name}<br>
        <label>Prijs (€): <input type="number" min="0" step="0.01" id="price_${fId}" placeholder="Bijv. 7.95" required></label><br>
        <label>Eigen verkooplink (optioneel): <input type="url" id="link_${fId}" placeholder="https://jouwsite.nl/"></label>
      </div>
    `;
  });
}

// --- Akkoord-checks & uploadknop ---
const termsCheck = document.getElementById('termsCheck');
const aiCheck = document.getElementById('aiCheck');
const uploadBtn = document.getElementById('uploadBtn');
[termsCheck, aiCheck].forEach(chk=>chk.onchange=()=>{
  uploadBtn.disabled = !(termsCheck.checked && aiCheck.checked);
});

// --- Uploaden ---
const uploadWizard = document.getElementById('uploadWizard');
uploadWizard.onsubmit = async function(e) {
  e.preventDefault();
  showStatus('Bezig met uploaden...');
  const photographer = uploadWizard.photographer.value;
  const album = albumSelect.value;
  const photoData = [];
  Array.from(photoInput.files).forEach((file,i)=>{
    // Prijs en link ophalen uit velden
    let prijs = document.getElementById(`price_photo${i}`)?.value || '';
    let link = document.getElementById(`link_photo${i}`)?.value || '';
    photoData.push({
      titel: uploadWizard[`titel${i}`].value,
      beschrijving: uploadWizard[`beschrijving${i}`].value,
      club: '', // optioneel uitbreiden
      prijs: prijs,
      verkoopLink: link
    });
  });
  const fd = new FormData();
  fd.append('photographer', photographer);
  fd.append('album', album);
  fd.append('photoData', JSON.stringify(photoData));
  Array.from(photoInput.files).forEach(f=>fd.append('photos', f));
  // Portretrechten toevoegen
  if(portraitInput.files[0]) fd.append('portraitRights', portraitInput.files[0]);
  // Watermerk toevoegen
  if (watermarkPlan!=='free' && watermarkPngInput && watermarkPngInput.files[0]) {
    fd.append('watermarkPng', watermarkPngInput.files[0]);
  }
  if (watermarkPlan!=='free' && watermarkText && watermarkText.value) {
    fd.append('watermarkText', watermarkText.value);
    fd.append('watermarkFont', watermarkFont.value);
    fd.append('watermarkStyle', watermarkStyle.value);
    fd.append('watermarkColor', watermarkColor.value);
    fd.append('watermarkSize', watermarkSize.value);
    fd.append('watermarkPosition', watermarkPosition.value);
  }
  fetch(`${API}/api/upload`,{method:'POST',body:fd})
    .then(r=>r.json()).then(r=>{
      showStatus('Upload gelukt!');
      uploadWizard.reset();
      showStep(0);
    }).catch(()=>showStatus('Upload mislukt',true));
};

// --- Gezichtszoeker (face search) ---
// Wizard-stap toevoegen (optioneel: na upload of apart)
// Voorbeeld: knop toevoegen voor "Zoek jezelf op foto"
const wizardGlass = document.querySelector('.wizard-glass');
const faceSearchBtn = document.createElement('button');
faceSearchBtn.textContent = 'Zoek jezelf op foto';
faceSearchBtn.className = 'wizard-btn';
faceSearchBtn.style.marginTop = '18px';
wizardGlass.appendChild(faceSearchBtn);

faceSearchBtn.onclick = ()=>{
  // Pop-up voor face search
  const popup = document.createElement('div');
  popup.className = 'wizard-glass';
  popup.style.position = 'fixed'; popup.style.top = '10vh'; popup.style.left = '50%'; popup.style.transform = 'translateX(-50%)'; popup.style.zIndex = 9999;
  popup.innerHTML = `<h2>Zoek jezelf op foto</h2>
    <label>Upload 1 of meer portretfoto's van jezelf</label>
    <input type="file" id="faceSearchInput" multiple accept="image/*"><br>
    <label>Kies albums om te doorzoeken (optioneel)</label>
    <select id="faceSearchAlbums" multiple style="width:100%;margin-bottom:8px;"></select>
    <button id="doFaceSearch" class="wizard-btn">Zoeken</button>
    <button id="closeFaceSearch" class="wizard-btn">Sluiten</button>
    <div id="faceSearchResult" style="margin-top:12px;"></div>`;
  document.body.appendChild(popup);
  // Albums laden
  fetch(`${API}/api/albums?photographer=${encodeURIComponent(uploadWizard.photographer.value||'')}`)
    .then(r=>r.json()).then(data=>{
      const sel = popup.querySelector('#faceSearchAlbums');
      (data.albums||[]).forEach(a=>{
        const opt = document.createElement('option');
        opt.value = a.name; opt.textContent = a.name;
        sel.appendChild(opt);
      });
    });
  popup.querySelector('#closeFaceSearch').onclick = ()=>popup.remove();
  popup.querySelector('#doFaceSearch').onclick = ()=>{
    const input = popup.querySelector('#faceSearchInput');
    const sel = popup.querySelector('#faceSearchAlbums');
    const files = Array.from(input.files);
    const albumIds = Array.from(sel.selectedOptions).map(o=>o.value);
    const { userId, userType } = getUserInfo();
    if(!files.length) return popup.querySelector('#faceSearchResult').textContent = 'Selecteer minimaal 1 foto.';
    const fd = new FormData();
    files.forEach(f=>fd.append('photos',f));
    albumIds.forEach(id=>fd.append('album_ids',id));
    fd.append('userId',userId);
    fd.append('userType',userType);
    fetch(`${API}/api/face_search`,{method:'POST',body:fd})
      .then(r=>r.json()).then(r=>{
        if(r.error) return popup.querySelector('#faceSearchResult').innerHTML = `<span style='color:#e53935'>${r.error} (${r.searchType||''})</span>`;
        if((r.matches||[]).length===0) return popup.querySelector('#faceSearchResult').textContent = 'Geen matches gevonden.';
        popup.querySelector('#faceSearchResult').innerHTML = `<b>Resultaat (${r.searchType||''}):</b><ul>`+r.matches.map(m=>`<li>Foto ID: ${m.photo_id}, match score: ${m.distance.toFixed(3)}</li>`).join('')+`</ul>`;
      })
      .catch(()=>popup.querySelector('#faceSearchResult').textContent = 'Zoeken mislukt.');
  };
};
