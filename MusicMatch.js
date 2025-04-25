// MusicMatch.js - frontend logica voor MusicMatch.html

document.addEventListener('DOMContentLoaded', function() {
  // Tab navigatie
  const tabs = ['home', 'search', 'library', 'dashboard'];
  tabs.forEach(tab => {
    document.getElementById('tab-' + tab).onclick = function() {
      tabs.forEach(t => {
        document.getElementById('tab-' + t).classList.remove('active');
        document.getElementById('tab-content-' + t).style.display = 'none';
      });
      this.classList.add('active');
      document.getElementById('tab-content-' + tab).style.display = '';
    };
  });

  // Home: laad secties
  async function loadHomeSections() {
    // Recent beluisterd
    const recent = JSON.parse(localStorage.getItem('musicmatch_recent') || '[]');
    renderTrackList('recent-listens', recent);
    // Recente Playlisten
    const playlists = JSON.parse(localStorage.getItem('musicmatch_playlists') || '[]');
    renderPlaylistList('recent-playlists', playlists);
    // Nieuwe muziek
    const resNew = await fetch(config.apiUrl + '/api/music/list', { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token')||'') }});
    const newMusic = await resNew.json();
    renderTrackList('new-music', newMusic.slice(-8).reverse());
    // Speciaal voor jou (dummy: random 4 tracks)
    renderTrackList('personal-recs', shuffle(newMusic).slice(0,4));
  }

  // Zoeken
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

  // Bibliotheek
  async function loadLibrary() {
    const res = await fetch(config.apiUrl + '/api/music/list', { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token')||'') }});
    const data = await res.json();
    // Filter op favorieten en eigen uploads
    const user = localStorage.getItem('email') || '';
    const favs = data.filter(t => (t.favorites||[]).includes(user));
    const own = data.filter(t => t.user === user);
    renderTrackList('library-list', [...favs, ...own]);
  }

  // Favoriet maken vanuit elke lijst
  function addFavoriteButton(track, parentDiv) {
    const favBtn = document.createElement('button');
    favBtn.innerText = '★';
    favBtn.title = 'Favoriet';
    favBtn.className = 'fav-btn';
    favBtn.onclick = async function() {
      await fetch(config.apiUrl + '/api/music/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('token')||'') },
        body: JSON.stringify({ id: track.id })
      });
      // Update recent beluisterd
      addRecentListen(track);
      loadHomeSections();
      loadLibrary();
    };
    parentDiv.appendChild(favBtn);
  }

  // Playlists (verzamelingen) maken en tonen
  function addToPlaylistButton(track, parentDiv) {
    const plBtn = document.createElement('button');
    plBtn.innerText = '+ Verzamel';
    plBtn.className = 'playlist-btn';
    plBtn.onclick = function() {
      const name = prompt('Naam van je verzameling/playlist?');
      if (!name) return;
      fetch(config.apiUrl + '/api/music/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('token')||'') },
        body: JSON.stringify({ id: track.id, name })
      }).then(()=>{
        addRecentPlaylist(name, track);
        loadHomeSections();
      });
    };
    parentDiv.appendChild(plBtn);
  }

  // Helpers voor recent beluisterd en playlists
  function addRecentListen(track) {
    let recent = JSON.parse(localStorage.getItem('musicmatch_recent')||'[]');
    recent = [track, ...recent.filter(t => t.id !== track.id)].slice(0, 8);
    localStorage.setItem('musicmatch_recent', JSON.stringify(recent));
  }
  function addRecentPlaylist(name, track) {
    let playlists = JSON.parse(localStorage.getItem('musicmatch_playlists')||'[]');
    let pl = playlists.find(p => p.name === name);
    if (!pl) { pl = { name, tracks: [] }; playlists.unshift(pl); }
    pl.tracks = [track, ...pl.tracks.filter(t => t.id !== track.id)].slice(0, 30);
    localStorage.setItem('musicmatch_playlists', JSON.stringify(playlists.slice(0, 8)));
  }

  // Uitgebreide track rendering met interactie
  function renderTrackList(divId, tracks) {
    const el = document.getElementById(divId);
    el.innerHTML = '';
    if (!tracks || !tracks.length) { el.innerText = 'Geen muziek gevonden.'; return; }
    tracks.forEach(track => {
      const d = document.createElement('div');
      d.className = 'musicmatch-track';
      d.innerHTML = `<b>${track.genre||'Onbekend genre'}</b> - ${track.sfeer||''} <audio controls src="${config.apiUrl}/api/music/stream/${track.id}"></audio>`;
      addFavoriteButton(track, d);
      addToPlaylistButton(track, d);
      // Update recent beluisterd bij afspelen
      const audio = d.querySelector('audio');
      audio.onplay = () => addRecentListen(track);
      el.appendChild(d);
    });
  }

  // Uitgebreide playlist rendering
  function renderPlaylistList(divId, playlists) {
    const el = document.getElementById(divId);
    el.innerHTML = '';
    if (!playlists || !playlists.length) { el.innerText = 'Geen playlists.'; return; }
    playlists.forEach(pl => {
      const d = document.createElement('div');
      d.className = 'musicmatch-playlist';
      d.innerHTML = `<b>${pl.name}</b> (${pl.tracks.length} tracks)`;
      pl.tracks.forEach(track => {
        const t = document.createElement('div');
        t.className = 'musicmatch-track';
        t.innerHTML = `<b>${track.genre||'Onbekend genre'}</b> <audio controls src="${config.apiUrl}/api/music/stream/${track.id}"></audio>`;
        addFavoriteButton(track, t);
        d.appendChild(t);
      });
      el.appendChild(d);
    });
  }

  // Helpers
  function shuffle(arr) {
    return arr.map(a => [Math.random(), a]).sort((a,b) => a[0]-b[0]).map(a=>a[1]);
  }

  // Init
  loadHomeSections();
  loadLibrary();
});
