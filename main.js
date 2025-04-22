document.addEventListener('DOMContentLoaded', () => {
    console.log('Upload script geladen');
    
    // Slideshow initialiseren als we op de homepage zijn
    if (document.getElementById('slideshow')) {
        initSlideshow();
    }
});

function initSlideshow() {
    // Paden naar alle Nederland U16 Hockey foto's
    const imagePaths = [
        'assets/Hockey/NederlandU16/010F47B8-39C4-4F65-AF72-951C1B014249_1_102_a.jpeg',
        'assets/Hockey/NederlandU16/0E8AE998-FC00-4AD6-99B7-2C65F92AF229_1_102_a.jpeg',
        'assets/Hockey/NederlandU16/12E08B61-5FD5-4CEF-AF2F-31703FCF9C9E_1_102_a.jpeg',
        'assets/Hockey/NederlandU16/33A7D1B7-D8EE-4F68-A94A-C7664344FDB6_1_102_a.jpeg',
        'assets/Hockey/NederlandU16/3B28869F-A3EC-442A-9371-4352BEDECDDF_1_206_a.jpeg',
        'assets/Hockey/NederlandU16/48CB233E-2BE6-478F-8F3F-E31EC042A66B_1_102_a.jpeg',
        'assets/Hockey/NederlandU16/5C5E0C04-8BE7-4FEB-8E10-069C1DC70D25_1_102_a.jpeg',
        'assets/Hockey/NederlandU16/6A78BD27-0EE1-48BB-A1CC-5D241D49CB37_1_102_a.jpeg',
        'assets/Hockey/NederlandU16/6D9FAA21-EFAA-49CC-9065-DD114072A834_4_5005_c.jpeg',
        'assets/Hockey/NederlandU16/7084E7EE-B86A-4BF8-AC58-0E6962B43CD3_1_102_a.jpeg',
        'assets/Hockey/NederlandU16/78C00E36-4845-49A5-8373-93D1F45011D2_1_102_a.jpeg',
        'assets/Hockey/NederlandU16/865D38D8-7A7A-4939-9F0A-732AA0D5573B_4_5005_c.jpeg',
        'assets/Hockey/NederlandU16/9D35FD79-867D-488E-B274-7400518C0F6D_1_102_a.jpeg',
        'assets/Hockey/NederlandU16/9FCAFBD6-634D-4DA9-AE4D-557C0CB25947_4_5005_c.jpeg',
        'assets/Hockey/NederlandU16/A4774A3F-1052-4C2D-A873-44FFBFC0FF4D_4_5005_c.jpeg',
        'assets/Hockey/NederlandU16/A63D220A-F1AA-4B22-91F7-A41FF4840A1D_1_102_a.jpeg',
        'assets/Hockey/NederlandU16/D914158C-F6B0-4E5B-B9D1-34DB13D0AD47_1_102_o.jpeg',
        'assets/Hockey/NederlandU16/D9BE90A9-9FF1-46CA-9AFD-725CFDD41899_1_102_a.jpeg',
        'assets/Hockey/NederlandU16/E0352DAB-9BDA-4334-B347-036E266F0FE7_4_5005_c.jpeg',
        'assets/Hockey/NederlandU16/E2AC765F-D112-4084-9058-E1727A09135C_1_102_a.jpeg',
        'assets/Hockey/NederlandU16/E3263D52-FD94-4E21-A38E-F58D190093AD_4_5005_c.jpeg',
        'assets/Hockey/NederlandU16/EC984FD2-052F-4C23-BE30-8FDEDDFBCD56_4_5005_c.jpeg',
        'assets/Hockey/NederlandU16/F0B24846-35B1-4906-9403-66E7D7E82C5E_1_102_o.jpeg',
        'assets/Hockey/NederlandU16/FF0B7D12-06D6-4EDD-B8A4-623A08875526_1_102_a.jpeg'
    ];
    
    // DOM elementen ophalen
    const slideshowContainer = document.querySelector('.slideshow-image-container');
    const indicatorsContainer = document.querySelector('.slideshow-indicators');
    const prevButton = document.getElementById('prev-slide');
    const nextButton = document.getElementById('next-slide');
    
    // State variabelen
    let currentIndex = 0;
    let slideInterval;
    let indicators = [];
    
    // Preload alle afbeeldingen voor soepelere overgangen
    function preloadImages() {
        imagePaths.forEach(path => {
            const img = new Image();
            img.src = path;
        });
    }
    
    // Slideshow opbouwen met afbeeldingen en indicators
    function setupSlideshow() {
        // Bestaande afbeelding ophalen en eerste pad instellen
        const currentImg = document.getElementById('slideshow-current');
        currentImg.src = imagePaths[0];
        currentImg.classList.add('active');
        
        // Indicator dots toevoegen voor elke afbeelding
        imagePaths.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            if (index === 0) indicator.classList.add('active');
            
            indicator.addEventListener('click', () => {
                changeSlide(index);
                resetInterval();
            });
            
            indicatorsContainer.appendChild(indicator);
            indicators.push(indicator);
        });
    }
    
    // Verandert naar de afbeelding op de gegeven index
    function changeSlide(index) {
        // Index beperken tot geldige range
        if (index < 0) index = imagePaths.length - 1;
        if (index >= imagePaths.length) index = 0;
        
        // Huidige afbeelding bijwerken
        const currentImg = document.getElementById('slideshow-current');
        
        // Voeg een nieuwe afbeelding toe
        currentImg.classList.remove('active');
        
        // Timeout voor soepele overgang
        setTimeout(() => {
            currentImg.src = imagePaths[index];
            currentImg.classList.add('active');
            
            // Update indicators
            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === index);
            });
            
            currentIndex = index;
        }, 300);
    }
    
    // Ga naar de volgende slide
    function nextSlide() {
        changeSlide(currentIndex + 1);
    }
    
    // Ga naar de vorige slide
    function prevSlide() {
        changeSlide(currentIndex - 1);
    }
    
    // Reset interval voor automatische slideshow
    function resetInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000); // Elke 5 seconden
    }
    
    // Event listeners
    prevButton.addEventListener('click', () => {
        prevSlide();
        resetInterval();
    });
    
    nextButton.addEventListener('click', () => {
        nextSlide();
        resetInterval();
    });
    
    // Touch swipe ondersteuning voor mobiele apparaten
    let touchStartX = 0;
    let touchEndX = 0;
    
    slideshowContainer.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    slideshowContainer.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        // Detecteer swipe richting (links/rechts)
        if (touchEndX < touchStartX - 50) {
            // Swipe naar links (volgende)
            nextSlide();
            resetInterval();
        }
        if (touchEndX > touchStartX + 50) {
            // Swipe naar rechts (vorige)
            prevSlide();
            resetInterval();
        }
    }
    
    // Pauze slideshow wanneer muis eroverheen gaat
    slideshowContainer.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });
    
    slideshowContainer.addEventListener('mouseleave', () => {
        resetInterval();
    });
    
    // Toetsenbord navigatie
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            resetInterval();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            resetInterval();
        }
    });
    
    // Preload afbeeldingen
    preloadImages();
    
    // Set up slideshow
    setupSlideshow();
    
    // Start automatische slideshow
    resetInterval();
}