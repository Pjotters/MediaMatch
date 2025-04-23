document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryGrid = document.querySelector('.gallery-grid');
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = '<div class="spinner"></div><p>Foto\'s laden...</p>';
    
    // Helper functie voor API base URL
    function getApiBaseUrl() {
        // Probeer eerst lokale API, anders gebruik cloudflare URL
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return '';
        } else {
            return 'https://christopher-charter-tribal-automated.trycloudflare.com';
        }
    }

    // Initialiseer filter knoppen
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filter = button.getAttribute('data-filter');
            filterImages(filter);
        });
    });

    // Laad afbeeldingen van API
    async function loadImagesFromAPI() {
        try {
            // Toon laadindicator
            galleryGrid.innerHTML = '';
            galleryGrid.appendChild(loadingIndicator);

            // Probeer eerst de primaire API endpoint, dan de backup
            const BASE = getApiBaseUrl();
            let response;
            let photos;
            let apiSource;

            try {
                response = await fetch(`${window.config.apiUrl}/api/photos`);
                if (response.ok) {
                    photos = await response.json();
                    apiSource = 'Primaire API';
                } else {
                    throw new Error('Primaire API niet beschikbaar');
                }
            } catch (primaryError) {
                console.log('Fallback naar backup API endpoint', primaryError);
                response = await fetch(`${window.config.apiUrl}/api/photos`);
                photos = await response.json();
                apiSource = 'Backup API';
            }

            console.log(`Afbeeldingen geladen via ${apiSource}`);
            
            // Verwijder laadindicator
            galleryGrid.innerHTML = '';

            // Verwerk de foto's
            if (photos && photos.length > 0) {
                photos.forEach(photo => {
                    const item = document.createElement('div');
                    item.className = 'gallery-item';
                    item.setAttribute('data-category', photo.category || 'onbekend');
                    item.setAttribute('data-id', photo.id); // Foto ID voor detailpagina
                    const img = document.createElement('img');
                    img.src = photo.url;
                    img.alt = photo.title || 'Afbeelding';
                    img.loading = 'lazy';
                    img.onload = function() {
                        img.style.aspectRatio = img.naturalWidth + '/' + img.naturalHeight;
                    };
                    item.appendChild(img);
                    const overlay = document.createElement('div');
                    overlay.className = 'overlay';
                    overlay.innerHTML = `<h3>${photo.title || 'Geen titel'}</h3><p>${photo.description || ''}</p><div class="photo-metadata"><span>${photo.userEmail || ''}</span></div>`;
                    item.appendChild(overlay);
                    galleryGrid.appendChild(item);
                    
                    // Voeg click event toe om naar detailpagina te navigeren
                    item.addEventListener('click', () => {
                        window.location.href = `photoDetail.html?id=${photo.id}`;
                    });
                    
                    // Pas de grootte aan voor masonry layout
                    resizeGridItem(item);
                    
                    // Voeg event listeners toe voor lazyloading perfectie
                    img.addEventListener('load', () => resizeGridItem(item));
                });
            } else {
                throw new Error('Geen foto\'s gevonden');
            }
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

    // Filter functie voor de categorieën
    function filterImages(filter) {
        const items = document.querySelectorAll('.gallery-item');
        items.forEach(item => {
            const category = item.getAttribute('data-category');
            if (filter === 'all' || filter === category) {
                item.style.display = 'block';
                // Resize na filtering om layout aan te passen
                setTimeout(() => resizeGridItem(item), 100);
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Functie voor masonry layout met verschillende hoogtes
    function resizeGridItem(item) {
        if (!item || item.style.display === 'none') return;
        
        const grid = document.querySelector('.gallery-grid');
        const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
        const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap')) || 0;
        
        // Bereken benodigde span gebaseerd op content hoogte
        const contentElement = item.querySelector('.overlay');
        if (!contentElement) return;
        
        const contentHeight = contentElement.getBoundingClientRect().height;
        
        // Bereken hoeveel grid-rows dit item zou moeten innemen
        const rowSpan = Math.ceil((contentHeight + rowGap) / (rowHeight + rowGap));
        
        // Pas de grid-row-end property aan
        item.style.gridRowEnd = `span ${rowSpan}`;
    }

    // Handle voor window resize events (voor responsiveness)
    window.addEventListener('resize', () => {
        const items = document.querySelectorAll('.gallery-item');
        items.forEach(item => {
            if (item.style.display !== 'none') {
                resizeGridItem(item);
            }
        });
    });

    // Start het laden van de afbeeldingen
    loadImagesFromAPI();
});
