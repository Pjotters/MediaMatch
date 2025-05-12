// register.js - Registratie via MusicMedia API
const regForm = document.getElementById('registerForm');
regForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(regForm));
  fetch(window.config.authApiUrl + '/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(result => {
      if(result.success){
        window.location.href = 'login.html';
      }else{
        document.getElementById('registerStatus').textContent = result.error || 'Registratie mislukt';
      }
    });
});
