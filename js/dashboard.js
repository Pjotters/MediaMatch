// dashboard.js - MediaMatch
const API = window.config.photoApiUrl;
const accountForm = document.getElementById('accountForm');
const naamInput = document.getElementById('naamInput');
const emailInput = document.getElementById('emailInput');
const planLabel = document.getElementById('planLabel');
const verifiedBadge = document.getElementById('verifiedBadge');
const aiTrainCheck = document.getElementById('aiTrainCheck');
const quotaOverview = document.getElementById('quotaOverview');
const myUploads = document.getElementById('myUploads');

function getUserInfo() {
  let userId = localStorage.getItem('mediamatch_userid') || 'anon';
  let userType = localStorage.getItem('mediamatch_usertype') || 'free';
  return { userId, userType };
}

function loadAccount() {
  const { userId } = getUserInfo();
  fetch(`${API}/api/account?userId=${encodeURIComponent(userId)}`)
    .then(r=>r.json()).then(acc=>{
      naamInput.value = acc.naam||'';
      emailInput.value = acc.email||'';
      planLabel.textContent = acc.plan||'free';
      verifiedBadge.innerHTML = acc.verified?'<span style="color:#a259ff;font-weight:bold">✔️ Ja</span>':'<span style="color:#ccc">Nee</span>';
      aiTrainCheck.checked = !!acc.aiTrain;
    });
}
accountForm.onsubmit = function(e) {
  e.preventDefault();
  const { userId } = getUserInfo();
  fetch(`${API}/api/account`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      userId,
      naam: naamInput.value,
      email: emailInput.value,
      aiTrain: aiTrainCheck.checked
    })
  }).then(()=>alert('Gegevens opgeslagen!'));
};

function loadQuota() {
  const { userId, userType } = getUserInfo();
  fetch(`${API}/api/quota?userId=${encodeURIComponent(userId)}&userType=${encodeURIComponent(userType)}`)
    .then(r=>r.json()).then(q=>{
      quotaOverview.innerHTML = `<ul>`+
        Object.entries(q).map(([type,info])=>`<li>${type}: ${info.used} van ${info.limit} gebruikt</li>`).join('')+
        `</ul>`;
    });
}

function loadUploads() {
  const { userId } = getUserInfo();
  fetch(`${API}/api/photos?userId=${encodeURIComponent(userId)}`)
    .then(r=>r.json()).then(data=>{
      myUploads.innerHTML = (data.photos||[]).map(p=>`<div class="photo-thumb"><img src="${API}/uploads/${p.filename}"/><br>${p.titel||''}</div>`).join('')||'Nog geen uploads.';
    });
}

loadAccount();
loadQuota();
loadUploads();
