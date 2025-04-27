// Dashboard logica voor MediaMatch
// --- Pjotters Currenty Dashboard uitgebreid ---
document.addEventListener('DOMContentLoaded', function() {
  // Simpele demo-data uit localStorage
  const user = localStorage.getItem('userEmail') || 'Gast';
  const isFotograaf = localStorage.getItem('role_' + user) === 'fotograaf';

  // Abonnement
  const aboDiv = document.getElementById('abo-status');
  let abo = localStorage.getItem('currenty_klant_' + user) === 'active' || localStorage.getItem('currenty_fotograaf_' + user) === 'active';
  aboDiv.textContent = abo ? 'Currenty-abonnement actief' : 'Geen actief abonnement';
  document.getElementById('upgrade-btn').onclick = () => {
    window.location.href = 'pricing.html';
  };

  // Gallery stats (dummy)
  document.getElementById('gallery-stats').innerHTML = `Bekeken foto's: <strong>${localStorage.getItem('gallery_views_' + user) || 0}</strong><br>Gedownloade foto's: <strong>${localStorage.getItem('downloads_' + user) || 0}</strong>`;

  // Pjotters saldo
  document.getElementById('dashboard-saldo').innerHTML = `Saldo: <span style='color:#ffd700;'>${parseInt(localStorage.getItem('pjotters_' + user) || '0', 10)} pjotters</span>`;
  document.getElementById('to-pc').onclick = () => {
    window.location.href = 'Pjotters-Currenty.html';
  };

  // Fotograaf stats
  if (isFotograaf) {
    document.querySelector('.dashboard-fotograaf').style.display = '';
    document.getElementById('fotograaf-stats').innerHTML = `Uploads: <strong>${localStorage.getItem('uploads_' + user) || 0}</strong><br>Albums: <strong>${localStorage.getItem('albums_' + user) || 0}</strong><br>Bekeken: <strong>${localStorage.getItem('foto_views_' + user) || 0}</strong><br>Likes: <strong>${localStorage.getItem('likes_' + user) || 0}</strong>`;
  }

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = function() {
      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(s=>s.style.display='none');
      btn.classList.add('active');
      document.getElementById('tab-'+btn.dataset.tab).style.display='block';
      if (btn.dataset.tab==='home') loadSummary();
      if (btn.dataset.tab==='gokgeschiedenis') loadHistory();
      if (btn.dataset.tab==='uitgaven') loadUitgaven();
      if (btn.dataset.tab==='inkomen') loadInkomen();
    }
  });
  // Init
  loadSummary();

  // Filterknop geschiedenis
  document.getElementById('filter-apply').onclick = loadHistory;
});

async function loadSummary() {
  const r = await fetch('/api/pjotters/summary', { headers: { 'Authorization': 'Bearer '+(localStorage.getItem('token')||'') }});
  const data = await r.json();
  document.getElementById('summary-info').innerHTML = `Saldo: <b style='color:#ffd700;'>${data.saldo||0} pjotters</b><br>Totaal inkomen: <b style='color:#0f0;'>${data.inkomen||0}</b><br>Totaal uitgaven: <b style='color:#f44;'>${data.uitgaven||0}</b>`;
  drawLineChart(data.verloop||[]);
}

function drawLineChart(verloop) {
  let ctx = document.getElementById('saldo-grafiek').getContext('2d');
  if (window.saldoChart) window.saldoChart.destroy();
  window.saldoChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: verloop.map(p=>p.tijd.split('T')[0]),
      datasets: [{
        label: 'Saldo',
        data: verloop.map(p=>p.saldo),
        borderColor: '#ffd700',
        backgroundColor: 'rgba(255,215,0,0.1)',
        tension: 0.2,
        fill: true,
        pointRadius: 2
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#fff' }, grid: { color: '#333' } },
        y: { ticks: { color: '#fff' }, grid: { color: '#333' } }
      }
    }
  });
}

async function loadHistory() {
  const from = document.getElementById('filter-from').value;
  const to = document.getElementById('filter-to').value;
  const type = document.getElementById('filter-type').value;
  const spel = document.getElementById('filter-spel').value;
  const result = document.getElementById('filter-result').value;
  let url = `/api/pjotters/history?`;
  if (from) url += `from=${from}&`;
  if (to) url += `to=${to}&`;
  if (type) url += `type=${type}&`;
  if (spel) url += `spel=${encodeURIComponent(spel)}&`;
  if (result) url += `result=${result}&`;
  const r = await fetch(url, { headers: { 'Authorization': 'Bearer '+(localStorage.getItem('token')||'') }});
  const data = await r.json();
  const tbody = document.getElementById('history-tbody');
  tbody.innerHTML = '';
  data.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${a.tijd.split('T')[0]}</td><td>${a.activiteit||''}</td><td style='color:${parseInt(a.coins,10)>0?'#0f0':'#f44'};'>${a.coins}</td>`;
    tbody.appendChild(tr);
  });
}

