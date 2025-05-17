// hamburger.js
// Plaatst een hamburger-menu linksboven dat naar menu.html leidt

document.addEventListener('DOMContentLoaded', function() {
  // Voeg hamburger toe aan body als die nog niet bestaat
  if (!document.querySelector('.hamburger')) {
    const h = document.createElement('div');
    h.className = 'hamburger';
    h.innerHTML = '<span></span><span></span><span></span>';
    h.title = 'Menu';
    h.onclick = () => { window.location.href = 'menu.html'; };
    document.body.appendChild(h);
  }
});
