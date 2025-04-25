// register-plans.js
// Interactieve logica voor rol- en abonnementenkeuze op de register pagina

const PRICING_GROUPS = {
  artiest: {
    label: 'Artiest',
    tiers: [
      { key: 'basis', label: 'Basis', price: '€0,00', icon: '🟢' },
      { key: 'pjotters', label: 'Pjotters-Currenty', price: '10.000 pjotters', icon: '💰' },
      { key: 'plus', label: 'Plus', price: '€4,99', icon: '✨' },
      { key: 'pro', label: 'Pro', price: '€14,99', icon: '🚀' },
      { key: 'premium', label: 'Premium', price: '€29,99', icon: '👑' }
    ]
  },
  fotograaf: {
    label: 'Fotograaf',
    tiers: [
      { key: 'basis', label: 'Basis', price: '€0,00', icon: '🟢' },
      { key: 'pjotters', label: 'Pjotters-Currenty', price: '10.000 pjotters', icon: '💰' },
      { key: 'plus', label: 'Plus', price: '€4,99', icon: '✨' },
      { key: 'pro', label: 'Pro', price: '€14,99', icon: '🚀' },
      { key: 'premium', label: 'Premium', price: '€29,99', icon: '👑' }
    ]
  },
  musicai: {
    label: 'Music AI',
    tiers: [
      { key: 'basis', label: 'Basis', price: '€0,00', icon: '🟢' },
      { key: 'pjotters', label: 'Pjotters-Currenty', price: '10.000 pjotters', icon: '💰' },
      { key: 'plus', label: 'Plus', price: '€4,99', icon: '✨' },
      { key: 'pro', label: 'Pro', price: '€14,99', icon: '🚀' },
      { key: 'premium', label: 'Premium', price: '€29,99', icon: '👑' }
    ]
  },
  klant: {
    label: 'Klant',
    tiers: [
      { key: 'basis', label: 'Basis', price: '€0,00', icon: '🟢' },
      { key: 'pjotters', label: 'Pjotters-Currenty', price: '10.000 pjotters', icon: '💰' },
      { key: 'plus', label: 'Plus', price: '€4,99', icon: '✨' },
      { key: 'pro', label: 'Pro', price: '€14,99', icon: '🚀' },
      { key: 'premium', label: 'Premium', price: '€29,99', icon: '👑' }
    ]
  }
};

// --- Tooltip data per plan ---
const PLAN_TOOLTIPS = {
  Basis: 'Perfect om gratis te starten en kennis te maken. Bevat basisfuncties en beperkte support.',
  'Pjotters-Currenty': 'Upgrade met coins! Zelfde voordelen als gratis, maar sneller support en extra features.',
  Plus: 'Meer uploads, betere support en extra opties. Ideaal voor wie meer wil.',
  Pro: 'Voor de serieuze gebruiker: snelle support, meer vrijheid, uitgebreidere tools.',
  Premium: 'Maximaal alles: hoogste limieten, premium support, alle features zonder beperkingen.'
};

