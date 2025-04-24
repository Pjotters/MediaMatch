// ai-search.js
// Frontend: AI-zoekhulp en AI-matching
export async function aiSearch(query) {
  const res = await fetch(`${window.config.apiUrl}/api/ai-search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    body: JSON.stringify({ query })
  });
  return (await res.json()).result;
}
export async function aiMatch() {
  const res = await fetch(`${window.config.apiUrl}/api/ai-match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  return (await res.json()).matches;
}
