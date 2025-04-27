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
        const body = {
            email: form.email.value,
            password: form.password.value
        };
        try {
            const res = await fetch(`${window.config.apiUrl}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                // Sla profiel info lokaal op (voor dashboard)
                localStorage.setItem('token', data.token);
                localStorage.setItem('userProfile', JSON.stringify(data.user || {}));
                showStatus('Succesvol ingelogd! Je wordt doorgestuurd...', 'success');
                setTimeout(() => {
                    window.location.href = '/MediaMatch-Dashboard.html';
                }, 1200);
            } else {
                showStatus(data.message || 'Ongeldige inloggegevens', 'error');
            }
        } catch (err) {
            showStatus('Netwerkfout. Probeer opnieuw.', 'error');
        }
    });
});
