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
            role: form['role-select'] ? form['role-select'].value : form.role.value,
            subscriptionType: form['plan-select'] ? form['plan-select'].value : form.subscriptionType.value
        };

        try {
            let res = await fetch(`${window.config.apiUrl}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            let data = await res.json();
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
