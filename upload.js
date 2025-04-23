document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#uploadForm');
    const fileInput = document.getElementById('photo');
    const imagePreview = document.getElementById('imagePreview');
    const previewContainer = document.getElementById('previewContainer');
    const previewTitle = document.getElementById('previewTitle');
    const photoLabel = document.getElementById('photoLabel');
    const statusElement = document.getElementById('status');
    const dynamicTitles = document.getElementById('dynamic-titles');
    const uploadLimitInfo = document.getElementById('upload-limit-info');
    const portraitFormInput = document.getElementById('portrait_form');
    const portraitFormLabel = document.getElementById('portraitFormLabel');
    
    // Functie om status te tonen
    function showStatus(message, type) {
        statusElement.textContent = message;
        statusElement.className = `status-message ${type}`;
        statusElement.style.display = 'block';
        
        // Automatisch verbergen na 5 seconden (behalve bij loading)
        if (type !== 'loading') {
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 5000);
        }
    }
    
    // Voorvertoning wanneer een bestand wordt geselecteerd
    fileInput.addEventListener('change', async () => {
        const files = fileInput.files;
        const limit = await getUserUploadLimit();
        uploadLimitInfo.textContent = `Je mag maximaal ${limit} foto's tegelijk uploaden met jouw abonnement.`;
        if (files.length > limit) {
            showStatus(`Je mag maximaal ${limit} foto's tegelijk uploaden met jouw abonnement.`, 'error');
            fileInput.value = '';
            dynamicTitles.innerHTML = '';
            previewContainer.innerHTML = '';
            return;
        }
        dynamicTitles.innerHTML = '';
        previewContainer.innerHTML = '';
        Array.from(files).forEach((file, idx) => {
            const div = document.createElement('div');
            div.className = 'form-group';
            div.innerHTML = `<label>Geef een titel voor foto ${idx+1}:</label><input type="text" class="form-control photo-title" name="title_${idx}" value="${file.name.replace(/\.[^/.]+$/, '')}" required>`;
            dynamicTitles.appendChild(div);
            generateAITitleAndDescription(file, idx);

            // Preview met animatie en aspect ratio
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'preview-image fade-in';
                img.onload = function() {
                    img.style.aspectRatio = img.naturalWidth + '/' + img.naturalHeight;
                };
                previewContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    });
    
    // AI: Genereer titel & beschrijving op basis van afbeelding
    async function generateAITitleAndDescription(file, idx) {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const formData = new FormData();
            formData.append('photo', file);
            const res = await fetch(`${window.config.apiUrl}/api/ai/generate-title-description`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (res.ok) {
                const data = await res.json();
                if (data.title && data.description) {
                    // Vul de velden in
                    const titleInput = document.querySelector(`input[name="title_${idx}"]`);
                    if (titleInput) titleInput.value = data.title;
                    let descInput = document.querySelector(`textarea[name="description_${idx}"]`);
                    if (!descInput) {
                        // Voeg beschrijving toe als die er nog niet is
                        const descDiv = document.createElement('div');
                        descDiv.className = 'form-group';
                        descDiv.innerHTML = `<label>Automatische beschrijving voor foto ${idx+1}:</label><textarea class="form-control photo-description" name="description_${idx}" rows="2">${data.description}</textarea>`;
                        titleInput.parentElement.after(descDiv);
                    } else {
                        descInput.value = data.description;
                    }
                }
            }
        } catch (e) {
            console.log('[AI] Kan geen titel/beschrijving genereren:', e);
        }
    }

    // Drag & drop ondersteuning
    const uploadArea = document.querySelector('.file-upload');
    if (uploadArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlight, false);
        });
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlight, false);
        });
        function highlight() {
            uploadArea.querySelector('.file-upload-label').classList.add('highlight');
        }
        function unhighlight() {
            uploadArea.querySelector('.file-upload-label').classList.remove('highlight');
        }
        uploadArea.addEventListener('drop', handleDrop, false);
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            fileInput.files = files;
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    }
    
    // Portrait form verwerking
    portraitFormInput.addEventListener('change', () => {
        const file = portraitFormInput.files[0];
        if (file) {
            portraitFormLabel.textContent = file.name;
        }
    });
    
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
        window.toggleTheme && window.toggleTheme();
    });

    // --- HIER START DE AANPASSING VOOR JWT EN UPLOAD ---
    async function getUserUploadLimit() {
        const token = localStorage.getItem('token');
        if (!token) return 3; // fallback
        try {
            const res = await fetch(`${window.config.apiUrl}/api/subscription`, {
                headers: { 'Authorization': `Bearer ${token}` },
                credentials: 'include'
            });
            const data = await res.json();
            if (data.subscription && data.subscription.type === 'pro') return 10;
            if (data.subscription && data.subscription.type === 'unlimited') return 50; // UI limiet (backend = ∞)
            return 3;
        } catch {
            return 3;
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        showStatus('Bezig met uploaden...', 'loading');
        const formData = new FormData();
        const files = fileInput.files;
        const limit = await getUserUploadLimit();
        if (files.length > limit) {
            showStatus(`Je mag maximaal ${limit} foto's tegelijk uploaden met jouw abonnement.`, 'error');
            return;
        }
        // Voeg foto's toe
        Array.from(files).forEach((file, idx) => {
            formData.append('photo', file);
            const titleInput = dynamicTitles.querySelector(`[name="title_${idx}"]`);
            formData.append(`title_${idx}`, titleInput ? titleInput.value : file.name.replace(/\.[^/.]+$/, ''));
            const descInput = dynamicTitles.querySelector(`[name="description_${idx}"]`);
            if (descInput) formData.append(`description_${idx}`, descInput.value);
        });
        // Voeg portretrechten-formulier toe
        if (portraitFormInput.files[0]) {
            formData.append('portrait_form', portraitFormInput.files[0]);
        }
        const BASE = window.config.apiUrl;
        const token = localStorage.getItem('token');
        let headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        try {
            if (!token) {
                showStatus('Je bent niet ingelogd of je sessie is verlopen. Log opnieuw in voordat je een foto uploadt.', 'error');
                return;
            }
            let res = await fetch(`${BASE}/api/upload`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
                headers
            });
            let data = await res.json();
            if (res.ok || (data && data.success)) {
                showStatus('Upload geslaagd!', 'success');
                setTimeout(() => {
                    window.location.href = '/gallery.html';
                }, 1200);
            } else {
                let foutmelding = 'Onbekende fout bij uploaden.';
                if (data && data.message) {
                    foutmelding = `Fout: ${data.message}`;
                } else if (res && res.status === 401) {
                    foutmelding = 'Niet geautoriseerd: Log opnieuw in.';
                } else if (res && res.status === 413) {
                    foutmelding = 'Bestand is te groot.';
                }
                showStatus(foutmelding, 'error');
            }
        } catch (error) {
            console.error('Upload fout:', error);
            showStatus('Netwerkfout of server niet bereikbaar. Controleer je verbinding of log opnieuw in.', 'error');
        }
    });
});
