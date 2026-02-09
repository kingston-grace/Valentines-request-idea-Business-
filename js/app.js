// Main app functionality
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const successOverlay = document.getElementById('successOverlay');
const confettiContainer = document.getElementById('confettiContainer');
const buttonsContainer = document.getElementById('buttonsContainer');

// Celebration lines array (cleaned and consistent)
const celebrationLines = [
    "Yaaay babe 💗",
    "That's my babe 💗",
    "Good girl, Mai Mhembere 💗",
    "Good girl, Mai Ropa 💗",
    "Yaaay, Mai Mhembere 💗",
];

// Select celebration line on page load (random, but fixed for session)
const celebrationText = celebrationLines[Math.floor(Math.random() * celebrationLines.length)];

// Scatter floating hearts and roses randomly so they never form a stuck column in the corner
function initFloatingBackground() {
    const container = document.getElementById('heartsBackground');
    if (!container) return;
    const hearts = ['💖', '💕', '💗'];
    const countHearts = 22;
    const countRoses = 6;
    for (let i = 0; i < countHearts; i++) {
        const el = document.createElement('div');
        el.className = 'heart float-item';
        el.textContent = hearts[i % hearts.length];
        el.style.setProperty('--left', Math.random() * 100 + '%');
        el.style.setProperty('--delay', Math.random() * 18 + 's');
        el.style.setProperty('--duration', (14 + Math.random() * 10) + 's');
        container.appendChild(el);
    }
    for (let i = 0; i < countRoses; i++) {
        const el = document.createElement('div');
        el.className = 'rose float-item';
        el.textContent = '🌹';
        el.style.setProperty('--left', Math.random() * 100 + '%');
        el.style.setProperty('--delay', Math.random() * 20 + 's');
        el.style.setProperty('--duration', (16 + Math.random() * 8) + 's');
        container.appendChild(el);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initFloatingBackground();
    const successTitle = document.getElementById('successTitle');
    if (successTitle) {
        successTitle.textContent = celebrationText;
    }
    // Start gentle card float after entrance
    const card = document.getElementById('mainCard');
    if (card) {
        setTimeout(() => card.classList.add('cardEntranceDone'), 1000);
    }
});

// YES button handler
yesBtn.addEventListener('click', () => {
    // Hide buttons
    buttonsContainer.style.opacity = '0';
    buttonsContainer.style.pointerEvents = 'none';
    
    // Trigger confetti
    createConfetti();
    
    // Show success overlay after a brief delay
    setTimeout(() => {
        successOverlay.classList.add('show');
    }, 500);
});

// NO button teleport behavior - appears and disappears around the page
let noButtonInterval = null;
let initialNoButtonPosition = null;

function getRandomPosition() {
    const button = noBtn.getBoundingClientRect();
    const buttonWidth = button.width;
    const buttonHeight = button.height;
    
    // Get viewport dimensions
    const maxX = window.innerWidth - buttonWidth - 20;
    const maxY = window.innerHeight - buttonHeight - 20;
    
    // Random position within viewport
    const randomX = Math.max(20, Math.random() * maxX);
    const randomY = Math.max(20, Math.random() * maxY);
    
    return { x: randomX, y: randomY };
}

function teleportNoButton() {
    // Fade out
    noBtn.style.opacity = '0';
    noBtn.style.transform = 'scale(0.5)';
    noBtn.style.pointerEvents = 'none';
    
    setTimeout(() => {
        // Move to new position
        const newPos = getRandomPosition();
        noBtn.style.left = newPos.x + 'px';
        noBtn.style.top = newPos.y + 'px';
        
        // Fade in at new position
        setTimeout(() => {
            noBtn.style.opacity = '1';
            noBtn.style.transform = 'scale(1)';
            noBtn.style.pointerEvents = 'auto';
        }, 100);
    }, 200);
}

function startNoButtonTeleport() {
    // Store initial position relative to buttons container
    if (!initialNoButtonPosition) {
        const containerRect = buttonsContainer.getBoundingClientRect();
        const buttonRect = noBtn.getBoundingClientRect();
        initialNoButtonPosition = {
            x: buttonRect.left - containerRect.left,
            y: buttonRect.top - containerRect.top
        };
    }
    
    // Convert to fixed positioning
    const containerRect = buttonsContainer.getBoundingClientRect();
    noBtn.style.position = 'fixed';
    noBtn.style.left = (containerRect.left + initialNoButtonPosition.x) + 'px';
    noBtn.style.top = (containerRect.top + initialNoButtonPosition.y) + 'px';
    
    // Start teleporting every 2-3 seconds
    if (!noButtonInterval) {
        noButtonInterval = setInterval(() => {
            teleportNoButton();
        }, 2000 + Math.random() * 1000);
    }
}

// Move NO button on hover (desktop)
noBtn.addEventListener('mouseenter', () => {
    teleportNoButton();
    startNoButtonTeleport();
});

// Move NO button on touch/mobile
noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    teleportNoButton();
    startNoButtonTeleport();
});

// Also move on click attempt
noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    alert("Eish babe 😭 you're KUTUBWIDA... try again 😌");
    teleportNoButton();
    startNoButtonTeleport();
});

// Start teleporting after page load
setTimeout(() => {
    startNoButtonTeleport();
}, 1000);

// Confetti animation – varied colors and motion
function createConfetti() {
    const confettiCount = 55;
    const types = ['heart', 'heart', 'rose', 'regular'];
    const hearts = ['💖', '💕', '💗'];
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            const type = types[Math.floor(Math.random() * types.length)];
            
            confetti.className = `confetti ${type}`;
            
            if (type === 'heart') {
                confetti.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            }
            
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 0.4 + 's';
            confetti.style.animationDuration = (2.2 + Math.random() * 1.8) + 's';
            
            confettiContainer.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4500);
        }, i * 25);
    }
}