// --- Feature-lijst per plan (voorbeeld, per groep kun je uitbreiden) ---
const PLAN_FEATURES = {
  artiest: {
    basis: ['10 tracks/maand','Commercieel: 30 dagen','Royaltyvrij','Standaard support'],
    pjotters: ['10 tracks/maand','Commercieel: 30 dagen (coins)','Royaltyvrij','Snellere support'],
    plus: ['50 tracks/maand','Commercieel: 90 dagen','Royaltyvrij','Snellere support'],
    pro: ['Onbeperkt tracks','Commercieel: 1 jaar','Royaltyvrij','Premium support'],
    premium: ['Onbeperkt tracks','Commercieel: 2 jaar','Royaltyvrij','Premium support (1u)']
  },
  fotograaf: {
    basis: ['50 uploads/maand','Watermerk','Portfolio basis','Standaard support'],
    pjotters: ['50 uploads/maand','Watermerk','Portfolio basis','Snellere support'],
    plus: ['250 uploads/maand','Geen watermerk','Portfolio uitgebreid','Snellere support'],
    pro: ['Onbeperkt uploads','Geen watermerk','Portfolio pro','Premium support'],
    premium: ['Onbeperkt uploads','Geen watermerk','Portfolio premium','Premium support (1u)']
  },
  musicai: {
    basis: ['10 tracks/maand','Instrumentaal','Commercieel: 30 dagen','Standaard support'],
    pjotters: ['10 tracks/maand','Instrumentaal','Commercieel: 30 dagen (coins)','Snellere support'],
    plus: ['50 tracks/maand','Instrumentaal','Commercieel: 90 dagen','Snellere support'],
    pro: ['Onbeperkt tracks','Instrumentaal & vocals','Commercieel: 1 jaar','Premium support'],
    premium: ['Onbeperkt tracks','Instrumentaal & vocals','Commercieel: 2 jaar','Premium support (1u)']
  },
  klant: {
    basis: ['1 chat tegelijk','2 uploads/chat','Standaard kwaliteit','Standaard support'],
    pjotters: ['1 chat tegelijk','2 uploads/chat','Standaard kwaliteit','Snellere support'],
    plus: ['10 chats tegelijk','5 uploads/chat','Hoge kwaliteit','Snellere support'],
    pro: ['Onbeperkt chats','20 uploads/chat','Origineel','Premium support'],
    premium: ['Onbeperkt chats','50 uploads/chat','Origineel','Premium support (1u)']
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const roleBtns = document.querySelectorAll('.role-btn');
  const roleSelect = document.getElementById('role');
  const planGroup = document.getElementById('planGroup');
  const planOptions = document.getElementById('planOptions');
  const planSelect = document.getElementById('subscriptionType');

  function renderPlans(role) {
    planOptions.innerHTML = '';
    planSelect.innerHTML = '';
    if (!role || !PRICING_GROUPS[role]) {
      planGroup.style.display = 'none';
      planOptions.innerHTML = '';
      return;
    }
    planGroup.style.display = '';
    PRICING_GROUPS[role].tiers.forEach(tier => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'plan-btn';
      btn.innerHTML = `<span style='font-size:1.35em;'>${tier.icon}</span> <b>${tier.label}</b><br><span style='font-size:0.97em;color:#a259c6;'>${tier.price}</span><ul class='plan-features'>${PLAN_FEATURES[role][tier.key].map(f=>`<li>${f}</li>`).join('')}</ul>`;
      btn.dataset.value = tier.key;
      btn.title = PLAN_TOOLTIPS[tier.label] || '';
      btn.onmouseenter = e => showTooltipBtn(e, tier.label);
      btn.onmouseleave = hideTooltipBtn;
      btn.onfocus = e => showTooltipBtn(e, tier.label);
      btn.onblur = hideTooltipBtn;
      btn.onclick = () => {
        document.querySelectorAll('.plan-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        planSelect.value = tier.key;
        planSelect.dispatchEvent(new Event('change'));
        showPlanDetails(role, tier.key, tier.label);
      };
      planOptions.appendChild(btn);
      const opt = document.createElement('option');
      opt.value = tier.key;
      opt.textContent = tier.label;
      planSelect.appendChild(opt);
    });
    // Standaard: eerste plan geselecteerd
    planOptions.querySelector('.plan-btn').classList.add('active');
    planSelect.value = PRICING_GROUPS[role].tiers[0].key;
    planSelect.dispatchEvent(new Event('change'));
  }

  function showTooltipBtn(e, label) {
    let tooltip = document.getElementById('plan-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'plan-tooltip';
      tooltip.className = 'plan-tooltip';
      document.body.appendChild(tooltip);
    }
    tooltip.textContent = PLAN_TOOLTIPS[label];
    tooltip.style.display = 'block';
    const rect = e.currentTarget.getBoundingClientRect();
    tooltip.style.left = (rect.left + rect.width/2 - 120) + 'px';
    tooltip.style.top = (rect.top + window.scrollY - 60) + 'px';
  }
  function hideTooltipBtn() {
    const tooltip = document.getElementById('plan-tooltip');
    if (tooltip) tooltip.style.display = 'none';
  }
  function showPlanDetails(role, key, label) {
    const features = PLAN_FEATURES[role][key].map(f=>`<li>${f}</li>`).join('');
    const html = `<div class='plan-popup-bg' onclick='window.closePlanPopup()'></div><div class='plan-popup'><h2>${label}</h2><ul>${features}</ul><button onclick='window.closePlanPopup()'>Sluiten</button></div>`;
    let popup = document.getElementById('plan-popup-wrap');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'plan-popup-wrap';
      document.body.appendChild(popup);
    }
    popup.innerHTML = html;
  }
  function closePlanPopup() {
    const popup = document.getElementById('plan-popup-wrap');
    if (popup) popup.remove();
  }
  window.closePlanPopup = closePlanPopup;

  roleBtns.forEach(btn => {
    btn.onclick = () => {
      roleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      roleSelect.value = btn.dataset.role;
      renderPlans(btn.dataset.role);
    };
  });

  // Init: indien al rol geselecteerd (bijv. terug uit login)
  if (roleSelect.value) {
    renderPlans(roleSelect.value);
    document.querySelector(`.role-btn[data-role='${roleSelect.value}']`).classList.add('active');
  }

  // CSS toevoegen via JS indien niet aanwezig
  if (!document.getElementById('plan-tooltip-style')) {
    const style = document.createElement('style');
    style.id = 'plan-tooltip-style';
    style.textContent = `.plan-features { list-style:none; margin:0.7em 0 0.5em 0; padding:0; font-size:0.98em; color:#fff; }\n.plan-features li { margin-bottom:0.2em; }\n.plan-tooltip { position:absolute; background:rgba(30,20,40,0.99); color:#f5d300; padding:0.9em 1.4em; border-radius:14px; box-shadow:0 6px 24px #000b; font-size:1em; z-index:10000; pointer-events:none; transition:opacity 0.2s; min-width:180px; max-width:260px; text-align:center; }\n.plan-popup-bg { position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);z-index:9998; }\n.plan-popup { position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(30,20,40,0.99);color:#fff;padding:2.5em 2em;border-radius:18px;box-shadow:0 8px 36px #000c;z-index:9999;min-width:260px;max-width:90vw;text-align:center; }\n.plan-popup h2 { font-size:1.6em;margin-bottom:0.5em;color:#f5d300; }\n.plan-popup .price { font-size:1.2em;color:#a259c6;margin-bottom:0.7em; }\n.plan-popup ul { text-align:left; margin:1em auto 1.5em auto; display:inline-block; }\n.plan-popup button { background:#a259c6;color:#fff;border:none;border-radius:50px;padding:0.7rem 2rem;font-size:1.1rem;cursor:pointer;transition:background 0.2s; }\n.plan-popup button:hover { background:#1db954; }`;
    document.head.appendChild(style);
  }
});
