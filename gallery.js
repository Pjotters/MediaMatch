document.addEventListener('DOMContentLoaded', () => {
    console.log('Gallery script geladen');
    
    // Element referenties ophalen
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    // Filter functionaliteit
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Active class togglen
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Bepaal welke filter is geselecteerd
            const filterValue = button.getAttribute('data-filter');
            
            // Items filteren
            galleryItems.forEach(item => {
                if (filterValue === 'all') {
                    item.style.display = 'block';
                } else {
                    const category = item.getAttribute('data-category');
                    if (category === filterValue) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                }
            });
            
            // Grid opnieuw inrichten na filteren
            resizeGridItems();
        });
    });
    
    // Functie voor masonry layout met verschillende hoogtes
    function resizeGridItem(item) {
        const grid = document.querySelector('.gallery-grid');
        const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
        const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap')) || 0;
        
        // Voorbereiden voor later gebruik met HP-opslag API
        // Voor nu gebruikt het fixed grid spans (small, medium, tall)
    }
    
    function resizeGridItems() {
        const allItems = document.querySelectorAll('.gallery-item');
        allItems.forEach(item => {
            if (item.style.display !== 'none') {
                resizeGridItem(item);
            }
        });
    }
    
    // Voeg luisteraars toe voor window resize en load events
    window.addEventListener('resize', resizeGridItems);
    window.addEventListener('load', resizeGridItems);
    
    // Voorbereiden voor toekomstige API integratie
    // Hier zou je later de code kunnen toevoegen om afbeeldingen van de HP-opslag API te laden
    function loadImagesFromAPI() {
        // Placeholder functie voor toekomstige API implementatie
        console.log('API integratie voorbereid');
        // Voorbeeld API call zou hier komen
    }
    
    // Voeg hover effect toe voor een betere gebruikerservaring
    galleryItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const overlay = item.querySelector('.overlay');
            overlay.style.transform = 'translateY(0)';
        });
        
        item.addEventListener('mouseleave', () => {
            const overlay = item.querySelector('.overlay');
            overlay.style.transform = 'translateY(100%)';
        });
    });
});