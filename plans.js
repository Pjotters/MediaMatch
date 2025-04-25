// plans.js - alle abonnementen overzicht + verhalen
const PLANS = [
  { key: 'basis', label: 'Basis', icon: '🟢', price: '€0,00', features: ['10 tracks/maand','Commercieel: 30 dagen','Royaltyvrij','Standaard support'], story: 'Start gratis en ontdek de basis van MusicMatch.' },
  { key: 'pjotters', label: 'Pjotters-Currenty', icon: '💰', price: '10.000 pjotters', features: ['10 tracks/maand','Commercieel: 30 dagen (coins)','Royaltyvrij','Snellere support'], story: 'Upgrade met je verdiende coins! Een unieke manier om zonder geld extra voordelen te krijgen.' },
  { key: 'plus', label: 'Plus', icon: '✨', price: '€4,99', features: ['50 tracks/maand','Commercieel: 90 dagen','Royaltyvrij','Snellere support'], story: 'Meer mogelijkheden voor een klein bedrag.' },
  { key: 'pro', label: 'Pro', icon: '🚀', price: '€14,99', features: ['Onbeperkt tracks','Commercieel: 1 jaar','Royaltyvrij','Premium support'], story: 'Voor de serieuze gebruiker met extra power.' },
  { key: 'premium', label: 'Premium', icon: '👑', price: '€29,99', features: ['Onbeperkt tracks','Commercieel: 2 jaar','Royaltyvrij','Premium support (1u)'], story: 'Maximale vrijheid, support en features!' }
];
const plansGrid = document.getElementById('plansGrid');
PLANS.forEach(plan => {
  const card = document.createElement('div');
  card.className = 'plan-card';
  card.innerHTML = `<h3>${plan.icon} ${plan.label}</h3><div class='price'>${plan.price}</div><ul>${plan.features.map(f=>`<li>${f}</li>`).join('')}</ul><button class='cta' data-analytics='plan-choose-${plan.key}'>Kies ${plan.label}</button><p style='margin-top:1em;font-size:0.97em;color:#f5d300;'>${plan.story}</p>`;
  plansGrid.appendChild(card);
});
document.getElementById('pjottersStory').innerHTML = `<b>Pjotters-Currenty:</b> Een revolutionair spaarsysteem. Verdien coins door actief te zijn, en wissel ze in voor unieke voordelen. Ideaal voor wie liever niet (altijd) betaalt!`;
document.getElementById('musicMatchStory').innerHTML = `<b>MusicMatch:</b> Het platform waar artiesten, fotografen, AI en klanten samenkomen. Ontdek, deel, verkoop en creëer samen. Meer dan een marktplaats: een creatieve community!`;
// Nav injecteren
fetch('nav.html').then(r=>r.text()).then(html=>{document.getElementById('main-nav').innerHTML=html;});
