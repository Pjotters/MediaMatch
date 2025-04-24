// reviews.js
// Reviews (frontend): plaatsen, tonen, ophalen
export async function postReview(fotograafId, rating, text) {
  await fetch(`${window.config.apiUrl}/api/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    body: JSON.stringify({ fotograafId, rating, text })
  });
}
export async function getReviews(fotograafId) {
  const res = await fetch(`${window.config.apiUrl}/api/reviews?fotograafId=${encodeURIComponent(fotograafId)}`);
  return await res.json();
}
