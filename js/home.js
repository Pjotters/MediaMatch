// home.js - Laadt de laatste uploads op de homepagina
fetch(window.config.photoApiUrl + '/api/photos')
  .then(res => res.json())
  .then(data => {
    const grid = document.getElementById('latest-photos');
    grid.innerHTML = '';
    (data.photos || []).slice(0,12).forEach(photo => {
      const div = document.createElement('div');
      div.className = 'photo-thumb';
      div.innerHTML = `<img src="${window.config.photoApiUrl}/uploads/${photo.filename}" alt="Foto" />`;
      grid.appendChild(div);
    });
  });
