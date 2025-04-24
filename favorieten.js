// favorieten.js
// Favorieten functionaliteit (frontend)
export function addToFavorieten(fotograaf) {
  let favs = JSON.parse(localStorage.getItem('favorieten')||'[]');
  if (!favs.some(f => f.id === fotograaf.id)) favs.push(fotograaf);
  localStorage.setItem('favorieten', JSON.stringify(favs));
}
export function removeFromFavorieten(fotograafId) {
  let favs = JSON.parse(localStorage.getItem('favorieten')||'[]');
  favs = favs.filter(f => f.id !== fotograafId);
  localStorage.setItem('favorieten', JSON.stringify(favs));
}
export function getFavorieten() {
  return JSON.parse(localStorage.getItem('favorieten')||'[]');
}
