// gallery.js - Laadt foto's en albums, en toont comments/likes
function loadGallery(album = 'all') {
  fetch(window.config.photoApiUrl + '/api/photos?album=' + album)
    .then(res => res.json())
    .then(data => {
      const grid = document.getElementById('gallery-grid');
      grid.innerHTML = '';
      (data.photos || []).forEach(photo => {
        const div = document.createElement('div');
        div.className = 'photo-thumb';
        div.innerHTML = `
          <img src="${window.config.photoApiUrl}/uploads/${photo.filename}" alt="Foto" />
          <div class="photo-actions">
            <button onclick="likePhoto('${photo.id}')">❤️ <span id="like-count-${photo.id}">${photo.likes||0}</span></button>
            <button onclick="showComments('${photo.id}')">💬</button>
          </div>
          <div class="comments" id="comments-${photo.id}" style="display:none;"></div>
        `;
        grid.appendChild(div);
      });
    });
}

document.querySelectorAll('.album-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.album-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    loadGallery(btn.dataset.album);
  });
});

function likePhoto(photoId) {
  fetch(window.config.photoApiUrl + '/api/photos/' + photoId + '/like', {method:'POST'})
    .then(res => res.json())
    .then(data => {
      document.getElementById('like-count-' + photoId).textContent = data.likes;
    });
}

function showComments(photoId) {
  const el = document.getElementById('comments-' + photoId);
  if (el.style.display === 'block') {
    el.style.display = 'none';
    return;
  }
  fetch(window.config.photoApiUrl + '/api/photos/' + photoId + '/comments')
    .then(res => res.json())
    .then(data => {
      el.innerHTML = '<ul>' + (data.comments||[]).map(c=>`<li><b>${c.user}:</b> ${c.text}</li>`).join('') + '</ul>' +
        `<form onsubmit="postComment('${photoId}', this); return false;">
          <input name="comment" placeholder="Jouw reactie..." required />
          <button type="submit">Plaatsen</button>
        </form>`;
      el.style.display = 'block';
    });
}

function postComment(photoId, form) {
  const comment = form.comment.value;
  fetch(window.config.photoApiUrl + '/api/photos/' + photoId + '/comments', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ text: comment })
  })
    .then(res => res.json())
    .then(()=> showComments(photoId));
}

// Init
loadGallery('all');
