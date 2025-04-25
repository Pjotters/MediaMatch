// Toon bundels uit localStorage (demo)
function renderPricingBundels() {
  const bundels = JSON.parse(localStorage.getItem('bundels') || '[]');
  const div = document.getElementById('pricing-bundels');
  if (!bundels.length) {
    div.innerHTML = '<em>Geen bundels gevonden. Voeg ze toe via het admin dashboard.</em>';
    return;
  }
  div.innerHTML = bundels.map(b => `
    <div style='background:rgba(49,32,74,0.93);border-radius:1rem;padding:1.2rem 1.5rem;min-width:220px;box-shadow:0 2px 16px #0005;margin:1rem auto 2rem auto;max-width:350px;text-align:center;'>
      <strong>${b.naam}</strong><br>Prijs: €${b.prijs}<br>Aantal uploads: ${b.uploads}
    </div>
  `).join('');
}
renderPricingBundels();
