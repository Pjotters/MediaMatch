// login.js - Login via MusicMedia API
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(loginForm));
  fetch(window.config.authApiUrl + '/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(result => {
      if(result.token){
        localStorage.setItem('mediamatch_token', result.token);
        window.location.href = 'home.html';
      }else{
        document.getElementById('loginStatus').textContent = result.error || 'Login mislukt';
      }
    });
});
