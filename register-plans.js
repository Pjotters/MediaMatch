// register-plans.js
// Dynamisch plannen tonen op basis van rolkeuze bij registratie

document.addEventListener('DOMContentLoaded', () => {
  const roleSelect = document.getElementById('role');
  const planGroup = document.getElementById('planGroup');
  const registerFields = document.getElementById('registerFields');
  let photographerPlans = [];
  let customerPlans = [];

  async function fetchPlans() {
    // Fotografen
    try {
      const res = await fetch(`${window.config.apiUrl}/api/subscription-plans`);
      photographerPlans = await res.json();
    } catch {
      photographerPlans = [
        { name: 'basic', price: 0, features: ['5 albums', 'AI titels/descripties'] },
        { name: 'pro', price: 12, features: ['25 albums', 'AI titels/descripties', 'Snellere support'] },
        { name: 'unlimited', price: 39, features: ['Onbeperkt albums', 'Premium support', 'AI features'] }
      ];
    }
    // Klanten
    try {
      const res = await fetch(`${window.config.apiUrl}/api/customer-plans`);
      customerPlans = await res.json();
    } catch {
      customerPlans = [
        { name: 'klant-basic', price: 0, features: ['Chat met 1 fotograaf', '2 foto uploads per chat'] },
        { name: 'klant-plus', price: 5, features: ['Chat met 10 fotografen', '5 foto uploads per chat'] },
        { name: 'klant-unlimited', price: 20, features: ['Onbeperkt chatten', '20 foto uploads per chat'] }
      ];
    }
  }

  function renderPlans(role) {
    let plans = role === 'fotograaf' ? photographerPlans : customerPlans;
    if (!plans.length) return;
    planGroup.innerHTML = `<label>Welk plan wilt u?</label><div class="plan-options"></div>`;
    const opts = planGroup.querySelector('.plan-options');
    plans.forEach((plan, idx) => {
      const div = document.createElement('div');
      div.className = 'plan-card';
      div.innerHTML = `
        <input type="radio" name="plan" id="plan_${role}_${idx}" value="${plan.name}" ${idx===0?'checked':''}>
        <label for="plan_${role}_${idx}">
          <strong>${plan.name.replace('klant-', '').toUpperCase()}</strong> &mdash; <span>${plan.price === 0 ? 'Gratis' : '&euro;'+plan.price+'/maand'}</span><br>
          <ul>${plan.features.map(f=>`<li>${f}</li>`).join('')}</ul>
        </label>
      `;
      opts.appendChild(div);
    });
    planGroup.style.display = '';
    registerFields.style.display = '';
  }

  roleSelect.addEventListener('change', async () => {
    if (!roleSelect.value) {
      planGroup.style.display = 'none';
      registerFields.style.display = 'none';
      return;
    }
    await fetchPlans();
    renderPlans(roleSelect.value);
  });
});
