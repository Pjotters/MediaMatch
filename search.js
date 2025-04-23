console.log('Zoek script geladen');

// MediaMatch - search.js
// AI gezichtsherkenning zoekpagina

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('searchForm');
    const searchPhoto = document.getElementById('searchPhoto');
    const status = document.getElementById('searchStatus');
    const resultsContainer = document.getElementById('resultsContainer');

    function showStatus(msg, type = 'info') {
        status.textContent = msg;
        status.style.display = 'block';
        status.style.color = type === 'error' ? '#f06292' : '#a259c6';
    }
    function clearStatus() {
        status.textContent = '';
        status.style.display = 'none';
    }
    function showResults(results) {
        resultsContainer.innerHTML = '';
        if (!results || results.length === 0) {
            resultsContainer.innerHTML = '<div style="color:#f06292;">Geen gezichts-matches gevonden.</div>';
            return;
        }
        results.forEach(photo => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.innerHTML = `
                <img src="${photo.url}" alt="Match" />
                <div class="result-details">
                  <div class="result-title">${photo.title}</div>
                  <div class="result-meta">${photo.category ? photo.category : ''} &bull; ${photo.createdAt ? new Date(photo.createdAt).toLocaleDateString() : ''}</div>
                  <div class="ai-tags">AI tags: ${(photo.tags||[]).join(', ')}</div>
                  ${photo.faces && photo.faces.length ? `<div style='color:#f06292;'>Gezichten: ${photo.faces.length}</div>` : ''}
                </div>
            `;
            resultsContainer.appendChild(div);
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearStatus();
        resultsContainer.innerHTML = '';
        const file = searchPhoto.files[0];
        if (!file) {
            showStatus('Selecteer een foto om te zoeken.', 'error');
            return;
        }
        showStatus('Zoeken naar gezichten...', 'info');
        const formData = new FormData();
        formData.append('searchPhoto', file);
        let BASE = window.config && window.config.apiUrl ? window.config.apiUrl : '';
        if (!BASE) BASE = '';
        try {
            const res = await fetch(`${BASE}/api/search-face`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            if (!res.ok) {
                showStatus('Serverfout of geen matches gevonden.', 'error');
                return;
            }
            const data = await res.json();
            if (data.success && data.matches) {
                showResults(data.matches);
                showStatus(`${data.matches.length} match${data.matches.length === 1 ? '' : 'es'} gevonden.`, 'info');
            } else {
                showResults([]);
                showStatus('Geen gezichts-matches gevonden.', 'error');
            }
        } catch (err) {
            showStatus('Netwerkfout of server niet bereikbaar.', 'error');
        }
    });
});