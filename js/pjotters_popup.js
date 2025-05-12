// Pjotters-Search popup multi-step consent
let currentStep = 0;
let userPlan = '';

function showPjottersPopup(plan) {
  userPlan = plan || '';
  currentStep = 0;
  renderPopupStep();
  document.getElementById('pjotters-popup').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closePjottersPopup() {
  document.getElementById('pjotters-popup').style.display = 'none';
  document.body.style.overflow = '';
}

function nextPopupStep() {
  currentStep++;
  renderPopupStep();
}

function renderPopupStep() {
  const popup = document.getElementById('pjotters-popup-content');
  if (!popup) return;
  if (currentStep === 0) {
    popup.innerHTML = `
      <h2>Welkom bij Pjotters-Search</h2>
      <p>Om gebruik te maken van onze service moet u met het volgende akkoord gaan:</p>
      <form id="pjotters-step1">
        <label><input type="checkbox" required> MediaMatch & de Pjotters-Company mogen uw foto opslaan (voor 30 dagen) voor verwerking.</label><br>
        <label><input type="checkbox" required> MediaMatch mag deze foto delen met partners.</label><br>
        <label><input type="checkbox" required> MediaMatch mag de "Match" gebruiken als voorbeeld voor partners van de Pjotters-Company.</label><br>
        <label><input type="checkbox" required> MediaMatch mag de "Match" gebruiken voor andere doeleinden zolang het niet de AVG-wetgeving overtreedt.</label><br>
        <button type="submit" class="btn-primary" style="margin-top:1.2em;">Akkoord & Volgende</button>
      </form>
    `;
    document.getElementById('pjotters-step1').onsubmit = function(e) {
      e.preventDefault();
      nextPopupStep();
    };
  } else if (currentStep === 1) {
    popup.innerHTML = `
      <h2>Beleid & Voorwaarden</h2>
      <form id="pjotters-step2">
        <label><input type="checkbox" required> Ik ga akkoord met het <a href='privacy.html' target='_blank'>privacybeleid</a></label><br>
        <label><input type="checkbox" required> Ik ga akkoord met de <a href='terms.html' target='_blank'>Terms of Service</a></label><br>
        <label><input type="checkbox" required> Ik ga akkoord met het <a href='pjotters-search-beleid.html' target='_blank'>Pjotters-Search beleid</a></label><br>
        <label><input type="checkbox" required> Ik ga akkoord met het beleid van de Pjotters-Company.</label><br>
        <button type="submit" class="btn-primary" style="margin-top:1.2em;">Akkoord & Volgende</button>
      </form>
    `;
    document.getElementById('pjotters-step2').onsubmit = function(e) {
      e.preventDefault();
      nextPopupStep();
    };
  } else if (currentStep === 2) {
    popup.innerHTML = `
      <h2>Testing & Analytics</h2>
      <p>Beste gebruiker, u gebruikt het <b>${userPlan || '... (onbekend)'}</b> plan.</p>
      <div id="pjotters-plan-extra"></div>
      <button type="button" onclick="nextPopupStep()" class="btn-primary" style="margin-top:1.2em;">Volgende</button>
    `;
    if (userPlan === 'Pro' || userPlan === 'Basic') {
      document.getElementById('pjotters-plan-extra').innerHTML = `
        <p>Omdat u het <b>${userPlan}</b> plan heeft, kunnen extra test- en analytische functies worden aangeboden.</p>
      `;
    }
  } else if (currentStep === 3) {
    popup.innerHTML = `
      <h2>Upload uw foto</h2>
      <form id="pjotters-upload-form" enctype="multipart/form-data">
        <input type="file" name="foto" accept="image/*" required style="margin-bottom:1em;" /><br>
        <button type="submit" class="btn-primary">Uploaden</button>
      </form>
      <div style="margin-top:1.2em;">
        <a href='voordelen.html' target='_blank' style="color:var(--accent, #e945ff);font-weight:600;">Maak persoon aan op MediaMatch (voordelen)</a>
      </div>
      <button onclick="closePjottersPopup()" class="btn-secondary" style="margin-top:1.5em;">Annuleren</button>
    `;
    document.getElementById('pjotters-upload-form').onsubmit = function(e) {
      e.preventDefault();
      // Dummy upload handler
      alert('Upload succesvol! (demo)');
      closePjottersPopup();
    };
  }
}

// Popup trigger voor "Foto's van mij"
document.addEventListener('DOMContentLoaded', function() {
  const mijBtn = Array.from(document.querySelectorAll('.album-btn')).find(btn => btn.dataset.album === 'mij');
  if (mijBtn) {
    mijBtn.addEventListener('click', function(e) {
      // Haal het user plan op uit backend indien beschikbaar, anders leeg laten
      let plan = '';
      if (window.getUserPlan) {
        plan = window.getUserPlan();
      }
      showPjottersPopup(plan);
    });
  }

  // Sluit popup bij overlay klik
  const overlay = document.getElementById('pjotters-popup');
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closePjottersPopup();
    });
  }
});
