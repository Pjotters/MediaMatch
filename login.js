document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#loginForm');
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

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        showStatus('Bezig met inloggen...', 'loading');

        const email = form.email.value;
        const password = form.password.value;

        try {
            // Probeer eerst de primaire API
            let res;
            let data;
            
            try {
                res = await fetch(`${window.config.apiUrl}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                if (!res.ok) {
                    throw new Error('Primaire API niet beschikbaar');
                }
                
                data = await res.json();
                console.log('Login via primaire API geslaagd');
            } catch (primaryError) {
                console.log('Fallback naar backup API endpoint', primaryError);
                res = await fetch(`${window.config.apiUrl}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                data = await res.json();
                console.log('Login via backup API');
            }
            
            if ((res.ok || data.success) && data.token) {
                // Gebruiker opslaan in localStorage
                localStorage.setItem('user', email);
                localStorage.setItem('token', data.token); // JWT-token opslaan voor upload!
                showStatus('Login gelukt! Je wordt doorgestuurd...', 'success');
                setTimeout(() => {
                    window.location.href = '/upload.html';
                }, 1500);
            } else {
                showStatus(`Fout: ${data.message || 'Er is iets misgegaan'}`, 'error');
            }
        } catch (error) {
            console.error('Login fout:', error);
            showStatus('Netwerkfout. Controleer je verbinding en probeer opnieuw.', 'error');
        }
    });
});
