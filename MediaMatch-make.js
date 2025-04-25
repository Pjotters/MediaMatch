// MediaMatch-make.js - AI muziek genereren en uploaden

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      if (this.classList.contains('active')) return;
      window.location.href = this.getAttribute('href');
    });
  });
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
  };
});
