// Initialize Socket.io connection
const socket = io('https://tagbis-casino-live-chat.onrender.com');

// Chat application state
let username = localStorage.getItem('chatUsername') || '';
let messages = [];
let typingTimeout;
let currentChannel = 'global';
let replyingTo = null;
let editingMessage = null;
let darkMode = localStorage.getItem('darkMode') === 'true';
let onlineUsers = [];
let privateChats = new Map();

// Emoji list
const emojis = ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','😟','🙁','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾','🙈','🙉','🙊','💋','💌','💘','💝','💖','💗','💓','💞','💕','💟','❣️','💔','❤️','🧡','💛','💚','💙','💜','🤎','🖤','🤍','💯','💢','💥','💫','💦','💨','🕳️','💣','💬','👁️','🗨️','🗯️','💭','💤','👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁️','👅','👄','🎰','🎲','🎯','🎮','🕹️','🎳','♠️','♥️','♦️','♣️','🃏','🀄','🎴','💰','💴','💵','💶','💷','💸','💳','🏆','🥇','🥈','🥉','🏅','🎖️','🍒','🍋','🍊','🍉','🍇','🍓','🍈','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🫐','🥝','🍅','🫒','🥥','🥑','🍆','🥔','🥕','🌽','🌶️','🫑','🥒','🥬','🥦','🧄','🧅','🍄','🥜','🌰','🍞','🥐','🥖','🫓','🥨','🥯','🥞','🧇','🧀','🍖','🍗','🥩','🥓','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🫔','🥙','🧆','🥚','🍳','🥘','🍲','🫕','🥣','🥗','🍿','🧈','🧂','🥫','🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍠','🍢','🍣','🍤','🍥','🥮','🍡','🥟','🥠','🥡','🦀','🦞','🦐','🦑','🦪','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍯','🍼','🥛','☕','🫖','🍵','🍶','🍾','🍷','🍸','🍹','🍺','🍻','🥂','🥃','🥤','🧋','🧃','🧉','🧊','⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤼','🤸','🤺','⛹️','🤾','🏌️','🏇','🧘','🏄','🏊','🤽','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖️','🏵️','🎗️','🎫','🎟️','🎪','🤹','🎭','🩰','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🪘','🎷','🎺','🪗','🎸','🪕','🎻','🎲','♟️','🎯','🎳','🎮','🎰','🧩'];

// DOM elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const usernameInput = document.getElementById('usernameInput');
const onlineCount = document.getElementById('onlineCount');
const emojiButton = document.getElementById('emojiButton');
const emojiPicker = document.getElementById('emojiPicker');
const emojiGrid = document.getElementById('emojiGrid');
const closeEmojiPicker = document.getElementById('closeEmojiPicker');
const searchBtn = document.getElementById('searchBtn');
const searchBar = document.getElementById('searchBar');
const searchInput = document.getElementById('searchInput');
const closeSearch = document.getElementById('closeSearch');
const themeToggle = document.getElementById('themeToggle');
const toggleSidebar = document.getElementById('toggleSidebar');
const userSidebar = document.getElementById('userSidebar');
const closeSidebar = document.getElementById('closeSidebar');
const userList = document.getElementById('userList');
const fileButton = document.getElementById('fileButton');
const fileInput = document.getElementById('fileInput');

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

socket.on('userList', (users) => {
    onlineUsers = users;
    updateUserList();
});

socket.on('userJoined', (user) => {
    if (!onlineUsers.find(u => u.id === user.id)) {
        onlineUsers.push(user);
        updateUserList();
    }
});

socket.on('userLeft', (userId) => {
    onlineUsers = onlineUsers.filter(u => u.id !== userId);
    updateUserList();
});

