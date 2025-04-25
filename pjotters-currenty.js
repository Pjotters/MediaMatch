// Pjotters-Currenty: fictief geld & games systeem
// Werkt samen met MediaMatch-accounts (zelfde localStorage user)

const saldoSpan = document.getElementById('saldo');
const leaderboardDiv = document.getElementById('leaderboard');
const upgradeBtns = document.querySelectorAll('.abo-upgrade-btn');

// Simpele storage (kan later naar backend)
function getUser() {
  return localStorage.getItem('userEmail') || 'Gast';
}
function getPjotters() {
  return parseInt(localStorage.getItem('pjotters_' + getUser()) || '0', 10);
}
function setPjotters(amount) {
  localStorage.setItem('pjotters_' + getUser(), amount);
}
function addPjotters(amount) {
  setPjotters(getPjotters() + amount);
  renderSaldo();
  updateLeaderboard();
}
function renderSaldo() {
  saldoSpan.textContent = getPjotters();
}

// Upgrade logica
upgradeBtns.forEach(btn => {
  btn.onclick = () => {
    const type = btn.dataset.type;
    if (getPjotters() >= 10000) {
      setPjotters(getPjotters() - 10000);
      localStorage.setItem('currenty_' + type + '_' + getUser(), 'active');
      alert('Gefeliciteerd! Je hebt het Currenty-abonnement voor ' + type + ' geactiveerd met 10.000 pjotters.');
      renderSaldo();
      updateLeaderboard();
    } else if (confirm('Niet genoeg pjotters! Wil je upgraden voor €4,99 per maand?')) {
      // Simuleer betaalde upgrade
      localStorage.setItem('currenty_' + type + '_' + getUser(), 'active');
      alert('Gefeliciteerd! Je hebt het Currenty-abonnement voor ' + type + ' geactiveerd via betaling.');
    }
  };
});

// Dummy games
window.startQuiz = function() {
  const vraag = prompt('Hoeveel is 5 + 7?');
  if (vraag && vraag.trim() === '12') {
    addPjotters(500);
    alert('Goed! Je wint 500 pjotters.');
  } else {
    alert('Helaas, geen pjotters deze ronde.');
  }
};
window.startMemory = function() {
  alert('Memory-game volgt binnenkort! (Test: je krijgt nu 100 pjotters)');
  addPjotters(100);
};

// Leaderboard
function updateLeaderboard() {
  // Simpel: scan alle localStorage keys
  let users = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('pjotters_')) {
      const user = key.replace('pjotters_', '');
      users.push({ user, saldo: parseInt(localStorage.getItem(key), 10) });
    }
  }
  users = users.filter(u => u.saldo > 0).sort((a, b) => b.saldo - a.saldo).slice(0, 10);
  leaderboardDiv.innerHTML = users.length === 0 ? '<em>Nog geen spelers.</em>' :
    '<ol>' + users.map(u => `<li>${u.user}: <span style="color:#ffd700;">${u.saldo} pjotters</span></li>`).join('') + '</ol>';
}

renderSaldo();
updateLeaderboard();
