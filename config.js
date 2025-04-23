// config.js
const config = {
  apiUrl: window.location.hostname === 'localhost' ? '' : 'https://graduated-excited-adopted-beans.trycloudflare.com'
};

// Maak config globaal beschikbaar
window.config = config;