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
