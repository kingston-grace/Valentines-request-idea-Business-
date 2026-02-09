// Chat widget functionality
let chatHistory = [];

const chatButton = document.getElementById('chatButton');
const chatPanel = document.getElementById('chatPanel');
const chatClose = document.getElementById('chatClose');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatMessages = document.getElementById('chatMessages');
const typingIndicator = document.getElementById('typingIndicator');

// Toggle chat panel
chatButton.addEventListener('click', () => {
    chatPanel.classList.toggle('open');
    if (chatPanel.classList.contains('open')) {
        chatInput.focus();
    }
});

chatClose.addEventListener('click', () => {
    chatPanel.classList.remove('open');
});

// Send message
async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message to UI
    addMessage(message, 'user');
    chatInput.value = '';
    
    // Add to history
    chatHistory.push({ role: 'user', content: message });
    
    // Show typing indicator
    typingIndicator.classList.add('show');
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        // Get bot response
        const reply = await sendChatMessage(message, chatHistory.slice(-10)); // Last 10 messages
        
        // Add bot response to history
        chatHistory.push({ role: 'assistant', content: reply });
        
        // Add bot message to UI
        addMessage(reply, 'bot');
    } catch (error) {
        console.error('Error sending message:', error);
        addMessage("Sorry babe, something went wrong! Try again? 😌", 'bot');
    } finally {
        typingIndicator.classList.remove('show');
    }
}

// Add message to chat UI
function addMessage(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send on Enter key
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Send button click
chatSend.addEventListener('click', sendMessage);
