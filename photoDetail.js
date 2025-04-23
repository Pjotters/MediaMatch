document.addEventListener('DOMContentLoaded', async () => {
    // DOM elementen
    const photoContainer = document.querySelector('.photo-detail-container');
    const commentsContainer = document.querySelector('.comments-container');
    const commentForm = document.querySelector('#comment-form');
    const likeButton = document.querySelector('#like-button');
    const likeCounter = document.querySelector('#like-count');
    const backButton = document.querySelector('.back-button');
    
    // URL params om de foto ID te krijgen
    const urlParams = new URLSearchParams(window.location.search);
    const photoId = urlParams.get('id');
    
    if (!photoId) {
        photoContainer.innerHTML = '<div class="error-message">Geen foto ID gevonden</div>';
        return;
    }
    
    // Foto laden
    async function loadPhoto() {
        try {
            // Toon laad-indicator
            photoContainer.innerHTML = '<div class="loading-indicator"><div class="spinner"></div><p>Foto laden...</p></div>';
            
            // Haal alle foto's op
            const response = await fetch(`${window.config.apiUrl}/api/photos`);
            if (!response.ok) throw new Error('Kon foto\'s niet laden');
            
            const photos = await response.json();
            const photo = photos.find(p => p.id === photoId);
            
            if (!photo) {
                photoContainer.innerHTML = '<div class="error-message">Foto niet gevonden</div>';
                return null;
            }
            
            // Toon de foto details
            photoContainer.innerHTML = `
                <div class="photo-detail glass">
                    <img src="${photo.url}" alt="${photo.title}" class="detail-image">
                    <div class="photo-info">
                        <h2>${photo.title}</h2>
                        <p class="description">${photo.description || 'Geen beschrijving'}</p>
                        <div class="metadata">
                            <span class="category">${photo.category || 'Geen categorie'}</span>
                            <span class="uploaded-by">Door: ${photo.userEmail}</span>
                            <span class="uploaded-on">Geüpload op: ${new Date(photo.createdAt).toLocaleDateString('nl-NL')}</span>
                        </div>
                        <div class="tags-container">
                            ${photo.tags ? photo.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                        </div>
                        <div class="actions">
                            <button id="like-button" class="action-btn ${isLoggedIn ? '' : 'disabled'}">
                                <span class="like-icon">❤️</span> <span id="like-count">0</span>
                            </button>
                            <button class="action-btn share-btn">Delen</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Update DOM referenties na het injecteren van nieuwe content
            likeButton = document.querySelector('#like-button');
            likeCounter = document.querySelector('#like-count');
            
            // Event handlers toevoegen
            setupLikeButton();
            
            return photo;
        } catch (error) {
            console.error('Fout bij laden foto:', error);
            photoContainer.innerHTML = '<div class="error-message">Fout bij laden van de foto</div>';
            return null;
        }
    }
    
    // Comments laden
    async function loadComments() {
        try {
            commentsContainer.innerHTML = '<div class="loading-indicator"><div class="spinner"></div><p>Reacties laden...</p></div>';
            
            const response = await fetch(`${window.config.apiUrl}/api/photos/${photoId}/comments`);
            if (!response.ok) throw new Error('Kon reacties niet laden');
            
            const comments = await response.json();
            
            if (comments.length === 0) {
                commentsContainer.innerHTML = '<p class="no-comments">Nog geen reacties. Wees de eerste!</p>';
            } else {
                commentsContainer.innerHTML = '<h3>Reacties</h3>';
                
                const commentsList = document.createElement('div');
                commentsList.className = 'comments-list';
                
                comments.forEach(comment => {
                    const commentElement = document.createElement('div');
                    commentElement.className = 'comment glass';
                    commentElement.innerHTML = `
                        <div class="comment-header">
                            <span class="comment-author">${comment.userEmail}</span>
                            <span class="comment-date">${new Date(comment.createdAt).toLocaleDateString('nl-NL')}</span>
                        </div>
                        <div class="comment-body">${comment.text}</div>
                    `;
                    commentsList.appendChild(commentElement);
                });
                
                commentsContainer.appendChild(commentsList);
            }
            
            // Comment form alleen tonen als gebruiker is ingelogd
            if (isLoggedIn) {
                const formHTML = `
                    <form id="comment-form" class="comment-form">
                        <textarea id="comment-text" placeholder="Schrijf een reactie..." required></textarea>
                        <button type="submit" class="comment-submit">Plaatsen</button>
                    </form>
                `;
                commentsContainer.insertAdjacentHTML('beforeend', formHTML);
                
                // Update de form referentie en voeg event handler toe
                commentForm = document.querySelector('#comment-form');
                setupCommentForm();
            } else {
                commentsContainer.insertAdjacentHTML('beforeend', 
                    '<p class="login-prompt">Je moet <a href="login.html">inloggen</a> om te reageren</p>'
                );
            }
        } catch (error) {
            console.error('Fout bij laden reacties:', error);
            commentsContainer.innerHTML = '<div class="error-message">Fout bij laden van reacties</div>';
        }
    }
    
    // Likes laden en bijwerken
    async function loadLikes() {
        try {
            const headers = {};
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
            
            const response = await fetch(`${window.config.apiUrl}/api/photos/${photoId}/likes`, {
                headers
            });
            
            if (!response.ok) throw new Error('Kon likes niet laden');
            
            const data = await response.json();
            likeCounter.textContent = data.likeCount;
            
            // Update like button style als de gebruiker de foto al geliked heeft
            if (data.userLiked) {
                likeButton.classList.add('liked');
            } else {
                likeButton.classList.remove('liked');
            }
        } catch (error) {
            console.error('Fout bij laden likes:', error);
        }
    }
    
    // Like button setup
    function setupLikeButton() {
        likeButton.addEventListener('click', async () => {
            if (!isLoggedIn) {
                alert('Je moet ingelogd zijn om te kunnen liken!');
                return;
            }
            
            try {
                const response = await fetch(`${window.config.apiUrl}/api/photos/${photoId}/like`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) throw new Error('Like actie mislukt');
                
                const data = await response.json();
                
                // Update UI
                likeCounter.textContent = data.likeCount;
                
                if (data.liked) {
                    likeButton.classList.add('liked');
                } else {
                    likeButton.classList.remove('liked');
                }
            } catch (error) {
                console.error('Fout bij like/unlike:', error);
                alert('Er is een fout opgetreden bij het liken van deze foto.');
            }
        });
    }
    
    // Comment form setup
    function setupCommentForm() {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const commentText = document.querySelector('#comment-text').value.trim();
            if (!commentText) return;
            
            try {
                const response = await fetch(`${window.config.apiUrl}/api/photos/${photoId}/comments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ text: commentText })
                });
                
                if (!response.ok) throw new Error('Kon reactie niet plaatsen');
                
                // Reset form en herlaad comments
                commentForm.reset();
                loadComments();
            } catch (error) {
                console.error('Fout bij plaatsen reactie:', error);
                alert('Er is een fout opgetreden bij het plaatsen van je reactie.');
            }
        });
    }
    
    // Terug knop
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.history.back();
        });
    }
    
    // Check of gebruiker is ingelogd
    const token = localStorage.getItem('token');
    const isLoggedIn = !!token;
    
    // Initialisatie
    const photo = await loadPhoto();
    if (photo) {
        await Promise.all([loadComments(), loadLikes()]);
    }
});
