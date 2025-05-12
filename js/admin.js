// admin.js - beheer Pjotters-Verified & abonnementen
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
