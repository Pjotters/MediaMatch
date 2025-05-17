// admin.js - beheer Pjotters-Verified & abonnementen + moderatie
const API = window.config.photoApiUrl;
const searchUser = document.getElementById('searchUser');
const findUserBtn = document.getElementById('findUserBtn');
const userResult = document.getElementById('userResult');
const editSection = document.getElementById('editSection');
const editUserForm = document.getElementById('editUserForm');
const editNaam = document.getElementById('editNaam');
const editEmail = document.getElementById('editEmail');
const editPlan = document.getElementById('editPlan');
const editVerified = document.getElementById('editVerified');
const pendingComments = document.getElementById('pendingComments');

function loadPendingComments() {
  fetch(`${API}/api/moderation/comments/pending`)
    .then(res=>res.json())
    .then(data=>{
      if (!data.pending || !data.pending.length) {
        pendingComments.innerHTML = '<em>Geen reacties te modereren.</em>';
        return;
      }
      let html = '<table class="pending-table"><tr><th>Foto ID</th><th>Gebruiker</th><th>Reactie</th><th>Actie</th></tr>';
      data.pending.forEach((c,i) => {
        html += `<tr><td>${c.photoId}</td><td>${c.user}</td><td>${c.text}</td><td>
          <button onclick="approveComment('${c.photoId}',${c.commentIndex})">Goedkeuren</button>
          <button onclick="deleteComment('${c.photoId}',${c.commentIndex})">Verwijder</button></td></tr>`;
      });
      html += '</table>';
      pendingComments.innerHTML = html;
    });
}

window.approveComment = function(photoId, commentIndex) {
  fetch(`${API}/api/moderation/comments/approve`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ photoId: Number(photoId), commentIndex })
  }).then(()=>loadPendingComments());
}
window.deleteComment = function(photoId, commentIndex) {
  fetch(`${API}/api/moderation/comments/delete`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ photoId: Number(photoId), commentIndex })
  }).then(()=>loadPendingComments());
}

document.addEventListener('DOMContentLoaded', loadPendingComments);

findUserBtn.onclick = function() {
  const userId = searchUser.value.trim();
  if (!userId) return;
  fetch(`${API}/api/account?userId=${encodeURIComponent(userId)}`)
    .then(r=>r.json()).then(u=>{
      if (!u) return userResult.textContent = 'Niet gevonden.';
      editSection.style.display = 'block';
      editNaam.value = u.naam||'';
      editEmail.value = u.email||'';
      editPlan.value = u.plan||'free';
      editVerified.checked = !!u.verified;
      userResult.innerHTML = `<b>Gevonden:</b> ${u.naam||''} (${userId})<br>Plan: ${u.plan||'free'}<br>Verified: ${u.verified?'✔️':'Nee'}`;
      editUserForm.dataset.userid = userId;
    });
};

editUserForm.onsubmit = function(e) {
  e.preventDefault();
  const userId = editUserForm.dataset.userid;
  fetch(`${API}/api/account`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      userId,
      naam: editNaam.value,
      email: editEmail.value
    })
  });
  fetch(`${API}/api/admin/setplan`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({userId,plan:editPlan.value})
  });
  fetch(`${API}/api/admin/setbadge`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({userId,verified:editVerified.checked})
  }).then(()=>alert('Account bijgewerkt!'));
};
