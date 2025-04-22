document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryGrid = document.querySelector('.gallery-grid');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filter = button.getAttribute('data-filter');
            filterImages(filter);
        });
    });

    async function loadImagesFromAPI() {
        try {
            const response = await fetch('https://constraints-greensboro-converted-jon.trycloudflare.com/api/photos');
            const photos = await response.json();
            galleryGrid.innerHTML = '';

            photos.forEach(photo => {
                const item = document.createElement('div');
                item.className = 'gallery-item medium';
                item.setAttribute('data-category', photo.category || 'onbekend');
                item.innerHTML = `
                    <img src="${photo.url}" alt="${photo.title}">
                    <div class="overlay">
                        <h3>${photo.title || 'Geen titel'}</h3>
                        <p>${photo.description || ''}</p>
                    </div>`;
                galleryGrid.appendChild(item);
                resizeGridItem(item); // Call the resizeGridItem function for each item
            });
        } catch (err) {
            console.error('Fout bij het laden van foto\'s:', err);
            
            // Toon een gebruikersvriendelijke foutmelding in de gallery
            galleryGrid.innerHTML = `
                <div class="error-container">
                    <div class="error-message">
                        <h3>Er is een probleem opgetreden</h3>
                        <p>We konden de foto's niet laden. Probeer het later opnieuw.</p>
                        <button id="retry-button" class="retry-btn">Opnieuw proberen</button>
                    </div>
                </div>
            `;
            
            // Voeg event listener toe voor retry button
            document.getElementById('retry-button').addEventListener('click', () => {
                loadImagesFromAPI();
            });
        }
    }

    function filterImages(filter) {
        const items = document.querySelectorAll('.gallery-item');
        items.forEach(item => {
            const category = item.getAttribute('data-category');
            item.style.display = (filter === 'all' || filter === category) ? 'block' : 'none';
        });
    }

    // Functie voor masonry layout met verschillende hoogtes
    function resizeGridItem(item) {
        const grid = document.querySelector('.gallery-grid');
        const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
        const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap')) || 0;
        
        // Bereken benodigde span gebaseerd op content hoogte
        const contentElement = item.querySelector('.overlay'); // Changed to .overlay
        const contentHeight = contentElement.getBoundingClientRect().height;
        
        // Bereken hoeveel grid-rows dit item zou moeten innemen
        const rowSpan = Math.ceil((contentHeight + rowGap) / (rowHeight + rowGap));
        
        // Pas de grid-row-end property aan
        item.style.gridRowEnd = `span ${rowSpan}`;
    }

    loadImagesFromAPI();
});
