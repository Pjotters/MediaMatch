// moodboard.js
// Moodboard functionaliteit (frontend)
export function addToMoodboard(photo) {
  let moodboard = JSON.parse(localStorage.getItem('moodboard')||'[]');
  if (!moodboard.some(p => p.id === photo.id)) moodboard.push(photo);
  localStorage.setItem('moodboard', JSON.stringify(moodboard));
}
export function removeFromMoodboard(photoId) {
  let moodboard = JSON.parse(localStorage.getItem('moodboard')||'[]');
  moodboard = moodboard.filter(p => p.id !== photoId);
  localStorage.setItem('moodboard', JSON.stringify(moodboard));
}
export function getMoodboard() {
  return JSON.parse(localStorage.getItem('moodboard')||'[]');
}