async function loadUitgaven() {
  const r = await fetch('/api/pjotters/history?result=loss', { headers: { 'Authorization': 'Bearer '+(localStorage.getItem('token')||'') }});
  const data = await r.json();
  document.getElementById('uitgaven-info').innerHTML = `Totaal uitgaven: <b style='color:#f44;'>${data.reduce((acc,a)=>acc+parseInt(a.coins,10),0)}</b>`;
  const tbody = document.getElementById('uitgaven-tbody');
  tbody.innerHTML = '';
  data.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${a.tijd.split('T')[0]}</td><td>${a.activiteit||''}</td><td style='color:#f44;'>${a.coins}</td>`;
    tbody.appendChild(tr);
  });
}

async function loadInkomen() {
  const r = await fetch('/api/pjotters/history?result=win', { headers: { 'Authorization': 'Bearer '+(localStorage.getItem('token')||'') }});
  const data = await r.json();
  document.getElementById('inkomen-info').innerHTML = `Totaal inkomen: <b style='color:#0f0;'>${data.reduce((acc,a)=>acc+parseInt(a.coins,10),0)}</b>`;
  const tbody = document.getElementById('inkomen-tbody');
  tbody.innerHTML = '';
  data.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${a.tijd.split('T')[0]}</td><td>${a.activiteit||''}</td><td style='color:#0f0;'>${a.coins}</td>`;
    tbody.appendChild(tr);
  });
}

// === MediaMatch Dashboard Loader ===
// Laadt dynamisch het juiste dashboard op basis van user role & abonnement

// Haal profiel uit backend (dummy: localStorage)
async function fetchUserProfile() {
  // In productie: haal uit backend met token
  return JSON.parse(localStorage.getItem('userProfile') || '{}');
}

async function fetchApiUsage() {
  // Dummy data, vervang met echte API-call
  return { total: 1234, month: 56, plan: 'pro', limit: 1000 };
}
async function fetchArtistTracks() {
  return [
    { title: 'Zomerzon', listens: 120, likes: 15, comments: 2 },
    { title: 'Herfstwind', listens: 98, likes: 8, comments: 1 }
  ];
}
async function fetchPhotographerUploads() {
  return [
    { name: 'Bruiloft', date: '2025-03-01', likes: 12, comments: 3 },
    { name: 'Portret', date: '2025-04-10', likes: 7, comments: 0 }
  ];
}
async function fetchPhotographerAlbums() {
  return [
    { title: 'Lente', count: 24 },
    { title: 'Zomer', count: 18 }
  ];
}
async function fetchPhotographerLiveChats() {
  return [
    { klant: 'Jan', last: 'Hoi, kan ik deze foto kopen?' },
    { klant: 'Lisa', last: 'Bedankt voor de shoot!' }
  ];
}
async function fetchClientFaceResults() {
  return [
    { photo: 'IMG_1234.jpg', match: 'Bruiloft 2024', date: '2025-04-01' },
    { photo: 'IMG_9999.jpg', match: 'Portret', date: '2025-04-03' }
  ];
}
async function fetchClientFavorites() {
  return [
    { title: 'Herfstwandeling', photographer: 'Sanne', date: '2025-03-21' }
  ];
}
async function fetchClientComments() {
  return [
    { comment: 'Prachtige foto!', photo: 'Bruiloft', date: '2025-03-01' }
  ];
}
async function fetchMusicAIGenerated() {
  return [
    { title: 'AI Song 1', genre: 'Pop', plays: 44 },
    { title: 'AI Song 2', genre: 'Jazz', plays: 17 }
  ];
}
async function fetchMusicAIGenres() {
  return [
    { genre: 'Pop', count: 12 },
    { genre: 'Jazz', count: 5 }
  ];
}

