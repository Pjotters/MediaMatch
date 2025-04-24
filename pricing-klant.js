// pricing-klant.js
// Toon klant-abonnementen (pricing) dynamisch uit backend

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('pricingGrid');
  let plans = [];
  try {
    const res = await fetch(`${window.config.apiUrl}/api/customer-plans`);
    plans = await res.json();
  } catch {
    plans = [
      { name: 'klant-basic', price: 0, features: [
        'Chat met 1 fotograaf tegelijk',
        'Max. 2 foto uploads per chat',
        'Standaard support',
        'Standaard downloadkwaliteit',
        'AI-zoekhulp (basis)',
        'Moodboard maken',
        'Eenvoudig contact met fotografen',
        'Veilig & privacy-vriendelijk platform'
      ] },
      { name: 'klant-plus', price: 5, features: [
        'Chat met max. 10 fotografen',
        'Max. 5 foto uploads per chat',
        'Snellere support (binnen 24 uur)',
        'Downloaden in hogere resolutie',
        'Favorieten/fotografen opslaan',
        'Notificaties bij nieuwe uploads van favoriete fotografen',
        'Moodboard maken',
        'Privé-albums',
        'AI-zoekhulp (uitgebreid)',
        'AI-gestuurde matching met fotografen',
        'Gedeelde chatrooms',
        'Eenvoudig contact met fotografen',
        'Veilig & privacy-vriendelijk platform'
      ] },
      { name: 'klant-unlimited', price: 20, features: [
        'Onbeperkt chatten',
        'Tot 20 foto uploads per chat',
        'Premium support (binnen 4 uur)',
        'Downloaden in originele resolutie',
        'Directe download zonder watermerk',
        'Persoonlijke albums/favorieten',
        'Early access tot nieuwe functies',
        'Uitgebreide zoekfilters (AI)',
        'Privé-albums',
        'Moodboard maken',
        'AI-zoekhulp (volledig)',
        'AI-gestuurde matching met fotografen',
        'Notificaties & alerts',
        'Gedeelde chatrooms',
        'Eenvoudig contact met fotografen',
        'Veilig & privacy-vriendelijk platform',
        'Review-systeem voor fotografen'
      ] }
    ];
  }
  grid.innerHTML = '';
  plans.forEach(plan => {
    const card = document.createElement('div');
    card.className = 'pricing-card';
    card.innerHTML = `
      <div class="pricing-title">${plan.name.replace('klant-', '').toUpperCase()}</div>
      <div class="pricing-price">${plan.price === 0 ? 'Gratis' : '&euro;'+plan.price+'/maand'}</div>
      <ul class="pricing-features">
        ${plan.features.map(f => `<li>${f}</li>`).join('')}
      </ul>
      <button class="pricing-action" ${plan.price === 0 ? 'disabled' : ''}>${plan.price === 0 ? 'Actief' : 'Kies dit plan'}</button>
    `;
    grid.appendChild(card);
  });
});
