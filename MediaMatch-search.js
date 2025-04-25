// MediaMatch-search.js

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      if (this.classList.contains('active')) return;
      window.location.href = this.getAttribute('href');
    });
  });
  document.getElementById('search-btn').onclick = async function() {
    const q = document.getElementById('search-input').value.trim();
    if (!q) return;
    const res = await fetch(config.apiUrl + '/api/music/list', { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token')||'') }});
    const data = await res.json();
    const results = data.filter(track =>
      (track.genre||'').toLowerCase().includes(q.toLowerCase()) ||
      (track.sfeer||'').toLowerCase().includes(q.toLowerCase()) ||
      (track.tekst||'').toLowerCase().includes(q.toLowerCase()) ||
      (track.origName||'').toLowerCase().includes(q.toLowerCase())
    );
    renderTrackList('search-results', results);
  };
  function renderTrackList(divId, tracks) {
    const el = document.getElementById(divId);
    el.innerHTML = '';
    if (!tracks || !tracks.length) { el.innerText = 'Geen muziek gevonden.'; return; }
    tracks.forEach(track => {
      const d = document.createElement('div');
      d.className = 'musicmatch-track';
      d.innerHTML = `<b>${track.genre||'Onbekend genre'}</b> - ${track.sfeer||''} <audio controls src="${config.apiUrl}/api/music/stream/${track.id}"></audio>`;
      el.appendChild(d);
    });
  }
});
