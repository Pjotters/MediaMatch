document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#registerForm');
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
    
    // Wachtwoord sterkte check
    const passwordInput = document.getElementById('password');
    const strengthIndicator = document.getElementById('password-strength');
    
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        let strength = 0;
        
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        
        const strengthClass = ['zwak', 'matig', 'goed', 'sterk'][strength];
        strengthIndicator.className = `strength-meter ${strengthClass}`;
        strengthIndicator.setAttribute('data-label', ['Zwak', 'Matig', 'Goed', 'Sterk'][strength]);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        showStatus('Bezig met registreren...', 'loading');

        const body = {
            name: form.name.value,
            email: form.email.value,
            password: form.password.value,
            role: form.role.value,
            subscriptionType: form.subscriptionType.value
        };

        try {
            // Probeer eerst de primaire API
            let res;
            let data;
            
            try {
                res = await fetch(`${window.config.apiUrl}/api/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                
                if (!res.ok) {
                    throw new Error('Primaire API niet beschikbaar');
                }
                
                data = await res.json();
                console.log('Registratie via primaire API geslaagd');
            } catch (primaryError) {
                console.log('Fallback naar backup API endpoint', primaryError);
                res = await fetch(`${window.config.apiUrl}/api/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                data = await res.json();
                console.log('Registratie via backup API');
            }
            
            if (res.ok || data.success) {
                showStatus('Registratie gelukt! Je wordt doorgestuurd...', 'success');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1500);
            } else {
                showStatus(`Fout: ${data.message || 'Er is iets misgegaan'}`, 'error');
            }
        } catch (error) {
            console.error('Registratiefout:', error);
            showStatus('Netwerkfout. Controleer je verbinding en probeer opnieuw.', 'error');
        }
    });
});
