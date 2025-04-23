document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#uploadForm');
    const fileInput = document.getElementById('photo');
    const imagePreview = document.getElementById('imagePreview');
    const previewContainer = document.getElementById('previewContainer');
    const previewTitle = document.getElementById('previewTitle');
    const photoLabel = document.getElementById('photoLabel');
    const statusElement = document.getElementById('status');
    
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
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Update preview-afbeelding
                imagePreview.src = e.target.result;
                previewTitle.textContent = file.name;
                previewContainer.style.display = 'block';
                
                // Update label tekst
                photoLabel.textContent = 'Wijzig afbeelding';
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // Drag & drop ondersteuning
    const uploadArea = document.querySelector('.file-upload');
    
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
        
        if (files.length) {
            fileInput.files = files;
            // Trigger het change event manueel
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    }

    // Portrait form verwerking
    const portraitFormInput = document.getElementById('portrait_form');
    const portraitFormLabel = document.getElementById('portraitFormLabel');
    
    portraitFormInput.addEventListener('change', () => {
        const file = portraitFormInput.files[0];
        if (file) {
            portraitFormLabel.textContent = file.name;
        }
    });
    
    // --- HIER START DE AANPASSING VOOR JWT EN UPLOAD ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        showStatus('Bezig met uploaden...', 'loading');
        const formData = new FormData(form);
        const BASE = window.config.apiUrl;
        // JWT ophalen uit localStorage (zoals bij login)
        const token = localStorage.getItem('token');
        let headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        try {
            let res, data;
            try {
                res = await fetch(`${BASE}/api/upload`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                    headers
                });
                if (!res.ok) throw new Error('Primaire API niet beschikbaar');
                data = await res.json();
                showStatus('Upload via primaire API geslaagd', 'success');
            } catch (primaryError) {
                console.log('Fallback naar backup API endpoint', primaryError);
                res = await fetch(`${BASE}/api/upload`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                    headers
                });
                data = await res.json();
                showStatus('Upload via backup API geslaagd', 'success');
            }
            if (res.ok || (data && data.success)) {
                setTimeout(() => {
                    window.location.href = '/gallery.html';
                }, 1200);
            } else {
                showStatus(`Fout: ${data && data.message ? data.message : 'Er is iets misgegaan'}`, 'error');
            }
        } catch (error) {
            console.error('Upload fout:', error);
            showStatus('Netwerkfout. Controleer je verbinding en probeer opnieuw.', 'error');
        }
    });
});
