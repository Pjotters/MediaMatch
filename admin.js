document.addEventListener('DOMContentLoaded', async () => {
    const adminGrid = document.querySelector('.admin-grid');

    async function loadSubmissions() {
        const res = await fetch('/api/admin/photos');
        const submissions = await res.json();

        adminGrid.innerHTML = '';

        submissions.forEach(photo => {
            const item = document.createElement('div');
            item.className = 'admin-item';
            item.innerHTML = `
                <img src="${photo.url}" alt="${photo.title}">
                <h4>${photo.title}</h4>
                <p>Ingezonden door: ${photo.userEmail}</p>
                <button data-id="${photo.id}" class="reject-btn">Afkeuren</button>`;
            adminGrid.appendChild(item);
        });

        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                await fetch(`/api/admin/reject/${id}`, { method: 'DELETE' });
                loadSubmissions(); // refresh na verwijderen
            });
        });
    }

    loadSubmissions();
});
