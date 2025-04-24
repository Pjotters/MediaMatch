// chatrooms.js
// Frontend: chatrooms aanmaken/joinen/listen
export async function createChatroom(name) {
  const res = await fetch(`${window.config.apiUrl}/api/chatroom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    body: JSON.stringify({ name })
  });
  return await res.json();
}
export async function getChatrooms() {
  const res = await fetch(`${window.config.apiUrl}/api/chatrooms`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  return await res.json();
}
