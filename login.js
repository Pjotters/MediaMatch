document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#loginForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = form.email.value;
        const password = form.password.value;

        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        alert(data.message);

        if (res.ok) {
            window.location.href = '/upload.html';
        }
    });
});
