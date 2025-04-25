// Muziek tab logica voor MediaMatch

document.addEventListener('DOMContentLoaded', function() {
  const tabBtn = document.createElement('button');
  tabBtn.innerText = 'Muziek';
  tabBtn.onclick = () => showTab('music-tab');
  document.getElementById('dashboard-tabs').appendChild(tabBtn);

  // Dynamisch tonen van vervolgvragen
  const typeSelect = document.getElementById('music-type');
  typeSelect.addEventListener('change', function() {
    document.getElementById('music-followup-instrumental').style.display = this.value === 'instrumentaal' ? '' : 'none';
    document.getElementById('music-followup-tekst').style.display = this.value === 'tekst' ? '' : 'none';
  });

  // AI muziek genereren
  document.getElementById('music-gen-form').onsubmit = async function(e) {
    e.preventDefault();
    const type = typeSelect.value;
    let body = { type };
    if (type === 'instrumentaal') {
      body.genre = this.genre.value;
      body.sfeer = this.sfeer.value;
      body.lengte = this.lengte.value;
    } else {
      body.genre = this.genre_t.value;
      body.sfeer = this.sfeer_t.value;
      body.tekst = this.tekst.value;
      body.lengte = this.lengte_t.value;
    }
    const res = await fetch(config.apiUrl + '/api/music/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('token')||'') },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('music-gen-result').innerHTML = 'Muziek gegenereerd! <a href="' + config.apiUrl + '/api/music/stream/' + data.id + '" target="_blank">Luister hier</a>';
      loadMusicList();
    } else {
      document.getElementById('music-gen-result').innerText = data.message || 'Er ging iets mis.';
    }
  };

  // Muziek uploaden
  document.getElementById('music-upload-form').onsubmit = async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const res = await fetch(config.apiUrl + '/api/music/upload', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token')||'') },
      body: formData
    });
    const data = await res.json();
    document.getElementById('music-upload-result').innerText = data.success ? 'Upload gelukt!' : (data.message || 'Upload mislukt.');
    loadMusicList();
  };

  // Muziek bibliotheek laden
  async function loadMusicList() {
    const res = await fetch(config.apiUrl + '/api/music/list', {
      headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token')||'') }
    });
    const data = await res.json();
    const listDiv = document.getElementById('music-list');
    listDiv.innerHTML = '';
    if (Array.isArray(data) && data.length) {
      data.forEach(track => {
        const el = document.createElement('div');
        el.className = 'music-track';
        el.innerHTML = '<b>' + (track.genre || 'Onbekend genre') + '</b> - ' + (track.sfeer || '') +
          ' <audio controls src="' + config.apiUrl + '/api/music/stream/' + track.id + '"></audio>';
        listDiv.appendChild(el);
      });
    } else {
      listDiv.innerText = 'Nog geen muziek beschikbaar.';
    }
  }
  loadMusicList();
});
