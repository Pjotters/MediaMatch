// chat-fotograaf.js
// Simpele chat met foto-upload (lage kwaliteit voor chat, modern UI)
document.addEventListener('DOMContentLoaded', () => {
  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatPhotoInput = document.getElementById('chatPhotoInput');
  const chatPhotoPreview = document.getElementById('chatPhotoPreview');
  let photoBlob = null;

  // Laden van bestaande berichten (dummy, later via backend)
  async function loadMessages() {
    // TODO: haal echte berichten op via API
    chatMessages.innerHTML = '';
    // Dummy voorbeeld
    const dummy = [
      { sender: 'user', text: 'Hallo fotograaf!', photo: null },
      { sender: 'fotograaf', text: 'Hoi! Welke foto zoek je?', photo: null }
    ];
    dummy.forEach(msg => addMessage(msg));
  }

  function addMessage({ sender, text, photo }) {
    const div = document.createElement('div');
    div.className = 'chat-message ' + sender;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;
    div.appendChild(bubble);
    if (photo) {
      const img = document.createElement('img');
      img.src = photo;
      img.className = 'chat-photo-thumb';
      div.appendChild(img);
    }
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  chatPhotoInput.addEventListener('change', () => {
    const file = chatPhotoInput.files[0];
    if (!file) {
      chatPhotoPreview.style.display = 'none';
      photoBlob = null;
      return;
    }
    // Maak lage kwaliteit preview (canvas resize)
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new window.Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        const maxW = 200, maxH = 120;
        let w = img.width, h = img.height;
        if (w > maxW) { h = h * (maxW / w); w = maxW; }
        if (h > maxH) { w = w * (maxH / h); h = maxH; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(blob => {
          photoBlob = blob;
          chatPhotoPreview.src = canvas.toDataURL('image/jpeg', 0.5);
          chatPhotoPreview.style.display = 'block';
        }, 'image/jpeg', 0.5);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  chatForm.onsubmit = async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text && !photoBlob) return;
    // Verstuur bericht naar backend (TODO)
    addMessage({ sender: 'user', text, photo: photoBlob ? chatPhotoPreview.src : null });
    chatInput.value = '';
    chatPhotoInput.value = '';
    chatPhotoPreview.style.display = 'none';
    photoBlob = null;
    // TODO: POST naar backend
  };

  loadMessages();
});
