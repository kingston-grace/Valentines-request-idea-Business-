// Main app functionality
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const successOverlay = document.getElementById('successOverlay');
const confettiContainer = document.getElementById('confettiContainer');
const buttonsContainer = document.getElementById('buttonsContainer');

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

// NO button runaway behavior
let noButtonMoved = false;

function moveNoButton() {
    const container = buttonsContainer.getBoundingClientRect();
    const button = noBtn.getBoundingClientRect();
    
    // Calculate safe bounds (within container)
    const maxX = container.width - button.width - 20;
    const maxY = container.height - button.height - 20;
    
    // Random position within bounds
    const randomX = Math.random() * maxX - (maxX / 2);
    const randomY = Math.random() * maxY - (maxY / 2);
    const randomRot = (Math.random() - 0.5) * 30; // -15 to 15 degrees
    
    // Set CSS variables for transform
    noBtn.style.setProperty('--random-x', randomX);
    noBtn.style.setProperty('--random-y', randomY);
    noBtn.style.setProperty('--random-rot', randomRot);
    
    noButtonMoved = true;
}

// Move NO button on hover (desktop)
noBtn.addEventListener('mouseenter', () => {
    if (!noButtonMoved) {
        moveNoButton();
    }
});

// Move NO button on touch/mobile
noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moveNoButton();
    // Show playful message if they somehow click it
    setTimeout(() => {
        if (noButtonMoved) {
            alert("Eish babe 😭 you're KUTUBWIDA... try again 😌");
            moveNoButton(); // Move again
        }
    }, 100);
});

// Also move on click attempt
noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    moveNoButton();
    alert("Eish babe 😭 you're KUTUBWIDA... try again 😌");
    moveNoButton(); // Move again
});

// Confetti animation
function createConfetti() {
    const confettiCount = 50;
    const types = ['heart', 'rose', 'regular'];
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            const type = types[Math.floor(Math.random() * types.length)];
            
            confetti.className = `confetti ${type}`;
            
            if (type === 'heart') {
                confetti.textContent = '💖';
            }
            
            // Random starting position
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            
            confettiContainer.appendChild(confetti);
            
            // Remove after animation
            setTimeout(() => {
                confetti.remove();
            }, 4000);
        }, i * 30); // Stagger the creation
    }
}
