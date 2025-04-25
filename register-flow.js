// register-flow.js
// Moderne, lineaire registratie-flow met glas-morf design en interactieve pricing

const PRICING_GROUPS = {
  artiest: {
    label: 'Artiest',
    tiers: [
      { key: 'basis', label: 'Basis', price: '€0,00', icon: '🟢', features: ['10 tracks/maand','Commercieel: 30 dagen','Royaltyvrij','Standaard support'] },
      { key: 'pjotters', label: 'Pjotters-Currenty', price: '10.000 pjotters', icon: '💰', features: ['10 tracks/maand','Commercieel: 30 dagen (coins)','Royaltyvrij','Snellere support'] },
      { key: 'plus', label: 'Plus', price: '€4,99', icon: '✨', features: ['50 tracks/maand','Commercieel: 90 dagen','Royaltyvrij','Snellere support'] },
      { key: 'pro', label: 'Pro', price: '€14,99', icon: '🚀', features: ['Onbeperkt tracks','Commercieel: 1 jaar','Royaltyvrij','Premium support'] },
      { key: 'premium', label: 'Premium', price: '€29,99', icon: '👑', features: ['Onbeperkt tracks','Commercieel: 2 jaar','Royaltyvrij','Premium support (1u)'] }
    ]
  },
  fotograaf: {
    label: 'Fotograaf',
    tiers: [
      { key: 'basis', label: 'Basis', price: '€0,00', icon: '🟢', features: ['50 uploads/maand','Watermerk','Portfolio basis','Standaard support'] },
      { key: 'pjotters', label: 'Pjotters-Currenty', price: '10.000 pjotters', icon: '💰', features: ['50 uploads/maand','Watermerk','Portfolio basis','Snellere support'] },
      { key: 'plus', label: 'Plus', price: '€4,99', icon: '✨', features: ['250 uploads/maand','Geen watermerk','Portfolio uitgebreid','Snellere support'] },
      { key: 'pro', label: 'Pro', price: '€14,99', icon: '🚀', features: ['Onbeperkt uploads','Geen watermerk','Portfolio pro','Premium support'] },
      { key: 'premium', label: 'Premium', price: '€29,99', icon: '👑', features: ['Onbeperkt uploads','Geen watermerk','Portfolio premium','Premium support (1u)'] }
    ]
  },
  musicai: {
    label: 'Music AI',
    tiers: [
      { key: 'basis', label: 'Basis', price: '€0,00', icon: '🟢', features: ['10 tracks/maand','Instrumentaal','Commercieel: 30 dagen','Standaard support'] },
      { key: 'pjotters', label: 'Pjotters-Currenty', price: '10.000 pjotters', icon: '💰', features: ['10 tracks/maand','Instrumentaal','Commercieel: 30 dagen (coins)','Snellere support'] },
      { key: 'plus', label: 'Plus', price: '€4,99', icon: '✨', features: ['50 tracks/maand','Instrumentaal','Commercieel: 90 dagen','Snellere support'] },
      { key: 'pro', label: 'Pro', price: '€14,99', icon: '🚀', features: ['Onbeperkt tracks','Instrumentaal & vocals','Commercieel: 1 jaar','Premium support'] },
      { key: 'premium', label: 'Premium', price: '€29,99', icon: '👑', features: ['Onbeperkt tracks','Instrumentaal & vocals','Commercieel: 2 jaar','Premium support (1u)'] }
    ]
  },
  klant: {
    label: 'Klant',
    tiers: [
      { key: 'basis', label: 'Basis', price: '€0,00', icon: '🟢', features: ['1 chat tegelijk','2 uploads/chat','Standaard kwaliteit','Standaard support'] },
      { key: 'pjotters', label: 'Pjotters-Currenty', price: '10.000 pjotters', icon: '💰', features: ['1 chat tegelijk','2 uploads/chat','Standaard kwaliteit','Snellere support'] },
      { key: 'plus', label: 'Plus', price: '€4,99', icon: '✨', features: ['10 chats tegelijk','5 uploads/chat','Hoge kwaliteit','Snellere support'] },
      { key: 'pro', label: 'Pro', price: '€14,99', icon: '🚀', features: ['Onbeperkt chats','20 uploads/chat','Origineel','Premium support'] },
      { key: 'premium', label: 'Premium', price: '€29,99', icon: '👑', features: ['Onbeperkt chats','50 uploads/chat','Origineel','Premium support (1u)'] }
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const stepRole = document.getElementById('register-step-role');
  const stepPlan = document.getElementById('register-step-plan');
  const stepForm = document.getElementById('register-step-form');
  const planCards = document.getElementById('plan-cards');
  const formRole = document.getElementById('form-role');
  const formPlan = document.getElementById('form-plan');
  const registerForm = document.getElementById('registerForm');

  // Stap 1: Rol kiezen
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.onclick = () => {
      const role = btn.getAttribute('data-role');
      formRole.value = role;
      stepRole.style.display = 'none';
      renderPlans(role);
      stepPlan.style.display = '';
      stepForm.style.display = 'none';
    };
  });

  // Stap 2: Abonnement kiezen
  function renderPlans(role) {
    planCards.innerHTML = '';
    const group = PRICING_GROUPS[role];
    if (!group) return;
    group.tiers.forEach(tier => {
      const card = document.createElement('div');
      card.className = 'card glass plan-card';
      card.innerHTML = `
        <div class="plan-header">
          <span class="plan-icon">${tier.icon}</span>
          <span class="plan-label">${tier.label}</span>
        </div>
        <div class="plan-price">${tier.price}</div>
        <ul class="plan-features">
          ${tier.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
        <button class="choose-plan-btn" data-plan="${tier.key}">Kies ${tier.label}</button>
      `;
      card.querySelector('.choose-plan-btn').onclick = () => {
        formPlan.value = tier.key;
        stepPlan.style.display = 'none';
        stepForm.style.display = '';
      };
      planCards.appendChild(card);
    });
  }

  // Stap 3: Formulier submitten (zelfde als bestaande register.js)
  registerForm.onsubmit = async (e) => {
    e.preventDefault();
    const status = document.getElementById('status');
    status.textContent = 'Bezig met registreren...';
    status.className = 'status-message loading';
    status.style.display = 'block';
    const body = {
      name: registerForm.name.value,
      email: registerForm.email.value,
      password: registerForm.password.value,
      role: formRole.value,
      subscriptionType: formPlan.value
    };
    try {
      const res = await fetch(window.config.apiUrl + '/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        status.textContent = 'Registratie gelukt! Je wordt doorgestuurd...';
        status.className = 'status-message success';
        setTimeout(()=>{ window.location.href = '/login.html'; }, 1500);
      } else {
        status.textContent = 'Fout: ' + (data.message || 'Er is iets misgegaan');
        status.className = 'status-message error';
      }
    } catch (err) {
      status.textContent = 'Netwerkfout. Probeer opnieuw.';
      status.className = 'status-message error';
    }
  };
});
