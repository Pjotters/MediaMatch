// theme-toggle.js
(function(){
  const root = document.documentElement;
  const themeIcon = document.querySelector('.theme-icon');
  let dark = true;

  function setTheme(darkMode) {
    dark = darkMode;
    if (dark) {
      root.setAttribute('data-theme', 'dark');
      if (themeIcon) themeIcon.innerHTML = '🌙';
    } else {
      root.setAttribute('data-theme', 'light');
      if (themeIcon) themeIcon.innerHTML = '☀️';
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }

  window.toggleTheme = function() {
    setTheme(!dark);
  };

  // Init theme
  const saved = localStorage.getItem('theme');
  if (saved === 'light') setTheme(false);
  else setTheme(true);
})();
