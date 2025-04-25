// 50+ shop-items, NL + EN, inclusief upgrades voor uploadlimiet etc.
const items = [
  { naam: 'Extra upload', name: 'Extra upload', prijs: 500, price: 500, type: 'upgrade', key: 'extra_upload', uitleg: 'Verhoog je uploadlimiet met 1.' },
  { naam: 'Unieke badge', name: 'Unique badge', prijs: 2500, price: 2500, type: 'cosmetic', key: 'badge', uitleg: 'Toon een unieke badge op je profiel.' },
  { naam: 'Speciale profielfoto', name: 'Special profile pic', prijs: 1500, price: 1500, type: 'cosmetic', key: 'profilepic', uitleg: 'Ontgrendel een speciale profielfoto.' },
  { naam: '1 maand Currenty-abonnement', name: '1 month Currenty subscription', prijs: 10000, price: 10000, type: 'subscription', key: 'abo', uitleg: 'Upgrade naar Currenty-abonnement voor 1 maand.' },
  { naam: 'Boost: 2x coins 24u', name: 'Boost: 2x coins 24h', prijs: 3500, price: 3500, type: 'boost', key: 'boost', uitleg: 'Verdien 24 uur lang dubbele coins.' },
  { naam: 'Kleurthema goud', name: 'Gold theme', prijs: 3000, price: 3000, type: 'cosmetic', key: 'gold_theme', uitleg: 'Activeer een goud kleurthema.' },
  { naam: 'Chat stickerpack', name: 'Chat sticker pack', prijs: 800, price: 800, type: 'cosmetic', key: 'stickers', uitleg: 'Ontgrendel extra stickers in de chat.' },
  { naam: 'VIP-rol leaderboard', name: 'VIP leaderboard role', prijs: 7000, price: 7000, type: 'cosmetic', key: 'vip', uitleg: 'Toon VIP-status op het leaderboard.' },
  { naam: 'Gallery highlight', name: 'Gallery highlight', prijs: 2000, price: 2000, type: 'cosmetic', key: 'highlight', uitleg: 'Laat je beste foto highlighten.' },
  { naam: 'Album cover upgrade', name: 'Album cover upgrade', prijs: 1200, price: 1200, type: 'cosmetic', key: 'albumcover', uitleg: 'Upgrade je album cover.' },
  { naam: 'Uploadlimiet +10', name: 'Upload limit +10', prijs: 4000, price: 4000, type: 'upgrade', key: 'upload_limit_10', uitleg: 'Verhoog je uploadlimiet met 10.' },
  { naam: 'Max. uploads +100', name: 'Max uploads +100', prijs: 25000, price: 25000, type: 'upgrade', key: 'upload_limit_100', uitleg: 'Verhoog je max. uploads met 100.' },
  // ... meer shop-items ...
];

const shopDiv = document.getElementById('shop-items');
function renderShop() {
  shopDiv.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'abo-card';
    card.innerHTML = `<strong>${item.naam} / ${item.name}</strong><br><span style='color:#ffd700;'>${item.prijs} pjotters</span><br><small>${item.uitleg}</small><br><button class='abo-upgrade-btn'>Koop / Buy</button>`;
    card.querySelector('button').onclick = async () => {
      const ok = confirm(`Weet je zeker dat je '${item.naam}' wilt kopen voor ${item.prijs} pjotters?\nAre you sure you want to buy '${item.name}' for ${item.price} pjotters?`);
      if (!ok) return;
      const res = await fetch('/api/pjotters/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('token')||'') },
        body: JSON.stringify({ item: item.naam, price: item.prijs, key: item.key })
      });
      if (res.ok) {
        alert('Aankoop gelukt! / Purchase successful!');
      } else {
        alert('Te weinig saldo of fout bij aankoop. / Not enough coins or error.');
      }
    };
    shopDiv.appendChild(card);
  });
}
renderShop();

// Leaderboard ophalen
fetch('/api/pjotters/leaderboard').then(r=>r.json()).then(lb=>{
  document.getElementById('leaderboard').innerHTML = lb.length===0 ? '<em>Nog geen spelers.</em>' :
    '<ol>' + lb.map(u => `<li>${u.email}: <span style=\"color:#ffd700;\">${u.saldo} pjotters</span></li>`).join('') + '</ol>';
});
