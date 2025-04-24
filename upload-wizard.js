// upload-wizard.js
// Stap-voor-stap upload wizard met gratis AI (ml5.js) en OCR (tesseract.js)
document.addEventListener('DOMContentLoaded', () => {
  // Wizard state
  let currentStep = 1;
  let photoFiles = [];
  let photoMeta = [];
  let currentPhotoIdx = 0;
  let aiModel = null;
  let ocrResult = null;
  let planLimit = 3; // default, wordt dynamisch opgehaald
  let maxFiles = 8; // default, wordt dynamisch bepaald

  // Elementen
  const steps = [
    document.getElementById('step-1'),
    document.getElementById('step-2'),
    document.getElementById('step-3'),
    document.getElementById('step-4'),
    document.getElementById('step-5')
  ];
  const progress = document.getElementById('wizardProgress');
  const form = document.getElementById('uploadWizardForm');
  const photographerNameInput = document.getElementById('photographerName');
  const albumNameInput = document.getElementById('albumName');
  const albumDescriptionInput = document.getElementById('albumDescription');
  const albumCoverInput = document.getElementById('albumCover');
  const albumLimitInfo = document.getElementById('albumLimitInfo');
  const photoInput = document.getElementById('photoFiles');
  const photoPreviews = document.getElementById('photoPreviews');
  const fileLimitInfo = document.getElementById('fileLimitInfo');
  const toStep2Btn = document.getElementById('toStep2');
  const toStep3Btn = document.getElementById('toStep3');
  const currentPhotoPreview = document.getElementById('currentPhotoPreview');
  const aiSuggestionBox = document.getElementById('aiSuggestionBox');
  const aiSuggestBtn = document.getElementById('aiSuggestBtn');
  const photoTitleInput = document.getElementById('photoTitle');
  const photoDescriptionInput = document.getElementById('photoDescription');
  const nextPhotoBtn = document.getElementById('nextPhotoBtn');
  const portraitFormInput = document.getElementById('portraitForm');
  const checkPortraitFormBtn = document.getElementById('checkPortraitFormBtn');
  const ocrStatus = document.getElementById('ocrStatus');
  const toStep5Btn = document.getElementById('toStep5');
  const termsCheck = document.getElementById('termsCheck');
  const aiCheck = document.getElementById('aiCheck');
  const trainCheck = document.getElementById('trainCheck');
  const uploadBtn = document.getElementById('uploadBtn');
  const confettiCanvas = document.getElementById('confettiCanvas');

  // Progress dots
  function updateProgress() {
    progress.innerHTML = '';
    for (let i = 1; i <= steps.length; i++) {
      const dot = document.createElement('div');
      dot.className = 'wizard-dot' + (i === currentStep ? ' active' : '');
      progress.appendChild(dot);
    }
  }

  function showStep(n) {
    steps.forEach((step, idx) => step.classList.toggle('active', idx === n-1));
    currentStep = n;
    updateProgress();
  }

  // --- Stap 1: Fotograaf-naam & album ---
  toStep2Btn.onclick = async () => {
    if (photographerNameInput.value.trim().length < 2) {
      photographerNameInput.classList.add('ai-animated');
      setTimeout(() => photographerNameInput.classList.remove('ai-animated'), 800);
      photographerNameInput.focus();
      return;
    }
    if (albumNameInput.value.trim().length < 2) {
      albumNameInput.classList.add('ai-animated');
      setTimeout(() => albumNameInput.classList.remove('ai-animated'), 800);
      albumNameInput.focus();
      return;
    }
    // Check album limiet via API
    try {
      const res = await fetch(`${window.config.apiUrl}/api/user-albums?photographer=${encodeURIComponent(photographerNameInput.value)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        const plan = data.plan || 'free';
        const maxAlbums = plan === 'pro' ? 25 : plan === 'unlimited' ? 99999 : 5;
        if (data.albums && data.albums.includes(albumNameInput.value.trim())) {
          albumLimitInfo.textContent = 'Je hebt al een album met deze naam. Kies een andere naam of verwijder een album.';
          albumNameInput.classList.add('ai-animated');
          setTimeout(() => albumNameInput.classList.remove('ai-animated'), 800);
          albumNameInput.focus();
          return;
        }
        if (data.albums && data.albums.length >= maxAlbums) {
          albumLimitInfo.textContent = `Je hebt het maximum aantal albums (${maxAlbums}) bereikt voor jouw abonnement.`;
          albumNameInput.classList.add('ai-animated');
          setTimeout(() => albumNameInput.classList.remove('ai-animated'), 800);
          albumNameInput.focus();
          return;
        }
        albumLimitInfo.textContent = '';
      }
    } catch (e) {
      albumLimitInfo.textContent = 'Kan albumlimiet niet controleren.';
    }
    showStep(2);
  };

  // --- Stap 2: Bestanden kiezen ---
  async function getUserUploadLimit() {
    // Simuleer API-call (vervang door echte fetch als nodig)
    // Hier kun je eventueel window.config.apiUrl gebruiken
    // Voor nu: Free=3, Pro=10, Unlimited=50
    // TODO: haal plan uit API
    planLimit = 3; // default, kan dynamisch
    maxFiles = planLimit + 5;
    fileLimitInfo.textContent = `Je mag maximaal ${planLimit} foto's per maand uploaden met jouw abonnement (+5 extra toegestaan per upload).`;
  }
  getUserUploadLimit();

  photoInput.addEventListener('change', () => {
    photoFiles = Array.from(photoInput.files);
    if (photoFiles.length > maxFiles) {
      fileLimitInfo.textContent = `Je mag maximaal ${maxFiles} foto's tegelijk uploaden.`;
      photoInput.value = '';
      photoPreviews.innerHTML = '';
      toStep3Btn.disabled = true;
      return;
    }
    photoPreviews.innerHTML = '';
    photoMeta = photoFiles.map(() => ({ title: '', description: '', ai: null }));
    photoFiles.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'photo-preview fade-in';
        img.style.maxWidth = '140px';
        img.style.margin = '0.5rem';
        photoPreviews.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
    toStep3Btn.disabled = photoFiles.length === 0;
  });

  toStep3Btn.onclick = () => {
    if (photoFiles.length === 0) return;
    currentPhotoIdx = 0;
    showPhotoStep();
    showStep(3);
  };

  // --- Stap 3: Per foto wizard ---
  function showPhotoStep() {
    if (!photoFiles[currentPhotoIdx]) return;
    const file = photoFiles[currentPhotoIdx];
    const reader = new FileReader();
    reader.onload = (e) => {
      currentPhotoPreview.src = e.target.result;
    };
    reader.readAsDataURL(file);
    // Reset velden
    photoTitleInput.value = photoMeta[currentPhotoIdx].title || '';
    photoDescriptionInput.value = photoMeta[currentPhotoIdx].description || '';
    aiSuggestionBox.style.display = 'none';
    aiSuggestBtn.disabled = true;
    aiSuggestionBox.innerHTML = 'AI suggesties worden geladen...';
    // AI suggesties ophalen
    getAiSuggestions(file, currentPhotoIdx);
  }

  function getAiSuggestions(file, idx) {
    // Gebruik ml5.js imageClassifier (MobileNet)
    if (!window.ml5) {
      aiSuggestionBox.innerHTML = 'AI niet beschikbaar.';
      aiSuggestBtn.disabled = true;
      return;
    }
    aiSuggestionBox.style.display = 'block';
    aiSuggestBtn.disabled = true;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.src = e.target.result;
      img.onload = () => {
        if (!aiModel) {
          window.ml5.imageClassifier('MobileNet', () => {
            aiModel = this;
            classifyImage(img, idx);
          });
        } else {
          classifyImage(img, idx);
        }
      };
    };
    reader.readAsDataURL(file);
  }
  function classifyImage(img, idx) {
    aiModel.classify(img, (err, results) => {
      if (err || !results || !results.length) {
        aiSuggestionBox.innerHTML = 'Geen AI suggesties gevonden.';
        aiSuggestBtn.disabled = true;
        return;
      }
      // Suggestie: hoogste label als titel, rest als beschrijving
      const top = results[0].label;
      const desc = results.slice(0, 3).map(r => r.label).join(', ');
      aiSuggestionBox.innerHTML = `<strong>AI suggestie:</strong><br>Titel: <em>${top}</em><br>Beschrijving: <em>${desc}</em>`;
      aiSuggestionBox.style.display = 'block';
      aiSuggestBtn.disabled = false;
      photoMeta[idx].ai = { title: top, description: desc };
    });
  }
  aiSuggestBtn.onclick = () => {
    const ai = photoMeta[currentPhotoIdx].ai;
    if (!ai) return;
    photoTitleInput.value = ai.title;
    photoDescriptionInput.value = ai.description;
    photoTitleInput.classList.add('ai-animated');
    photoDescriptionInput.classList.add('ai-animated');
    setTimeout(() => {
      photoTitleInput.classList.remove('ai-animated');
      photoDescriptionInput.classList.remove('ai-animated');
    }, 900);
  };
  nextPhotoBtn.onclick = () => {
    // Sla huidige titel/omschrijving op
    photoMeta[currentPhotoIdx].title = photoTitleInput.value;
    photoMeta[currentPhotoIdx].description = photoDescriptionInput.value;
    // Volgende foto of door naar portretrechten
    if (currentPhotoIdx < photoFiles.length - 1) {
      currentPhotoIdx++;
      showPhotoStep();
    } else {
      showStep(4);
    }
  };

  // --- Stap 4: Portretrechten-formulier ---
  checkPortraitFormBtn.onclick = () => {
    const file = portraitFormInput.files[0];
    if (!file) {
      ocrStatus.textContent = 'Upload eerst een formulier.';
      return;
    }
    ocrStatus.textContent = 'AI controleert formulier...';
    // OCR met tesseract.js
    window.Tesseract.recognize(file, 'nld')
      .then(({ data: { text } }) => {
        ocrResult = text;
        // Simpele check op trefwoorden
        const lower = text.toLowerCase();
        const hasToestemming = lower.includes('toestemming');
        const hasNaam = lower.includes('naam');
        const hasHandtekening = lower.includes('handtekening');
        if (hasToestemming && hasNaam && hasHandtekening) {
          ocrStatus.textContent = 'Formulier lijkt geldig!';
          toStep5Btn.disabled = false;
        } else {
          ocrStatus.textContent = 'Formulier mist belangrijke onderdelen. Wordt doorgestuurd voor admin-check.';
          toStep5Btn.disabled = false;
        }
      })
      .catch(() => {
        ocrStatus.textContent = 'AI kon het formulier niet lezen. Probeer een andere scan of neem contact op.';
        toStep5Btn.disabled = false;
      });
  };
  toStep5Btn.onclick = () => showStep(5);

  // --- Stap 5: Akkoord-checkboxen ---
  function checkAgreements() {
    uploadBtn.disabled = !(termsCheck.checked && aiCheck.checked);
  }
  termsCheck.onchange = aiCheck.onchange = checkAgreements;
  // Optioneel: trainCheck

  // --- Uploaden ---
  form.onsubmit = async (e) => {
    e.preventDefault();
    uploadBtn.disabled = true;
    // Verzamel alles
    const data = new FormData();
    data.append('photographerName', photographerNameInput.value);
    data.append('albumName', albumNameInput.value);
    data.append('albumDescription', albumDescriptionInput.value);
    if (albumCoverInput.files[0]) data.append('albumCover', albumCoverInput.files[0]);
    photoFiles.forEach((file, idx) => {
      data.append('photo', file);
      data.append(`title_${idx}`, photoMeta[idx].title);
      data.append(`description_${idx}`, photoMeta[idx].description);
    });
    data.append('portrait_form', portraitFormInput.files[0]);
    data.append('ocr_result', ocrResult || '');
    data.append('ai_train', trainCheck.checked ? 'yes' : 'no');
    // Upload
    try {
      const res = await fetch(`${window.config.apiUrl}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: data
      });
      if (res.ok) {
        showConfetti();
        setTimeout(() => window.location.href = 'gallery.html', 1800);
      } else {
        uploadBtn.disabled = false;
        alert('Upload mislukt. Controleer je gegevens en probeer opnieuw.');
      }
    } catch (err) {
      uploadBtn.disabled = false;
      alert('Upload mislukt. Controleer je verbinding.');
    }
  };

  // Confetti animatie
  function showConfetti() {
    confettiCanvas.style.display = 'block';
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = confettiCanvas.offsetWidth;
    confettiCanvas.height = confettiCanvas.offsetHeight;
    let pieces = Array.from({length: 80}, () => ({
      x: Math.random()*confettiCanvas.width,
      y: Math.random()*confettiCanvas.height,
      r: Math.random()*8+4,
      c: `hsl(${Math.random()*360},80%,60%)`,
      v: Math.random()*2+1
    }));
    let frame = 0;
    function draw() {
      ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
      pieces.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2*Math.PI);
        ctx.fillStyle = p.c;
        ctx.fill();
        p.y += p.v;
        if (p.y > confettiCanvas.height) p.y = -10;
      });
      frame++;
      if (frame < 60) requestAnimationFrame(draw);
      else confettiCanvas.style.display = 'none';
    }
    draw();
  }

  // Init
  showStep(1);
});
