// Frontend chatfunctie met echte mensen (Socket.io)
const socket = io(window.config.apiUrl, { withCredentials: true });
const chatBox = document.getElementById('chatbox');
const messagesDiv = document.getElementById('messages');
const input = document.getElementById('chatinput');
const sendBtn = document.getElementById('sendbtn');

function appendMsg(msgObj, self) {
  const el = document.createElement('div');
  el.className = 'chat-msg' + (self ? ' self' : '');
  el.innerHTML = `<strong>${msgObj.user || 'Gast'}:</strong> ${msgObj.message}`;
  messagesDiv.appendChild(el);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

sendBtn.onclick = () => {
  const msg = input.value.trim();
  if (!msg) return;
  const user = localStorage.getItem('userEmail') || 'Gast';
  const msgObj = { user, message: msg };
  socket.emit('chat message', msgObj);
  appendMsg(msgObj, true);
  input.value = '';
};

socket.on('chat message', (msgObj) => {
  appendMsg(msgObj, false);
});

// Haal chatgeschiedenis op
socket.emit('get history');
socket.on('chat history', (msgs) => {
  messagesDiv.innerHTML = '';
  msgs.forEach(msgObj => appendMsg(msgObj, msgObj.user === (localStorage.getItem('userEmail') || 'Gast')));
});
