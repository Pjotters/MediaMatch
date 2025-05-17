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
const statsOverview = document.getElementById('statsOverview');
const favoritesOverview = document.getElementById('favoritesOverview');
const notificationsOverview = document.getElementById('notificationsOverview');

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
loadStats();
loadFavorites();
loadNotifications();

function loadStats() {
  const { userId } = getUserInfo();
  fetch(`${API}/api/user/stats?userId=${encodeURIComponent(userId)}`)
    .then(r=>r.json())
    .then(stats => {
      statsOverview.innerHTML = `<ul>`+
        `<li>Uploads: ${stats.uploads||0}</li>`+
        `<li>Downloads: ${stats.downloads||0}</li>`+
        `<li>Likes: ${stats.likes||0}</li>`+
        `<li>Reacties: ${stats.comments||0}</li>`+
      `</ul>`;
    })
    .catch(()=>{statsOverview.innerHTML='Niet beschikbaar';});
}

function loadFavorites() {
  const { userId } = getUserInfo();
  fetch(`${API}/api/user/favorites?userId=${encodeURIComponent(userId)}`)
    .then(r=>r.json())
    .then(favs => {
      favoritesOverview.innerHTML = (favs.favorites||[]).map(f=>`<div class="favorite-item">${f.type==='photo'?'<img src="'+API+'/uploads/'+f.filename+'" class="fav-thumb"/>':f.title}</div>`).join('')||'Nog geen favorieten.';
    })
    .catch(()=>{favoritesOverview.innerHTML='Niet beschikbaar';});
}

function loadNotifications() {
  const { userId } = getUserInfo();
  fetch(`${API}/api/user/notifications?userId=${encodeURIComponent(userId)}`)
    .then(r=>r.json())
    .then(nots => {
      notificationsOverview.innerHTML = (nots.notifications||[]).map(n=>`<div class="notification-item">${n.message}</div>`).join('')||'Geen notificaties.';
    })
    .catch(()=>{notificationsOverview.innerHTML='Niet beschikbaar';});
}
