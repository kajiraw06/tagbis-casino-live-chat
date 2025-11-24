// Initialize Socket.io connection
const socket = io('https://tagbis-casino-live-chat.onrender.com');

// Chat application state
let username = localStorage.getItem('chatUsername') || '';
let messages = [];
let typingTimeout;
let currentChannel = 'global';

// DOM elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const usernameInput = document.getElementById('usernameInput');
const onlineCount = document.getElementById('onlineCount');

// Socket.io event listeners
socket.on('connect', () => {
    console.log('✅ Connected to server');
});

socket.on('userCount', (count) => {
    onlineCount.textContent = `${count} online`;
});

socket.on('recentMessages', (msgs) => {
    msgs.forEach(msg => {
        addMessage(msg, false);
    });
});

socket.on('newMessage', (message) => {
    addMessage(message, message.socketId === socket.id);
});

socket.on('userTyping', (user) => {
    showTypingIndicator(user);
});

socket.on('userStoppedTyping', () => {
    hideTypingIndicator();
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
});

// Initialize
function init() {
    if (username) {
        usernameInput.value = username;
    }
    
    // Channel switching
    document.querySelectorAll('.channel-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchChannel(btn.dataset.channel);
        });
    });
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    messageInput.addEventListener('input', () => {
        if (username) {
            socket.emit('typing', username);
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                socket.emit('stopTyping');
            }, 1000);
        }
    });
    
    usernameInput.addEventListener('input', (e) => {
        username = e.target.value.trim();
        localStorage.setItem('chatUsername', username);
    });
}

function sendMessage() {
    const messageText = messageInput.value.trim();
    
    if (!messageText) return;
    
    if (!username) {
        alert('Please enter a username first!');
        usernameInput.focus();
        return;
    }
    
    // Send message to server via Socket.io
    socket.emit('sendMessage', {
        username: username,
        text: messageText,
        channel: currentChannel
    });
    
    messageInput.value = '';
    messageInput.focus();
    socket.emit('stopTyping');
}

function addMessage(message, isOwn = false) {
    messages.push(message);
    
    const messageEl = document.createElement('div');
    messageEl.className = 'message';
    
    const headerEl = document.createElement('div');
    headerEl.className = 'message-header';
    
    const usernameEl = document.createElement('span');
    usernameEl.className = isOwn ? 'username own' : 'username';
    usernameEl.textContent = message.username;
    
    const timestampEl = document.createElement('span');
    timestampEl.className = 'timestamp';
    timestampEl.textContent = formatTime(new Date(message.timestamp));
    
    headerEl.appendChild(usernameEl);
    headerEl.appendChild(timestampEl);
    
    const contentEl = document.createElement('div');
    contentEl.className = 'message-content';
    contentEl.textContent = message.text;
    
    messageEl.appendChild(headerEl);
    messageEl.appendChild(contentEl);
    
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Keep only last 100 messages in DOM
    if (chatMessages.children.length > 100) {
        chatMessages.removeChild(chatMessages.firstChild);
    }
}

function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function showTypingIndicator(username) {
    let indicator = document.getElementById('typingIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'typingIndicator';
        indicator.className = 'typing-indicator';
        chatMessages.appendChild(indicator);
    }
    indicator.textContent = `${username} is typing...`;
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

function switchChannel(channel) {
    currentChannel = channel;
    
    // Update active button
    document.querySelectorAll('.channel-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.channel === channel) {
            btn.classList.add('active');
        }
    });
    
    // Clear current messages
    chatMessages.innerHTML = '';
    messages = [];
    
    // Join new channel
    socket.emit('joinChannel', channel);
}

// Animate slot symbols randomly
function animateSlots() {
    const slotSymbols = ['🍒', '💎', '🍋', '⭐', '7️⃣', '🍇', '💰', '🍊', '🔔', '🍉', '🎰', '💵'];
    const slotReels = document.querySelectorAll('.slot-reel');
    
    slotReels.forEach((reel, index) => {
        setInterval(() => {
            const randomSymbol = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
            reel.textContent = randomSymbol;
        }, 3000 + (index * 500));
    });
}

// Initialize the app
init();
animateSlots();
