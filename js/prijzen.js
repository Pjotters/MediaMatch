// prijzen.js
// Logica voor abonnement kiezen, FAQ, factuur aanvragen, login check, etc.

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '€0',
    features: ['Max 50 foto’s', 'Publieke albums', 'Basis downloads'],
    best: false
  },
  {
    id: 'basic',
    name: 'Basic',
    price: '€4,99 / maand',
    features: ['Max 500 foto’s', 'Privé albums', 'Watermerk opties'],
    best: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '€11,99 / maand',
    features: ['Onbeperkt foto’s', 'Geavanceerde privacy', 'Gezichtsherkenning', 'Snelle support'],
    best: true // Meest gekozen
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Op aanvraag',
    features: ['Custom integraties', 'API toegang', 'SLA support'],
    best: false
  }
];

function renderPlans() {
  const plansDiv = document.getElementById('plans');
  plansDiv.innerHTML = plans.map(plan => `
    <div class="plan-card${plan.best ? ' best' : ''}" id="plan-${plan.id}">
      <div class="plan-title">${plan.name}${plan.best ? '<span class=\'badge\'>Meest gekozen</span>' : ''}</div>
      <div class="plan-price">${plan.price}</div>
      <ul class="plan-features">${plan.features.map(f => `<li>${f}</li>`).join('')}</ul>
      <button class="choose-plan-btn" data-plan="${plan.id}">${plan.id==='enterprise' ? 'Contact' : 'Kies dit plan'}</button>
    </div>
  `).join('');
}

function renderFAQ() {
  const faq = [
    {
      q: 'Welk abonnement past bij mij?',
      a: 'Beantwoord de vragen hieronder en wij adviseren je een plan.'
    },
    {
      q: 'Kan ik later upgraden?',
      a: 'Ja, upgraden of downgraden kan altijd via je dashboard.'
    },
    {
      q: 'Hoe werkt betalen?',
      a: 'Je ontvangt een factuur per e-mail. Na betaling wordt je abonnement geactiveerd.'
    },
    {
      q: 'Kan ik op factuur betalen?',
      a: 'Ja, je ontvangt altijd een factuur per e-mail.'
    }
  ];
  document.getElementById('faq-list').innerHTML = faq.map(f => `
    <li><b>${f.q}</b><br><span>${f.a}</span></li>
  `).join('');
}

function handleChoosePlan() {
  document.querySelectorAll('.choose-plan-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const plan = this.getAttribute('data-plan');
      if (plan === 'enterprise') {
        window.open('mailto:support@mediamatch.nl?subject=Enterprise aanvraag');
        return;
      }
      const token = localStorage.getItem('musicmedia_token');
      if (!token) {
        alert('Log eerst in!');
        window.location.href = 'login.html';
        return;
      }
      // Factuur aanvragen
      const res = await fetch(window.config.apiUrl + '/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ plan })
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = 'subscription-status.html';
      } else {
        alert(data.error || 'Fout bij aanvragen abonnement.');
      }
    });
  });
}

function renderPlanAdvisor() {
  // Simpele vragenlijst
  const vragen = [
    {
      q: 'Hoeveel foto’s wil je per maand uploaden?',
      options: [
        { label: 'Max 50', plan: 'starter' },
        { label: 'Tot 500', plan: 'basic' },
        { label: 'Meer dan 500', plan: 'premium' }
      ]
    },
    {
      q: 'Wil je albums privé kunnen maken?',
      options: [
        { label: 'Nee', plan: 'starter' },
        { label: 'Ja', plan: 'basic' },
        { label: 'Ja, met extra privacy', plan: 'premium' }
      ]
    },
    {
      q: 'Is gezichtsherkenning belangrijk voor jou?',
      options: [
        { label: 'Nee', plan: 'starter' },
        { label: 'Licht', plan: 'basic' },
        { label: 'Ja, essentieel', plan: 'premium' }
      ]
    }
  ];
  let answers = [];
  let step = 0;
  const advisorDiv = document.getElementById('plan-advisor');
  function showStep() {
    if (step >= vragen.length) {
      // Advies tonen
      const counts = {};
      answers.forEach(p => { counts[p] = (counts[p]||0)+1; });
      let best = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0];
      const plan = plans.find(p=>p.id===best);
      advisorDiv.innerHTML = `<div class='advies-box'>Advies: <b>${plan.name}</b><br><span class='advies-price'>${plan.price}</span><br><ul>${plan.features.map(f=>`<li>${f}</li>`).join('')}</ul><button class='choose-plan-btn' data-plan='${plan.id}'>Kies dit plan</button></div>`;
      handleChoosePlan();
      return;
    }
    const v = vragen[step];
    advisorDiv.innerHTML = `<div class='vraag-box'><b>${v.q}</b><br>${v.options.map((opt,i)=>`<button class='advisor-btn' data-plan='${opt.plan}'>${opt.label}</button>`).join('')}</div>`;
    advisorDiv.querySelectorAll('.advisor-btn').forEach(btn => {
      btn.onclick = function() {
        answers.push(this.getAttribute('data-plan'));
        step++;
        showStep();
      };
    });
  }
  showStep();
}

document.addEventListener('DOMContentLoaded', () => {
  renderPlans();
  renderFAQ();
  handleChoosePlan();
  renderPlanAdvisor();
});