socket.on('privateMessage', (data) => {
    addPrivateMessage(data);
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
        if (username) {
            socket.emit('registerUser', username);
        }
    });
    
    // Emoji picker
    emojiButton.addEventListener('click', toggleEmojiPicker);
    closeEmojiPicker.addEventListener('click', hideEmojiPicker);
    
    // Populate emoji grid
    emojis.forEach(emoji => {
        const btn = document.createElement('button');
        btn.className = 'emoji-item';
        btn.textContent = emoji;
        btn.addEventListener('click', () => {
            messageInput.value += emoji;
            messageInput.focus();
        });
        emojiGrid.appendChild(btn);
    });
    
    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
        if (!emojiPicker.contains(e.target) && !emojiButton.contains(e.target)) {
            hideEmojiPicker();
        }
    });
    
    // Search functionality
    searchBtn.addEventListener('click', toggleSearch);
    closeSearch.addEventListener('click', toggleSearch);
    searchInput.addEventListener('input', searchMessages);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    if (darkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }
    
    // User sidebar
    toggleSidebar.addEventListener('click', () => userSidebar.classList.toggle('open'));
    closeSidebar.addEventListener('click', () => userSidebar.classList.remove('open'));
    
    // File upload
    fileButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);
}

function sendMessage() {
    const messageText = messageInput.value.trim();
    
    if (!messageText) return;
    
    if (!username) {
        alert('Please enter a username first!');
        usernameInput.focus();
        return;
    }
    
    if (editingMessage) {
        // Edit existing message
        socket.emit('editMessage', {
            messageId: editingMessage.id,
            newText: messageText,
            channel: currentChannel
        });
        cancelEdit();
    } else {
        // Send message to server via Socket.io
        socket.emit('sendMessage', {
            username: username,
            text: messageText,
            channel: currentChannel,
            replyTo: replyingTo
        });
        cancelReply();
    }
    
    messageInput.value = '';
    messageInput.focus();
    socket.emit('stopTyping');
}

