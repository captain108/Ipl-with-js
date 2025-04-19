const socket = io();

// Chat message elements
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

// Fetch previous chat history from the server
fetch('/messages')
  .then(response => response.json())
  .then(messages => {
    messages.forEach(msg => {
      const messageElement = document.createElement("div");
      messageElement.textContent = `${msg.username}: ${msg.message}`;
      chatMessages.appendChild(messageElement);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
  });

// Send message to the server when the send button is clicked
sendBtn.addEventListener("click", () => {
  const message = chatInput.value.trim();
  if (message) {
    socket.emit('chat message', { username: 'User', message });
    chatInput.value = ''; // Clear input
  }
});

// Listen for new messages from the server and append them
socket.on('chat message', (data) => {
  const messageElement = document.createElement("div");
  messageElement.textContent = `${data.username}: ${data.message}`;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
});

// Listen for chat history from the server (when a user connects)
socket.on('chat history', (messages) => {
  messages.forEach(msg => {
    const messageElement = document.createElement("div");
    messageElement.textContent = `${msg.username}: ${msg.message}`;
    chatMessages.appendChild(messageElement);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
});
