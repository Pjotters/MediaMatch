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
            return 'https://lucy-ball-listen-kerry.trycloudflare.com';
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

    // === AI & OCR LIBRARY LOADING ===
    if (!window.ml5) {
        var ml5Script = document.createElement('script');
        ml5Script.src = 'libs/ml5.min.js';
        document.head.appendChild(ml5Script);
    }
    if (!window.Tesseract) {
        var tessScript = document.createElement('script');
        tessScript.src = 'libs/tesseract.min.js';
        document.head.appendChild(tessScript);
    }

    // === AI MODELS ===
    let aiClassifier = null;
    let faceApi = null;
    function loadAiModels(cb) {
        function checkLoaded() {
            if (window.ml5 && window.ml5.imageClassifier && window.ml5.faceApi) {
                if (!aiClassifier) {
                    window.ml5.imageClassifier('MobileNet', function() {
                        aiClassifier = this;
                        if (faceApi) return cb && cb();
                    });
                }
                if (!faceApi) {
                    const options = { withLandmarks: true, withDescriptors: false };
                    window.ml5.faceApi(options, function() {
                        faceApi = this;
                        if (aiClassifier) return cb && cb();
                    });
                }
                if (aiClassifier && faceApi) cb && cb();
            } else {
                setTimeout(checkLoaded, 300);
            }
        }
        checkLoaded();
    }
    loadAiModels();

    // === OCR ===
    function runOCR(imgDataUrl, cb) {
        if (!window.Tesseract) {
            setTimeout(() => runOCR(imgDataUrl, cb), 500);
            return;
        }
        window.Tesseract.recognize(imgDataUrl, 'nld', {
            logger: m => {}
        }).then(({ data: { text } }) => {
            cb(text);
        }).catch(() => {
            cb('');
        });
    }

    // === UI: Voeg AI-buttons toe aan gallery-items ===
    function addAiButtons(item, img, overlay) {
        // Container
        let aiBar = document.createElement('div');
        aiBar.className = 'ai-bar';
        // Auto-tag
        let tagBtn = document.createElement('button');
        tagBtn.innerHTML = 'Auto-tag';
        tagBtn.className = 'ai-btn';
        tagBtn.onclick = function(e) {
            e.stopPropagation();
            overlay.innerHTML += '<div class="ai-status">AI bezig...</div>';
            if (!aiClassifier) return;
            aiClassifier.classify(img, (err, results) => {
                overlay.querySelector('.ai-status').remove();
                if (err || !results || !results.length) {
                    overlay.innerHTML += '<div class="ai-status">Geen tags gevonden</div>';
                    return;
                }
                const tags = results.slice(0,3).map(r=>r.label).join(', ');
                overlay.innerHTML += `<div class="ai-status"><b>Tags:</b> ${tags}</div>`;
            });
        };
        // OCR
        let ocrBtn = document.createElement('button');
        ocrBtn.innerHTML = 'OCR';
        ocrBtn.className = 'ai-btn';
        ocrBtn.onclick = function(e) {
            e.stopPropagation();
            overlay.innerHTML += '<div class="ai-status">OCR bezig...</div>';
            // Convert img to dataURL
            let canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img,0,0);
            let dataUrl = canvas.toDataURL('image/png');
            runOCR(dataUrl, (text) => {
                overlay.querySelector('.ai-status').remove();
                overlay.innerHTML += `<div class="ai-status"><b>OCR:</b> ${text ? text : 'Geen tekst gevonden'}</div>`;
            });
        };
        // Face detection
        let faceBtn = document.createElement('button');
        faceBtn.innerHTML = 'Gezichten';
        faceBtn.className = 'ai-btn';
        faceBtn.onclick = function(e) {
            e.stopPropagation();
            overlay.innerHTML += '<div class="ai-status">Zoeken naar gezichten...</div>';
            if (!faceApi) return;
            faceApi.detectSingle(img, (err, result) => {
                overlay.querySelector('.ai-status').remove();
                if (err || !result) {
                    overlay.innerHTML += '<div class="ai-status">Geen gezichten gevonden</div>';
                    return;
                }
                overlay.innerHTML += `<div class="ai-status"><b>Gezicht gedetecteerd!</b></div>`;
            });
        };
        aiBar.appendChild(tagBtn);
        aiBar.appendChild(ocrBtn);
        aiBar.appendChild(faceBtn);
        overlay.appendChild(aiBar);
    }

    // Patch: voeg AI-buttons toe na laden images
    const origLoadImagesFromAPI = window.loadImagesFromAPI;
    window.loadImagesFromAPI = async function() {
        await origLoadImagesFromAPI.apply(this, arguments);
        document.querySelectorAll('.gallery-item').forEach(item => {
            const img = item.querySelector('img');
            const overlay = item.querySelector('.overlay');
            addAiButtons(item, img, overlay);
        });
    };

    // Start het laden van de afbeeldingen
    loadImagesFromAPI();
});