const DASHBOARD_COMPONENTS = {
  developer: async function(user) {
    const api = await fetchApiUsage();
    return `
      <h2>Developer Dashboard</h2>
      <section class="dashboard-section">
        <h3>API-gebruik</h3>
        <div id="api-usage">
          <p><strong>Totaal:</strong> ${api.total} calls</p>
          <p><strong>Deze maand:</strong> ${api.month} / ${api.limit} (${api.plan})</p>
        </div>
        <h3>API-sleutel</h3>
        <div class="api-key-box">${user.apiKey || 'Geen API-key gevonden.'}</div>
        <button id="regen-api-key">Genereer nieuwe API-key</button>
      </section>
      <section class="dashboard-section"><h3>Instellingen</h3>${renderSettings(user)}</section>
    `;
  },
  artiest: async function(user) {
    const tracks = await fetchArtistTracks();
    return `
      <h2>Artiest Dashboard</h2>
      <section class="dashboard-section">
        <h3>Mijn tracks</h3>
        <ul class="dashboard-list">
          ${tracks.map(t=>`<li>${t.title} <span class='badge'>${t.listens} beluisterd, ${t.likes} likes, ${t.comments} reacties</span></li>`).join('')}
        </ul>
        <h3>Likes & Comments</h3>
        <div id="artist-likes-comments">(Likes/comments API coming soon)</div>
      </section>
      <section class="dashboard-section"><h3>Instellingen</h3>${renderSettings(user)}</section>
    `;
  },
  fotograaf: async function(user) {
    const uploads = await fetchPhotographerUploads();
    const albums = await fetchPhotographerAlbums();
    const chats = await fetchPhotographerLiveChats();
    return `
      <h2>Fotograaf Dashboard</h2>
      <section class="dashboard-section">
        <h3>Mijn uploads</h3>
        <ul class="dashboard-list">
          ${uploads.map(u=>`<li>${u.name} (${u.date}) <span class='badge'>${u.likes} likes, ${u.comments} reacties</span></li>`).join('')}
        </ul>
        <h3>Albums</h3>
        <ul class="dashboard-list">
          ${albums.map(a=>`<li>${a.title} <span class='badge'>${a.count} foto's</span></li>`).join('')}
        </ul>
        <h3>Live chat met klanten</h3>
        <ul class="dashboard-list">
          ${chats.map(c=>`<li><strong>${c.klant}:</strong> ${c.last}</li>`).join('')}
        </ul>
      </section>
      <section class="dashboard-section"><h3>Instellingen</h3>${renderSettings(user)}</section>
    `;
  },
  klant: async function(user) {
    const faces = await fetchClientFaceResults();
    const favs = await fetchClientFavorites();
    const comments = await fetchClientComments();
    return `
      <h2>Klant Dashboard</h2>
      <section class="dashboard-section">
        <h3>Gezichtsherkennings-resultaten</h3>
        <ul class="dashboard-list">
          ${faces.map(f=>`<li>${f.photo} → <em>${f.match}</em> (${f.date})</li>`).join('')}
        </ul>
        <h3>Favoriete foto's</h3>
        <ul class="dashboard-list">
          ${favs.map(f=>`<li>${f.title} door ${f.photographer} (${f.date})</li>`).join('')}
        </ul>
        <h3>Mijn comments</h3>
        <ul class="dashboard-list">
          ${comments.map(c=>`<li>${c.comment} op ${c.photo} (${c.date})</li>`).join('')}
        </ul>
      </section>
      <section class="dashboard-section"><h3>Instellingen</h3>${renderSettings(user)}</section>
    `;
  },
  musicai: async function(user) {
    const generated = await fetchMusicAIGenerated();
    const genres = await fetchMusicAIGenres();
    return `
      <h2>Music AI Dashboard</h2>
      <section class="dashboard-section">
        <h3>Gegenereerde muziek</h3>
        <ul class="dashboard-list">
          ${generated.map(g=>`<li>${g.title} (${g.genre}) <span class='badge'>${g.plays} beluisterd</span></li>`).join('')}
        </ul>
        <h3>Genres & Beluisteringen</h3>
        <ul class="dashboard-list">
          ${genres.map(g=>`<li>${g.genre}: ${g.count} tracks</li>`).join('')}
        </ul>
      </section>
      <section class="dashboard-section"><h3>Instellingen</h3>${renderSettings(user)}</section>
    `;
  },
};

function renderSettings(user) {
  return `
    <div class="settings-box">
      <p><strong>Naam:</strong> ${user.name || ''}</p>
      <p><strong>E-mail:</strong> ${user.email || ''}</p>
      <button id="edit-profile">Wijzig gegevens</button>
      <button id="delete-account" class="danger">Verwijder account</button>
      <h4>Analyse over jou</h4>
      <div id="user-analysis">${user.analysis || 'Geen analyse beschikbaar.'}</div>
    </div>
  `;
}

async function loadDashboard() {
  const user = await fetchUserProfile();
  const root = document.getElementById('dashboard-root');
  if (!user || !user.role) {
    root.innerHTML = '<p>Niet ingelogd of geen gebruikersprofiel gevonden.</p>';
    return;
  }
  const component = DASHBOARD_COMPONENTS[user.role] || (async () => '<p>Onbekende rol.</p>');
  root.innerHTML = await component(user);
}

document.addEventListener('DOMContentLoaded', loadDashboard);
