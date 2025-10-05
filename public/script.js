const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

let conversationHistory = [];

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Add user message to history and UI
  conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });
  appendMessage('user', userMessage);
  input.value = '';

  // Show a thinking indicator
  const thinkingMessage = appendMessage('bot', 'Gemini is thinking...');

  // Prepare the data for the backend
  // The backend expects the full history and the new message separately
  const historyForAPI = conversationHistory.slice(0, -1); // All but the last message
  const messageForAPI = userMessage;

  fetch('http://localhost:3000/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      history: historyForAPI,
      message: messageForAPI,
    }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    })
    .then((data) => {
      if (data.success) {
        const botMessage = data.data;
        // Add bot response to history and update UI
        conversationHistory.push({ role: 'model', parts: [{ text: botMessage }] });
        thinkingMessage.textContent = botMessage; // Update the "thinking" message with the actual response
      } else {
        throw new Error(data.message || 'API returned an error');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      thinkingMessage.textContent = 'Sorry, something went wrong. Please try again.';
      thinkingMessage.classList.add('error');
    });
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg; // Return the message element to allow modification
}
