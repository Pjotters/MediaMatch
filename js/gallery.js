// gallery.js - Laadt foto's en albums, en toont comments/likes
function loadGallery(album = 'all') {
  const userId = localStorage.getItem('mediamatch_userid') || 'anon';
  fetch(window.config.photoApiUrl + '/api/photos/top')
    .then(res => res.json())
    .then(data => {
      const grid = document.getElementById('gallery-grid');
      grid.innerHTML = '';
      (data.photos || []).forEach(photo => {
        // Check of deze foto een favoriet is voor de gebruiker
        let isFav = false;
        try {
          const favs = JSON.parse(localStorage.getItem('mediamatch_favorites')||'[]');
          isFav = favs.includes(photo.filename);
        } catch(e) {}
        const div = document.createElement('div');
        div.className = 'photo-thumb';
        div.innerHTML = `
          <img src="${window.config.photoApiUrl}/uploads/${photo.filename}" alt="Foto" />
          <div class="photo-actions">
            <button onclick="likePhoto('${photo.id}')">❤️ <span id="like-count-${photo.id}">${photo.likes||0}</span></button>
            <button onclick="showComments('${photo.id}')">💬</button>
            <button class="fav-btn" onclick="toggleFavorite('${photo.id}','${photo.filename}')">
              <span id="fav-icon-${photo.id}">${isFav ? '💖' : '🤍'}</span>
            </button>
          </div>
          <div class="comments" id="comments-${photo.id}" style="display:none;"></div>
        `;
        grid.appendChild(div);
      });
    });
}

function updateLocalFavorites(photoFilename, add) {
  let favs = [];
  try { favs = JSON.parse(localStorage.getItem('mediamatch_favorites')||'[]'); } catch(e){}
  if (add && !favs.includes(photoFilename)) favs.push(photoFilename);
  if (!add) favs = favs.filter(f=>f!==photoFilename);
  localStorage.setItem('mediamatch_favorites', JSON.stringify(favs));
}

function toggleFavorite(photoId, photoFilename) {
  const userId = localStorage.getItem('mediamatch_userid') || 'anon';
  let favs = [];
  try { favs = JSON.parse(localStorage.getItem('mediamatch_favorites')||'[]'); } catch(e){}
  const isFav = favs.includes(photoFilename);
  fetch(window.config.photoApiUrl + '/api/photos/' + photoId + '/favorite', {
    method: isFav ? 'DELETE' : 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ userId })
  }).then(res=>res.json()).then(() => {
    updateLocalFavorites(photoFilename, !isFav);
    document.getElementById('fav-icon-' + photoId).textContent = !isFav ? '💖' : '🤍';
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
  const userId = localStorage.getItem('mediamatch_userid') || 'anon';
  fetch(window.config.photoApiUrl + '/api/photos/' + photoId + '/like', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ userId })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById('like-count-' + photoId).textContent = data.likes;
      loadGallery(); // refresh voor sortering
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
      let html = '<ul>' + (data.comments||[]).map(c=>`<li><b>${c.user}:</b> ${c.text}</li>`).join('') + '</ul>';
      // Check usertype
      const userType = localStorage.getItem('mediamatch_usertype') || 'free';
      if (userType === 'pro' || userType === 'premium') {
        html += `<form onsubmit="postComment('${photoId}', this); return false;">
          <input name="comment" placeholder="Jouw reactie..." required />
          <button type="submit">Plaatsen</button>
        </form>`;
      } else {
        html += '<div class="comment-warning">Alleen pro/premium gebruikers mogen reageren.</div>';
      }
      el.innerHTML = html;
      el.style.display = 'block';
    });
}

function postComment(photoId, form) {
  const comment = form.comment.value;
  const userId = localStorage.getItem('mediamatch_userid') || 'anon';
  fetch(window.config.photoApiUrl + '/api/photos/' + photoId + '/comments', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ text: comment, userId })
  })
    .then(res => res.json())
    .then((resp) => {
      if (resp.status === 'pending') {
        alert('Je reactie is verstuurd en wacht op goedkeuring.');
      }
      showComments(photoId);
    });
}

// Init
loadGallery('all');
