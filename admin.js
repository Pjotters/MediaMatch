document.addEventListener('DOMContentLoaded', async () => {
    const adminGrid = document.querySelector('.admin-grid');
    const promoteContainer = document.getElementById('promote-container');
    const promoteForm = document.getElementById('promote-form');
    const promoteStatus = document.getElementById('promote-status');
    const bundelOverview = document.getElementById('bundel-overview');
    const addBundelBtn = document.getElementById('add-bundel');
    const bezwarenOverview = document.getElementById('bezwaren-overview');
    const adminChatBox = document.getElementById('admin-chatbox');
    const adminInput = document.getElementById('admin-chatinput');
    const adminSendBtn = document.getElementById('admin-sendbtn');

    let bundels = [];

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

    // Debug: Toon rol in console
    async function debugUserRole() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('[DEBUG] Geen JWT-token gevonden.');
            return;
        }
        try {
            const res = await fetch(`${window.config.apiUrl}/api/subscription`, {
                headers: { 'Authorization': `Bearer ${token}` },
                credentials: 'include'
            });
            const data = await res.json();
            if (data.subscription) {
                console.log(`[DEBUG] API subscription response:`, data.subscription);
                if (data.subscription.userRole) {
                    console.log(`[DEBUG] userRole volgens backend:`, data.subscription.userRole);
                } else {
                    console.log('[DEBUG] userRole ontbreekt in subscription response!');
                }
            } else {
                console.log('[DEBUG] Geen subscription info ontvangen:', data);
            }
        } catch (e) {
            console.log('[DEBUG] Fout bij ophalen subscription info:', e);
        }
    }
    debugUserRole();

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
                promoteStatus.textContent = 'Je bent nu admin! Je wordt nu automatisch uitgelogd. Log opnieuw in voor admin-rechten.';
                setTimeout(() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login.html';
                }, 1800);
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

    function renderBundels() {
        bundelOverview.innerHTML = '';
        if (bundels.length === 0) {
            bundelOverview.innerHTML = '<em>Geen bundels gevonden.</em>';
            return;
        }
        bundels.forEach((bundel, idx) => {
            const div = document.createElement('div');
            div.className = 'bundel-card';
            div.style = 'background:rgba(49,32,74,0.93);border-radius:1rem;padding:1.2rem 1.5rem;min-width:260px;box-shadow:0 2px 16px #0005;margin-bottom:1rem;';
            div.innerHTML = `<strong>${bundel.naam}</strong><br>Prijs: €${bundel.prijs}<br>Aantal uploads: ${bundel.uploads}<br><button class='admin-btn' data-idx='${idx}' style='margin-top:0.7rem;background:#f06292;'>Verwijder</button>`;
            div.querySelector('button').onclick = () => { bundels.splice(idx, 1); saveBundels(); renderBundels(); };
            bundelOverview.appendChild(div);
        });
    }

    function saveBundels() {
        localStorage.setItem('bundels', JSON.stringify(bundels));
    }
    function loadBundels() {
        bundels = JSON.parse(localStorage.getItem('bundels') || '[]');
        renderBundels();
    }
    addBundelBtn.onclick = () => {
        const naam = prompt('Naam van de bundel?');
        const prijs = prompt('Prijs (€)?');
        const uploads = prompt('Aantal uploads?');
        if (naam && prijs && uploads) {
            bundels.push({ naam, prijs, uploads });
            saveBundels();
            renderBundels();
        }
    };
    loadBundels();

    fetch(`${window.config.apiUrl}/api/admin/bezwaren`, { credentials: 'include' })
        .then(r => r.json())
        .then(bezwaren => {
            if (!bezwaren || bezwaren.length === 0) {
                bezwarenOverview.innerHTML = '<em>Geen bezwaren gevonden.</em>';
                return;
            }
            let html = '<table style="width:100%;border-collapse:collapse;">';
            html += '<tr style="background:#31204a;"><th>Gebruiker</th><th>Reden</th><th>Bestand</th><th>Datum</th><th>Status</th></tr>';
            bezwaren.forEach(b => {
                html += `<tr style="background:rgba(49,32,74,0.93);">
                    <td>${b.user}</td>
                    <td>${b.reason}</td>
                    <td><a href="${b.file}" target="_blank" style="color:#f06292;">Download</a></td>
                    <td>${new Date(b.createdAt).toLocaleString()}</td>
                    <td>${b.status}</td>
                </tr>`;
            });
            html += '</table>';
            bezwarenOverview.innerHTML = html;
        });

    const socket = io(window.config.apiUrl, { withCredentials: true });

    function appendAdminMsg(msgObj, self) {
        const el = document.createElement('div');
        el.className = 'chat-msg' + (self ? ' self' : '');
        el.innerHTML = `<strong>${msgObj.user || 'Gast'}:</strong> ${msgObj.message}`;
        adminChatBox.appendChild(el);
        adminChatBox.scrollTop = adminChatBox.scrollHeight;
    }

    adminSendBtn.onclick = () => {
        const msg = adminInput.value.trim();
        if (!msg) return;
        const user = 'ADMIN';
        const msgObj = { user, message: msg };
        socket.emit('chat message', msgObj);
        appendAdminMsg(msgObj, true);
        adminInput.value = '';
    };

    socket.on('chat message', (msgObj) => {
        appendAdminMsg(msgObj, false);
    });

    // Haal chatgeschiedenis op
    socket.emit('get history');
    socket.on('chat history', (msgs) => {
        adminChatBox.innerHTML = '';
        msgs.forEach(msgObj => appendAdminMsg(msgObj, msgObj.user === 'ADMIN'));
    });
});
