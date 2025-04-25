// Pjotters-Currenty Dashboard uitgebreid met tabs, filters, grafiek, geschiedenis, uitgaven, inkomen

document.addEventListener('DOMContentLoaded', function() {
  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = function() {
      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(s=>s.style.display='none');
      btn.classList.add('active');
      document.getElementById('tab-'+btn.dataset.tab).style.display='block';
      if (btn.dataset.tab==='home') loadSummary();
      if (btn.dataset.tab==='geschiedenis') loadHistory();
      if (btn.dataset.tab==='uitgaven') loadUitgaven();
      if (btn.dataset.tab==='inkomen') loadInkomen();
    }
  });
  // Init
  loadSummary();
  document.getElementById('filter-apply').onclick = loadHistory;
});

// --- HOME ---
async function loadSummary() {
  await fetchSaldo();
  await fetchAbos();
  await fetchActiviteiten();
  const r = await fetch('/api/pjotters/summary', { headers: { 'Authorization': 'Bearer '+(localStorage.getItem('token')||'') }});
  const data = await r.json();
  drawPcLineChart(data.verloop||[]);
}
function drawPcLineChart(verloop) {
  let ctx = document.getElementById('pc-saldo-grafiek').getContext('2d');
  if (window.pcSaldoChart) window.pcSaldoChart.destroy();
  window.pcSaldoChart = new Chart(ctx, {
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

// --- GESCHIEDENIS ---
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
  const tbody = document.getElementById('pc-history-tbody');
  tbody.innerHTML = '';
  data.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${a.tijd.split('T')[0]}</td><td>${a.activiteit||''}</td><td style='color:${parseInt(a.coins,10)>0?'#0f0':'#f44'};'>${a.coins}</td>`;
    tbody.appendChild(tr);
  });
}

// --- UITGAVEN ---
async function loadUitgaven() {
  const r = await fetch('/api/pjotters/history?result=loss', { headers: { 'Authorization': 'Bearer '+(localStorage.getItem('token')||'') }});
  const data = await r.json();
  document.getElementById('pc-uitgaven-info').innerHTML = `Totaal uitgaven: <b style='color:#f44;'>${data.reduce((acc,a)=>acc+parseInt(a.coins,10),0)}</b>`;
  const tbody = document.getElementById('pc-uitgaven-tbody');
  tbody.innerHTML = '';
  data.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${a.tijd.split('T')[0]}</td><td>${a.activiteit||''}</td><td style='color:#f44;'>${a.coins}</td>`;
    tbody.appendChild(tr);
  });
}

// --- INKOMEN ---
async function loadInkomen() {
  const r = await fetch('/api/pjotters/history?result=win', { headers: { 'Authorization': 'Bearer '+(localStorage.getItem('token')||'') }});
  const data = await r.json();
  document.getElementById('pc-inkomen-info').innerHTML = `Totaal inkomen: <b style='color:#0f0;'>${data.reduce((acc,a)=>acc+parseInt(a.coins,10),0)}</b>`;
  const tbody = document.getElementById('pc-inkomen-tbody');
  tbody.innerHTML = '';
  data.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${a.tijd.split('T')[0]}</td><td>${a.activiteit||''}</td><td style='color:#0f0;'>${a.coins}</td>`;
    tbody.appendChild(tr);
  });
}

// --- Bestaande functies blijven ---
async function fetchSaldo() {
  const res = await fetch('/api/pjotters/saldo', { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token')||'') } });
  const data = await res.json();
  document.getElementById('pc-saldo').innerHTML = `<strong>Saldo:</strong> <span style='color:#ffd700;'>${data.saldo} pjotters</span>`;
}
async function fetchAbos() {
  const user = localStorage.getItem('userEmail') || 'Gast';
  let klant = localStorage.getItem('currenty_klant_' + user) === 'active';
  let fotograaf = localStorage.getItem('currenty_fotograaf_' + user) === 'active';
  document.getElementById('pc-abos').innerHTML = `<strong>Abonnementen:</strong><br>Klant: ${klant ? 'Currenty' : 'Standaard'}<br>Fotograaf: ${fotograaf ? 'Currenty' : 'Standaard'}`;
}
async function fetchActiviteiten() {
  const res = await fetch('/api/pjotters/activiteiten', { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token')||'') } });
  const data = await res.json();
  document.getElementById('pc-activiteiten').innerHTML = '<strong>Activiteiten:</strong><br>' + (data.length === 0 ? '<em>Nog geen activiteiten.</em>' :
    '<ul>' + data.reverse().slice(0,20).map(a => `<li>${a.activiteit} (${a.coins>0?'+':''}${a.coins} pjotters) <span style="color:#888;font-size:0.9em;">${new Date(a.tijd).toLocaleString()}</span></li>`).join('') + '</ul>');
}
async function fetchLeaderboard() {
  const res = await fetch('/api/pjotters/leaderboard');
  const lb = await res.json();
  document.getElementById('leaderboard').innerHTML = lb.length===0 ? '<em>Nog geen spelers.</em>' :
    '<ol>' + lb.map(u => `<li>${u.email}: <span style=\"color:#ffd700;\">${u.saldo} pjotters</span></li>`).join('') + '</ol>';
}
fetchLeaderboard();