function addMessage(message, isOwn = false) {
    messages.push(message);
    
    const messageEl = document.createElement('div');
    messageEl.className = 'message';
    messageEl.dataset.messageId = message.id;
    
    // Reply preview
    if (message.replyTo) {
        const replyPreview = document.createElement('div');
        replyPreview.className = 'reply-preview';
        replyPreview.innerHTML = `<span class="reply-icon">↩</span> Replying to <strong>${message.replyTo.username}</strong>: ${message.replyTo.text.substring(0, 50)}${message.replyTo.text.length > 50 ? '...' : ''}`;
        messageEl.appendChild(replyPreview);
    }
    
    const headerEl = document.createElement('div');
    headerEl.className = 'message-header';
    
    const usernameEl = document.createElement('span');
    usernameEl.className = isOwn ? 'username own' : 'username';
    usernameEl.textContent = message.username;
    
    const timestampEl = document.createElement('span');
    timestampEl.className = 'timestamp';
    timestampEl.textContent = formatTime(new Date(message.timestamp));
    if (message.edited) {
        timestampEl.textContent += ' (edited)';
    }
    
    headerEl.appendChild(usernameEl);
    headerEl.appendChild(timestampEl);
    
    const contentEl = document.createElement('div');
    contentEl.className = 'message-content';
    contentEl.textContent = message.text;
    
    messageEl.appendChild(headerEl);
    messageEl.appendChild(contentEl);
    
    // Show image if present
    if (message.image) {
        const imgEl = document.createElement('img');
        imgEl.className = 'message-image';
        imgEl.src = message.image;
        imgEl.alt = message.fileName || 'Shared image';
        imgEl.onclick = () => window.open(message.image, '_blank');
        messageEl.appendChild(imgEl);
    }
    
    // Reactions
    const reactionsEl = document.createElement('div');
    reactionsEl.className = 'message-reactions';
    if (message.reactions) {
        Object.entries(message.reactions).forEach(([emoji, users]) => {
            if (users.length > 0) {
                const reactionBtn = document.createElement('button');
                reactionBtn.className = 'reaction-btn';
                reactionBtn.innerHTML = `${emoji} ${users.length}`;
                reactionBtn.onclick = () => toggleReaction(message.id, emoji);
                reactionsEl.appendChild(reactionBtn);
            }
        });
    }
    messageEl.appendChild(reactionsEl);
    
    // Action buttons
    const actionsEl = document.createElement('div');
    actionsEl.className = 'message-actions';
    
    const replyBtn = document.createElement('button');
    replyBtn.className = 'action-btn';
    replyBtn.innerHTML = '↩️';
    replyBtn.title = 'Reply';
    replyBtn.onclick = () => replyToMessage(message);
    actionsEl.appendChild(replyBtn);
    
    const reactBtn = document.createElement('button');
    reactBtn.className = 'action-btn';
    reactBtn.innerHTML = '❤️';
    reactBtn.title = 'React';
    reactBtn.onclick = () => toggleReaction(message.id, '❤️');
    actionsEl.appendChild(reactBtn);
    
    const thumbsBtn = document.createElement('button');
    thumbsBtn.className = 'action-btn';
    thumbsBtn.innerHTML = '👍';
    thumbsBtn.title = 'Like';
    thumbsBtn.onclick = () => toggleReaction(message.id, '👍');
    actionsEl.appendChild(thumbsBtn);
    
    const laughBtn = document.createElement('button');
    laughBtn.className = 'action-btn';
    laughBtn.innerHTML = '😂';
    laughBtn.title = 'Laugh';
    laughBtn.onclick = () => toggleReaction(message.id, '😂');
    actionsEl.appendChild(laughBtn);
    
    if (isOwn) {
        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn';
        editBtn.innerHTML = '✏️';
        editBtn.title = 'Edit';
        editBtn.onclick = () => editMessage(message);
        actionsEl.appendChild(editBtn);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Delete';
        deleteBtn.onclick = () => deleteMessage(message.id);
        actionsEl.appendChild(deleteBtn);
    }
    
    messageEl.appendChild(actionsEl);
    
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

// Emoji picker functions
function toggleEmojiPicker() {
    emojiPicker.classList.toggle('hidden');
}

function hideEmojiPicker() {
    emojiPicker.classList.add('hidden');
}

// Reaction functions
function toggleReaction(messageId, emoji) {
    socket.emit('toggleReaction', {
        messageId,
        emoji,
        username,
        channel: currentChannel
    });
}

// Reply functions
function replyToMessage(message) {
    replyingTo = { id: message.id, username: message.username, text: message.text };
    messageInput.placeholder = `Replying to ${message.username}...`;
    messageInput.focus();
    
    // Show reply indicator
    let replyIndicator = document.querySelector('.reply-indicator');
    if (!replyIndicator) {
        replyIndicator = document.createElement('div');
        replyIndicator.className = 'reply-indicator';
        messageInput.parentElement.insertBefore(replyIndicator, messageInput);
    }
    replyIndicator.innerHTML = `<span>↩ Replying to <strong>${message.username}</strong></span><button onclick="cancelReply()">✕</button>`;
    replyIndicator.style.display = 'flex';
}

function cancelReply() {
    replyingTo = null;
    messageInput.placeholder = 'Type a message...';
    const replyIndicator = document.querySelector('.reply-indicator');
    if (replyIndicator) {
        replyIndicator.style.display = 'none';
    }
}

// Edit functions
function editMessage(message) {
    editingMessage = message;
    messageInput.value = message.text;
    messageInput.placeholder = 'Editing message...';
    messageInput.focus();
    sendButton.textContent = 'Update';
    
    // Show edit indicator
    let editIndicator = document.querySelector('.edit-indicator');
    if (!editIndicator) {
        editIndicator = document.createElement('div');
        editIndicator.className = 'edit-indicator';
        messageInput.parentElement.insertBefore(editIndicator, messageInput);
    }
    editIndicator.innerHTML = `<span>✏️ Editing message</span><button onclick="cancelEdit()">✕</button>`;
    editIndicator.style.display = 'flex';
}

function cancelEdit() {
    editingMessage = null;
    messageInput.value = '';
    messageInput.placeholder = 'Type a message...';
    sendButton.textContent = 'Send';
    const editIndicator = document.querySelector('.edit-indicator');
    if (editIndicator) {
        editIndicator.style.display = 'none';
    }
}

// Delete function
function deleteMessage(messageId) {
    if (confirm('Delete this message?')) {
        socket.emit('deleteMessage', {
            messageId,
            channel: currentChannel
        });
    }
}

// Search functionality
function toggleSearch() {
    searchBar.classList.toggle('hidden');
    if (!searchBar.classList.contains('hidden')) {
        searchInput.focus();
    } else {
        searchInput.value = '';
        clearSearchHighlight();
    }
}

function searchMessages() {
    const query = searchInput.value.toLowerCase().trim();
    clearSearchHighlight();
    
    if (!query) return;
    
    const messageElements = chatMessages.querySelectorAll('.message');
    let foundCount = 0;
    
    messageElements.forEach(el => {
        const content = el.querySelector('.message-content');
        const text = content.textContent.toLowerCase();
        
        if (text.includes(query)) {
            el.classList.add('search-highlight');
            foundCount++;
        }
    });
    
    if (foundCount > 0) {
        const firstMatch = chatMessages.querySelector('.search-highlight');
        if (firstMatch) {
            firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

function clearSearchHighlight() {
    chatMessages.querySelectorAll('.search-highlight').forEach(el => {
        el.classList.remove('search-highlight');
    });
}

// Theme toggle
function toggleTheme() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', darkMode);
    themeToggle.textContent = darkMode ? '☀️' : '🌙';
}

// User list functions
function updateUserList() {
    userList.innerHTML = '';
    
    onlineUsers.forEach(user => {
        const userEl = document.createElement('div');
        userEl.className = 'user-item';
        
        const avatarEl = document.createElement('div');
        avatarEl.className = 'user-avatar';
        avatarEl.textContent = user.username ? user.username[0].toUpperCase() : '?';
        
        const nameEl = document.createElement('span');
        nameEl.className = 'user-name';
        nameEl.textContent = user.username || 'Anonymous';
        
        const dmBtn = document.createElement('button');
        dmBtn.className = 'dm-btn';
        dmBtn.textContent = '💬';
        dmBtn.title = 'Direct Message';
        dmBtn.onclick = () => startPrivateChat(user);
        
        userEl.appendChild(avatarEl);
        userEl.appendChild(nameEl);
        if (user.id !== socket.id) {
            userEl.appendChild(dmBtn);
        }
        
        userList.appendChild(userEl);
    });
}

function startPrivateChat(user) {
    alert(`Private messaging with ${user.username} - Coming soon! This will open a private chat window.`);
    // TODO: Implement private chat window
}

function addPrivateMessage(data) {
    // TODO: Handle private messages in a separate window/panel
    console.log('Private message received:', data);
}

// File upload
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!username) {
        alert('Please enter a username first!');
        usernameInput.focus();
        return;
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
    }
    
    // For images, show preview
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const imageData = event.target.result;
            socket.emit('sendMessage', {
                username: username,
                text: `📷 Shared an image: ${file.name}`,
                channel: currentChannel,
                image: imageData,
                fileName: file.name
            });
        };
        reader.readAsDataURL(file);
    } else {
        // For other files, just send file info
        socket.emit('sendMessage', {
            username: username,
            text: `📎 Shared a file: ${file.name}`,
            channel: currentChannel,
            fileName: file.name,
            fileSize: formatFileSize(file.size)
        });
    }
    
    fileInput.value = '';
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Socket listeners for new features
socket.on('messageEdited', (data) => {
    const messageEl = document.querySelector(`[data-message-id="${data.messageId}"]`);
    if (messageEl) {
        const contentEl = messageEl.querySelector('.message-content');
        const timestampEl = messageEl.querySelector('.timestamp');
        contentEl.textContent = data.newText;
        timestampEl.textContent = timestampEl.textContent.split(' ')[0] + ' (edited)';
    }
});

socket.on('messageDeleted', (data) => {
    const messageEl = document.querySelector(`[data-message-id="${data.messageId}"]`);
    if (messageEl) {
        messageEl.remove();
    }
});

socket.on('reactionUpdated', (data) => {
    const messageEl = document.querySelector(`[data-message-id="${data.messageId}"]`);
    if (messageEl) {
        const reactionsEl = messageEl.querySelector('.message-reactions');
        reactionsEl.innerHTML = '';
        Object.entries(data.reactions).forEach(([emoji, users]) => {
            if (users.length > 0) {
                const reactionBtn = document.createElement('button');
                reactionBtn.className = 'reaction-btn';
                reactionBtn.innerHTML = `${emoji} ${users.length}`;
                reactionBtn.onclick = () => toggleReaction(data.messageId, emoji);
                reactionsEl.appendChild(reactionBtn);
            }
        });
    }
});

// Initialize the app
init();
animateSlots();
