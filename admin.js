document.addEventListener('DOMContentLoaded', async () => {
    const adminGrid = document.querySelector('.admin-grid');
    const promoteContainer = document.getElementById('promote-container');
    const promoteForm = document.getElementById('promote-form');
    const promoteStatus = document.getElementById('promote-status');

    // Check of user is admin (via backend call)
    async function checkAdmin() {
        const token = localStorage.getItem('token');
        if (!token) return false;
        try {
            const res = await fetch(`${window.config.apiUrl}/api/subscription`, {
                headers: { 'Authorization': `Bearer ${token}` },
                credentials: 'include'
            });
            const data = await res.json();
            return data.subscription && data.subscription.userRole === 'admin';
        } catch {
            return false;
        }
    }

    // Admin promote formulier tonen als je geen admin bent
    checkAdmin().then(isAdmin => {
        if (!isAdmin) {
            promoteContainer.style.display = 'block';
        } else {
            promoteContainer.style.display = 'none';
            loadSubmissions();
        }
    });

    if (promoteForm) {
        promoteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            promoteStatus.textContent = 'Bezig met promoten...';
            const code = promoteForm.elements['code'].value;
            const token = localStorage.getItem('token');
            const res = await fetch(`${window.config.apiUrl}/api/promote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                promoteStatus.textContent = 'Je bent nu admin! Vernieuw de pagina.';
                setTimeout(() => window.location.reload(), 1200);
            } else {
                promoteStatus.textContent = data.message || 'Fout bij promoten.';
            }
        });
    }

    async function loadSubmissions() {
        const res = await fetch(`${window.config.apiUrl}/api/admin/photos`);
        const submissions = await res.json();

        adminGrid.innerHTML = '';

        submissions.forEach(photo => {
            const item = document.createElement('div');
            item.className = 'admin-item';
            item.innerHTML = `
                <img src="${photo.url}" alt="${photo.title}">
                <h4>${photo.title}</h4>
                <p>Ingezonden door: ${photo.userEmail}</p>
                <button data-id="${photo.id}" class="approve-btn">Goedkeuren</button>
                <button data-id="${photo.id}" class="reject-btn">Afkeuren</button>`;
            adminGrid.appendChild(item);
        });

        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                await fetch(`${window.config.apiUrl}/api/admin/approve/${id}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    credentials: 'include'
                });
                loadSubmissions(); // refresh na goedkeuren
            });
        });
        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                await fetch(`${window.config.apiUrl}/api/admin/reject/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    credentials: 'include'
                });
                loadSubmissions(); // refresh na verwijderen
            });
        });
    }
});
