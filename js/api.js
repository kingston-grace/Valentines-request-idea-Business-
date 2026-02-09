// API wrapper for chat endpoint
const API_BASE = window.location.origin;

async function sendChatMessage(message, history = []) {
    try {
        const response = await fetch(`${API_BASE}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                history: history
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.reply;
    } catch (error) {
        console.error('Chat API error:', error);
        // Fallback response if API fails
        return "Eish babe, something went wrong! But you know I'd still convince you to say yes 😌💖";
    }
}
