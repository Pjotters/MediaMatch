// beheer-albums.js
// Albumbeheer: albums ophalen, tonen, verwijderen (met backend)
document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('albumsGrid');
  let albums = [];
  async function fetchAlbums() {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;opacity:.7;">Laden...</div>';
    try {
      const res = await fetch(`${window.config.apiUrl}/api/albums?photographer=${encodeURIComponent(window.localStorage.getItem('photographerName')||'')}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      albums = await res.json();
    } catch {
      albums = [];
    }
    renderAlbums();
  }

  function renderAlbums() {
    if (!albums.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;opacity:.7;">Geen albums gevonden.</div>';
      return;
    }
    grid.innerHTML = '';
    albums.forEach(album => {
      const card = document.createElement('div');
      card.className = 'album-card';
      card.innerHTML = `
        <img src="${album.cover ? '/uploads/' + encodeURIComponent(album.name) + '/' + encodeURIComponent(album.cover) : 'assets/no-cover.png'}" class="album-cover" alt="Cover">
        <div class="album-title">${album.name}</div>
        <div class="album-desc">${album.description||'<em>Geen beschrijving</em>'}</div>
        <div class="album-meta">Aangemaakt: ${album.date ? new Date(album.date).toLocaleDateString() : '-'}</div>
        <div class="album-actions">
          <button class="beheer-btn delete">Verwijder</button>
        </div>
      `;
      card.querySelector('.beheer-btn.delete').onclick = async () => {
        if (!confirm(`Weet je zeker dat je album '${album.name}' wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) return;
        await fetch(`${window.config.apiUrl}/api/album`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ photographer: window.localStorage.getItem('photographerName'), album: album.name })
        });
        fetchAlbums();
      };
      grid.appendChild(card);
    });
  }

  fetchAlbums();
});
