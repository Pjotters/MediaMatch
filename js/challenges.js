// challenges.js - frontend logica voor fotowedstrijden & challenges
const API = window.config.photoApiUrl;
const challengesContainer = document.getElementById('challengesContainer');
const challengeDetail = document.getElementById('challengeDetail');
const newChallengeBtn = document.getElementById('newChallengeBtn');
const newChallengeForm = document.getElementById('newChallengeForm');
const challengeForm = document.getElementById('challengeForm');

function getUserInfo() {
  return {
    userId: localStorage.getItem('mediamatch_userid') || 'anon',
    userType: localStorage.getItem('mediamatch_usertype') || 'free',
    naam: localStorage.getItem('mediamatch_naam') || 'Gebruiker',
    verified: localStorage.getItem('mediamatch_verified') === 'true'
  };
}

function loadChallenges() {
  fetch(`${API}/api/challenges`).then(r=>r.json()).then(data=>{
    if (!data.challenges.length) {
      challengesContainer.innerHTML = '<em>Geen challenges gevonden.</em>';
      return;
    }
    challengesContainer.innerHTML = '<ul>' + data.challenges.map(ch=>
      `<li><b>${ch.title}</b> (t/m ${ch.deadline})<br>
        <button onclick="showChallenge(${ch.id})">Bekijk</button>
        ${ch.winner ? `<span class='winner-badge'>Winnaar gekozen!</span>` : ''}
      </li>`
    ).join('') + '</ul>';
  });
}

window.showChallenge = function(id) {
  fetch(`${API}/api/challenges`).then(r=>r.json()).then(data=>{
    const ch = data.challenges.find(c=>c.id==id);
    if (!ch) return;
    let html = `<h2>${ch.title}</h2><p>${ch.description}</p><p>Deadline: ${ch.deadline}</p>`;
    if (ch.winner) html += `<div class='winner-badge'>Winnaar: Foto #${ch.winner}</div>`;
    html += `<h3>Ingestuurde foto's</h3><div id='challengePhotos'>Laden...</div>`;
    // Foto's laden
    fetch(`${API}/api/challenges/${id}/photos`).then(r=>r.json()).then(pdata=>{
      let photosHtml = '';
      if (!pdata.photos.length) {
        photosHtml = '<em>Nog geen inzendingen.</em>';
      } else {
        photosHtml = '<ul>' + pdata.photos.map(p=>
          `<li>Foto #${p.photoId} door gebruiker ${p.userId}
            <button onclick="votePhoto(${id},${p.photoId})">Stem</button>
            ${ch.winner===p.photoId?'<span class="winner-badge">Winnaar</span>':''}
          </li>`
        ).join('') + '</ul>';
      }
      document.getElementById('challengePhotos').innerHTML = photosHtml;
    });
    // Insturen formulier
    html += `<h3>Meedoen</h3><form id='submitPhotoForm'>
      <input type='number' min='1' placeholder='Foto ID' id='submitPhotoId' required>
      <button type='submit'>Insturen</button>
    </form>`;
    // Admin: winnaar aanwijzen
    const { verified } = getUserInfo();
    if (verified) {
      html += `<h3>Winnaar aanwijzen</h3><form id='winnerForm'>
        <input type='number' min='1' placeholder='Winnende Foto ID' id='winnerPhotoId' required>
        <button type='submit'>Winnaar instellen</button>
      </form>`;
    }
    html += `<button onclick="closeChallengeDetail()">Terug</button>`;
    challengeDetail.innerHTML = html;
    challengeDetail.style.display = 'block';
    document.getElementById('submitPhotoForm').onsubmit = function(e) {
      e.preventDefault();
      const photoId = document.getElementById('submitPhotoId').value;
      const { userId } = getUserInfo();
      fetch(`${API}/api/challenges/${id}/submit`,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ userId, photoId })
      }).then(()=>showChallenge(id));
    };
    if (verified && document.getElementById('winnerForm')) {
      document.getElementById('winnerForm').onsubmit = function(e) {
        e.preventDefault();
        const photoId = document.getElementById('winnerPhotoId').value;
        const { userId } = getUserInfo();
        fetch(`${API}/api/challenges/${id}/winner`,{
          method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({ photoId, adminId: userId })
        }).then(()=>showChallenge(id));
      };
    }
  });
};
window.closeChallengeDetail = function() {
  challengeDetail.style.display = 'none';
  loadChallenges();
};
window.votePhoto = function(challengeId, photoId) {
  const { userId } = getUserInfo();
  fetch(`${API}/api/challenges/${challengeId}/vote`,{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({ userId, photoId })
  }).then(()=>showChallenge(challengeId));
};

// Nieuwe challenge aanmaken (pro/premium)
const { userType } = getUserInfo();
if (userType==='pro'||userType==='premium') {
  newChallengeBtn.style.display = '';
}
newChallengeBtn.onclick = function() {
  newChallengeForm.style.display = '';
  newChallengeBtn.style.display = 'none';
};
document.getElementById('cancelNewChallenge').onclick = function() {
  newChallengeForm.style.display = 'none';
  newChallengeBtn.style.display = '';
};
challengeForm.onsubmit = function(e) {
  e.preventDefault();
  const { userId } = getUserInfo();
  const title = document.getElementById('challengeTitle').value;
  const description = document.getElementById('challengeDesc').value;
  const deadline = document.getElementById('challengeDeadline').value;
  fetch(`${API}/api/challenges`,{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({ userId, title, description, deadline })
  }).then(()=>{
    newChallengeForm.style.display = 'none';
    newChallengeBtn.style.display = '';
    loadChallenges();
  });
};

document.addEventListener('DOMContentLoaded', loadChallenges);
