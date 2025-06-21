// auth.js - frontend authenticatie

function openModal(type) {
  document.getElementById(type + '-modal').classList.remove('hidden');
}
function closeModal(type) {
  document.getElementById(type + '-modal').classList.add('hidden');
}

async function submitLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  // TODO: Vervang url door juiste backend endpoint
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (res.ok) {
    alert('Inloggen gelukt!');
    closeModal('login');
    // TODO: Token opslaan en doorsturen naar dashboard
  } else {
    alert('Inloggen mislukt!');
  }
}

async function submitRegister(event) {
  event.preventDefault();
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  // TODO: Vervang url door juiste backend endpoint
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (res.ok) {
    alert('Registratie gelukt! Log nu in.');
    closeModal('register');
  } else {
    alert('Registratie mislukt!');
  }
}
