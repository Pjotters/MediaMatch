// community.js - frontend logica voor ideeën & likes
const API = window.config?.communityApi || '/api/community';
const ideasList = document.getElementById('ideasList');
const latestUpdates = document.getElementById('latestUpdates');

function fetchIdeas() {
  fetch(API+'/ideas')
    .then(r=>r.json())
    .then(showIdeas);
}
function fetchUpdates() {
  fetch(API+'/updates')
    .then(r=>r.json())
    .then(updates=>{
      latestUpdates.textContent = updates.join(' | ');
    });
}
function showIdeas(ideas) {
  ideasList.innerHTML = '';
  ideas.forEach(idea => {
    const card = document.createElement('div');
    card.className = 'idea-card';
    card.innerHTML = `<span class='likes'>${idea.likes} ❤️</span><button class='like-btn${idea.liked?' liked':''}' data-id='${idea.id}'>👍</button><b>${idea.title}</b><div style='margin:0.5em 0 0.7em 0;'>${idea.body}</div>`;
    card.querySelector('.like-btn').onclick = function() {
      likeIdea(idea.id, this);
    };
    ideasList.appendChild(card);
  });
}
function likeIdea(id, btn) {
  fetch(API+`/ideas/${id}/like`, {method:'POST'}).then(()=>{
    btn.classList.add('liked');
    fetchIdeas();
  });
}
document.getElementById('ideaForm').onsubmit = function(e) {
  e.preventDefault();
  const title = document.getElementById('ideaTitle').value.trim();
  const body = document.getElementById('ideaBody').value.trim();
  if(title && body) {
    fetch(API+'/ideas', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({title,body})
    }).then(()=>{
      this.reset();
      fetchIdeas();
    });
  }
};
fetchIdeas();
fetchUpdates();
// Nav injecteren
fetch('nav.html').then(r=>r.text()).then(html=>{document.getElementById('main-nav').innerHTML=html;});
