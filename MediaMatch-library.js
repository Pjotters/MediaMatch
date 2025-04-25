// MediaMatch-library.js

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      if (this.classList.contains('active')) return;
      window.location.href = this.getAttribute('href');
    });
  });
  async function loadLibrary() {
    const res = await fetch(config.apiUrl + '/api/music/list', { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token')||'') }});
    const data = await res.json();
    const user = localStorage.getItem('email') || '';
    const favs = data.filter(t => (t.favorites||[]).includes(user));
    const own = data.filter(t => t.user === user);
    renderTrackList('library-list', [...favs, ...own]);
  }
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
  loadLibrary();
});
