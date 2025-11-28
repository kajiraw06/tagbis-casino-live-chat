// Initialize Socket.io connection
const socket = io('https://tagbis-casino-live-chat.onrender.com');

// Chat application state
let username = localStorage.getItem('chatUsername') || '';
let userLevel = localStorage.getItem('userLevel') || 'regular'; // regular, vip, moderator, admin
let userCoins = parseInt(localStorage.getItem('userCoins')) || 100; // Virtual currency
let messages = [];
let typingTimeout;
let currentChannel = 'global';
let availableRooms = ['global', 'english', 'spanish', 'vip', 'support'];
let replyingTo = null;
let editingMessage = null;
let darkMode = localStorage.getItem('darkMode') === 'true';
let onlineUsers = [];
let privateChats = new Map();
let mutedUsers = JSON.parse(localStorage.getItem('mutedUsers') || '[]');
let mentionSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKbj8LVkHQU5kdfy0HgsBS');
let messageSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNw');

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
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
const userList = document.getElementById('userList');
const fileButton = document.getElementById('fileButton');
const fileInput = document.getElementById('fileInput');

// Socket.io event listeners
socket.on('connect', () => {
    console.log('✅ Connected to server');
    // Auto-register if a username already exists (e.g., saved in localStorage)
    if (username) {
        socket.emit('registerUser', {
            username: username,
            level: userLevel,
            coins: userCoins,
            joinDate: localStorage.getItem('joinDate') || new Date().toISOString()
        });
    }
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

socket.on('tipReceived', (data) => {
    userCoins += data.amount;
    localStorage.setItem('userCoins', userCoins);
    updateCoinDisplay();
    showTipAnimation(data.amount);
    showSystemMessage(`${data.from} tipped you ${data.amount} coins! 💰`);
    if (messageSound && !document.hidden) {
        messageSound.play().catch(() => {});
    }
});

socket.on('tipSent', (data) => {
    showSystemMessage(`💰 ${data.from} tipped ${data.to} ${data.amount} coins!`);
});

// Initialize
function init() {
    // Request notification permission
    requestNotificationPermission();
    
    if (username) {
        usernameInput.value = username;
    }
    
    // Update coin display
    updateCoinDisplay();
    
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
            if (!localStorage.getItem('joinDate')) {
                localStorage.setItem('joinDate', new Date().toISOString());
            }
            socket.emit('registerUser', {
                username: username,
                level: userLevel,
                coins: userCoins,
                joinDate: localStorage.getItem('joinDate')
            });
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
    toggleSidebar.addEventListener('click', () => {
        userSidebar.classList.toggle('open');
        sidebarBackdrop.classList.toggle('active');
    });
    
    closeSidebar.addEventListener('click', () => {
        userSidebar.classList.remove('open');
        sidebarBackdrop.classList.remove('active');
    });
    
    sidebarBackdrop.addEventListener('click', () => {
        userSidebar.classList.remove('open');
        sidebarBackdrop.classList.remove('active');
    });
    
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
    
    // Check for commands
    if (processChatCommand(messageText)) {
        messageInput.value = '';
        messageInput.focus();
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
            userLevel: userLevel,
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
    // Check if user is muted
    if (mutedUsers.includes(message.username) && !isOwn) {
        return;
    }
    
    messages.push(message);
    
    const messageEl = document.createElement('div');
    messageEl.className = 'message';
    messageEl.dataset.messageId = message.id;
    messageEl.dataset.username = message.username;
    
    // Reply preview
    if (message.replyTo) {
        const replyPreview = document.createElement('div');
        replyPreview.className = 'reply-preview';
        replyPreview.innerHTML = `<span class="reply-icon">↩</span> Replying to <strong>${escapeHtml(message.replyTo.username)}</strong>: ${escapeHtml(message.replyTo.text.substring(0, 50))}${message.replyTo.text.length > 50 ? '...' : ''}`;
        messageEl.appendChild(replyPreview);
    }
    
    const headerEl = document.createElement('div');
    headerEl.className = 'message-header';
    
    // Username with badge
    const usernameContainer = document.createElement('span');
    usernameContainer.className = 'username-container';
    
    const usernameEl = document.createElement('span');
    usernameEl.className = isOwn ? 'username own' : 'username';
    usernameEl.textContent = message.username;
    usernameEl.style.cursor = 'pointer';
    usernameEl.onclick = () => showUserProfile(message.username, message.userLevel || 'regular');
    
    // Add level badge
    const badgeEl = document.createElement('span');
    badgeEl.className = `user-badge ${message.userLevel || 'regular'}`;
    const badges = {
        'admin': '👑',
        'moderator': '🛡️',
        'vip': '⭐',
        'regular': ''
    };
    badgeEl.textContent = badges[message.userLevel || 'regular'];
    
    usernameContainer.appendChild(usernameEl);
    if (badgeEl.textContent) {
        usernameContainer.appendChild(badgeEl);
    }
    
    const timestampEl = document.createElement('span');
    timestampEl.className = 'timestamp';
    timestampEl.textContent = formatTime(new Date(message.timestamp));
    if (message.edited) {
        timestampEl.textContent += ' (edited)';
    }
    
    headerEl.appendChild(usernameContainer);
    headerEl.appendChild(timestampEl);
    
    const contentEl = document.createElement('div');
    contentEl.className = 'message-content';
    
    // Process message for formatting, mentions, and commands
    const processedText = processMessageText(message.text);
    contentEl.innerHTML = processedText;
    
    // Check for mentions of current user
    if (message.text.includes(`@${username}`) && !isOwn) {
        messageEl.classList.add('mentioned');
        if (mentionSound && !document.hidden) {
            mentionSound.play().catch(() => {});
        }
        showNotification(`${message.username} mentioned you`, message.text.substring(0, 50));
    }
    
    messageEl.appendChild(headerEl);
    messageEl.appendChild(contentEl);

    // Mobile: tap to toggle actions visibility
    messageEl.addEventListener('click', () => {
        if (window.matchMedia('(max-width: 768px)').matches) {
            const alreadyShown = messageEl.classList.contains('show-actions');
            // Hide actions on other messages
            document.querySelectorAll('.message.show-actions').forEach(el => {
                if (el !== messageEl) el.classList.remove('show-actions');
            });
            // Toggle current
            if (alreadyShown) {
                messageEl.classList.remove('show-actions');
            } else {
                messageEl.classList.add('show-actions');
            }
        }
    });
    
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
    
    const plusBtn = document.createElement('button');
    plusBtn.className = 'action-btn plus-btn';
    plusBtn.innerHTML = '➕';
    plusBtn.title = 'More reactions';
    plusBtn.onclick = (e) => {
        e.stopPropagation();
        showReactionPicker(message.id, plusBtn);
    };
    actionsEl.appendChild(plusBtn);
    
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

function showReactionPicker(messageId, buttonElement) {
    // Remove any existing reaction picker
    const existingPicker = document.querySelector('.reaction-picker');
    if (existingPicker) {
        existingPicker.remove();
        return;
    }
    
    // Create reaction picker
    const picker = document.createElement('div');
    picker.className = 'reaction-picker';
    
    // Add popular reactions at the top
    const popularReactions = ['❤️', '👍', '😂', '😮', '😢', '😡', '🎉', '🔥'];
    const popularSection = document.createElement('div');
    popularSection.className = 'reaction-popular';
    
    popularReactions.forEach(emoji => {
        const btn = document.createElement('button');
        btn.className = 'reaction-emoji-btn';
        btn.textContent = emoji;
        btn.onclick = () => {
            toggleReaction(messageId, emoji);
            picker.remove();
        };
        popularSection.appendChild(btn);
    });
    
    picker.appendChild(popularSection);
    
    // Add divider
    const divider = document.createElement('div');
    divider.className = 'reaction-divider';
    picker.appendChild(divider);
    
    // Add search
    const searchContainer = document.createElement('div');
    searchContainer.className = 'reaction-search';
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search emoji...';
    searchInput.className = 'reaction-search-input';
    searchContainer.appendChild(searchInput);
    picker.appendChild(searchContainer);
    
    // Add all emojis grid
    const grid = document.createElement('div');
    grid.className = 'reaction-emoji-grid';
    
    emojis.forEach(emoji => {
        const btn = document.createElement('button');
        btn.className = 'reaction-emoji-btn';
        btn.textContent = emoji;
        btn.onclick = () => {
            toggleReaction(messageId, emoji);
            picker.remove();
        };
        grid.appendChild(btn);
    });
    
    picker.appendChild(grid);
    
    // Position the picker at the bottom of the screen
    document.body.appendChild(picker);
    
    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const buttons = grid.querySelectorAll('.reaction-emoji-btn');
        
        buttons.forEach(btn => {
            if (query === '') {
                btn.style.display = '';
            } else {
                // Simple emoji search - in a real app you'd have emoji names
                btn.style.display = 'none';
            }
        });
    });
    
    // Close picker when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeReactionPicker(e) {
            if (!picker.contains(e.target) && e.target !== buttonElement) {
                picker.remove();
                document.removeEventListener('click', closeReactionPicker);
            }
        });
    }, 0);
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

    if (!onlineUsers || onlineUsers.length === 0) {
        const empty = document.createElement('div');
        empty.style.color = '#7a8b99';
        empty.style.textAlign = 'center';
        empty.style.padding = '16px';
        empty.textContent = 'No users online yet.';
        userList.appendChild(empty);
        return;
    }

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
        fileInput.value = '';
        return;
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    // Allow larger raw file, but compress images before sending to stay under 5MB
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    const MAX_DIMENSION = 1280; // max width/height for mobile uploads
    const JPEG_QUALITY = 0.7; // compression quality

    const reader = new FileReader();

    reader.onerror = (error) => {
        console.error('File reading error:', error);
        alert('Error reading file. Please try again.');
        fileInput.value = '';
    };

    reader.onload = async (event) => {
        try {
            const originalDataUrl = event.target.result;

            let payloadDataUrl = originalDataUrl;
            let payloadType = file.type;

            if (isImage) {
                // Compress and resize image on mobile to avoid oversized payloads
                payloadDataUrl = await compressImage(originalDataUrl, MAX_DIMENSION, JPEG_QUALITY);
                payloadType = 'image/jpeg';
            }

            // Final size check
            const approxSize = Math.ceil((payloadDataUrl.length * 3) / 4); // base64 size approximation
            if (approxSize > MAX_SIZE_BYTES) {
                alert('Image is too large even after compression. Please choose a smaller image.');
                fileInput.value = '';
                return;
            }

            const fileTypeIcon = isImage ? '📷' : (isVideo ? '🎥' : '📎');

            socket.emit('sendMessage', {
                username: username,
                text: `${fileTypeIcon} Shared ${isImage ? 'an image' : isVideo ? 'a video' : 'a file'}: ${file.name}`,
                channel: currentChannel,
                image: isImage || isVideo ? payloadDataUrl : undefined,
                fileName: file.name,
                fileType: payloadType,
                fileSize: formatFileSize(approxSize)
            });

            fileInput.value = '';
        } catch (err) {
            console.error('Error preparing file:', err);
            alert('Error uploading file. Please try again.');
            fileInput.value = '';
        }
    };

    // Read as Data URL for images/videos; other files send metadata only
    if (isImage || isVideo) {
        reader.readAsDataURL(file);
    } else {
        socket.emit('sendMessage', {
            username: username,
            text: `📎 Shared a file: ${file.name}`,
            channel: currentChannel,
            fileName: file.name,
            fileSize: formatFileSize(file.size),
            fileType: file.type
        });
        fileInput.value = '';
    }
}

async function compressImage(dataUrl, maxDim, quality) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                // Scale down respecting aspect ratio
                if (width > height && width > maxDim) {
                    height = Math.round((height * maxDim) / width);
                    width = maxDim;
                } else if (height > width && height > maxDim) {
                    width = Math.round((width * maxDim) / height);
                    height = maxDim;
                } else if (width === height && width > maxDim) {
                    width = maxDim;
                    height = maxDim;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                // Improve downscale quality
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                const compressed = canvas.toDataURL('image/jpeg', quality);
                resolve(compressed);
            } catch (err) {
                reject(err);
            }
        };
        img.onerror = reject;
        img.src = dataUrl;
    });
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

// Mobile-specific improvements
if ('ontouchstart' in window) {
    // Prevent double-tap zoom on buttons
    document.querySelectorAll('button, .action-btn, .emoji-btn, .icon-btn').forEach(btn => {
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            btn.click();
        }, { passive: false });
    });
    
    // Handle mobile keyboard visibility
    let originalHeight = window.innerHeight;
    window.addEventListener('resize', () => {
        const currentHeight = window.innerHeight;
        const container = document.querySelector('.chat-container');
        
        // Keyboard opened (height decreased significantly)
        if (currentHeight < originalHeight * 0.75) {
            container.style.height = `${currentHeight}px`;
        } else {
            // Keyboard closed
            container.style.height = '100dvh';
            originalHeight = currentHeight;
        }
    });
    
    // Smooth scroll when keyboard opens
    messageInput.addEventListener('focus', () => {
        setTimeout(() => {
            messageInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
    });
    
    usernameInput.addEventListener('focus', () => {
        setTimeout(() => {
            usernameInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
    });
    
    // Improve touch scrolling in messages area
    let isScrolling;
    chatMessages.addEventListener('touchstart', () => {
        clearTimeout(isScrolling);
    });
    
    chatMessages.addEventListener('touchend', () => {
        isScrolling = setTimeout(() => {
            // Add momentum to scroll
            chatMessages.style.webkitOverflowScrolling = 'touch';
        }, 100);
    });
    
    // Prevent pull-to-refresh on chat messages
    let startY = 0;
    chatMessages.addEventListener('touchstart', (e) => {
        startY = e.touches[0].pageY;
    }, { passive: true });
    
    chatMessages.addEventListener('touchmove', (e) => {
        const y = e.touches[0].pageY;
        const scrollTop = chatMessages.scrollTop;
        
        // Prevent pull-to-refresh when scrolled to top
        if (scrollTop <= 0 && y > startY) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Initialize swipe gestures
    initSwipeGestures();
}

// Swipe gesture handler for messages
function initSwipeGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let currentMessage = null;
    let swipeIndicator = null;
    let isHorizontalSwipe = false;

    const SWIPE_THRESHOLD = 80; // Minimum distance for swipe action
    const VERTICAL_THRESHOLD = 30; // Max vertical movement to consider it horizontal

    chatMessages.addEventListener('touchstart', (e) => {
        const messageEl = e.target.closest('.message');
        if (!messageEl) return;

        currentMessage = messageEl;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isHorizontalSwipe = false;

        // Create swipe indicator if it doesn't exist
        if (!swipeIndicator) {
            swipeIndicator = document.createElement('div');
            swipeIndicator.className = 'swipe-action-indicator';
            messageEl.appendChild(swipeIndicator);
        }
    }, { passive: true });

    chatMessages.addEventListener('touchmove', (e) => {
        if (!currentMessage) return;

        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = touchX - touchStartX;
        const deltaY = touchY - touchStartY;

        // Determine if it's a horizontal swipe
        if (!isHorizontalSwipe && Math.abs(deltaX) > 10) {
            if (Math.abs(deltaY) < VERTICAL_THRESHOLD) {
                isHorizontalSwipe = true;
            }
        }

        if (isHorizontalSwipe) {
            e.preventDefault();
            
            currentMessage.classList.add('swiping');
            currentMessage.style.transform = `translateX(${deltaX}px)`;

            // Show appropriate indicator
            if (!swipeIndicator.parentElement) {
                currentMessage.appendChild(swipeIndicator);
            }

            if (deltaX > 30) {
                // Swiping right - Reply
                swipeIndicator.textContent = '↩️';
                swipeIndicator.className = 'swipe-action-indicator reply visible';
            } else if (deltaX < -30) {
                // Swiping left - Delete (only for own messages)
                const isOwn = currentMessage.querySelector('.username.own') !== null;
                if (isOwn) {
                    swipeIndicator.textContent = '🗑️';
                    swipeIndicator.className = 'swipe-action-indicator delete visible';
                }
            } else {
                swipeIndicator.classList.remove('visible');
            }

            // Haptic feedback at threshold
            if (Math.abs(deltaX) >= SWIPE_THRESHOLD && navigator.vibrate) {
                navigator.vibrate(10);
            }
        }
    }, { passive: false });

    chatMessages.addEventListener('touchend', (e) => {
        if (!currentMessage || !isHorizontalSwipe) {
            currentMessage = null;
            return;
        }

        touchEndX = e.changedTouches[0].clientX;
        const deltaX = touchEndX - touchStartX;

        currentMessage.classList.remove('swiping');
        currentMessage.classList.add('swipe-complete');

        // Perform action if threshold met
        if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
            if (deltaX > 0) {
                // Swipe right - Reply
                const messageId = currentMessage.dataset.messageId;
                const message = messages.find(m => m.id === messageId);
                if (message) {
                    if (navigator.vibrate) navigator.vibrate(20);
                    replyToMessage(message);
                }
            } else {
                // Swipe left - Delete (only own messages)
                const isOwn = currentMessage.querySelector('.username.own') !== null;
                if (isOwn) {
                    const messageId = currentMessage.dataset.messageId;
                    if (navigator.vibrate) navigator.vibrate(20);
                    deleteMessage(messageId);
                }
            }
        }

        // Reset transform immediately to prevent position issues
        if (currentMessage) {
            currentMessage.style.transform = '';
            currentMessage.classList.remove('swipe-complete');
            if (swipeIndicator) {
                swipeIndicator.classList.remove('visible');
            }
        }

        currentMessage = null;
        isHorizontalSwipe = false;
    }, { passive: true });
    
    // Cancel swipe on touchcancel
    chatMessages.addEventListener('touchcancel', () => {
        if (currentMessage) {
            currentMessage.style.transform = '';
            currentMessage.classList.remove('swiping', 'swipe-complete');
            if (swipeIndicator) {
                swipeIndicator.classList.remove('visible');
            }
        }
        currentMessage = null;
        isHorizontalSwipe = false;
    }, { passive: true });
}

// Helper Functions for New Features

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Process message text for mentions, formatting, links
function processMessageText(text) {
    let processed = escapeHtml(text);
    
    // Bold: *text*
    processed = processed.replace(/\*([^\*]+)\*/g, '<strong>$1</strong>');
    
    // Italic: _text_
    processed = processed.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    // Code: `code`
    processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Mentions: @username
    processed = processed.replace(/@(\w+)/g, '<span class="mention" onclick="showUserProfile(\'$1\', \'regular\')">@$1</span>');
    
    // Links (basic URL detection)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    processed = processed.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="message-link">$1</a>');
    
    return processed;
}

// Show user profile modal
function showUserProfile(targetUsername, level = 'regular') {
    const modal = document.createElement('div');
    modal.className = 'profile-modal';
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
    
    const modalContent = document.createElement('div');
    modalContent.className = 'profile-modal-content';
    
    const badges = {
        'admin': '👑 Admin',
        'moderator': '🛡️ Moderator',
        'vip': '⭐ VIP Member',
        'regular': '💬 Member'
    };
    
    const isMuted = mutedUsers.includes(targetUsername);
    const isOwnProfile = targetUsername === username;
    
    modalContent.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar">${targetUsername[0].toUpperCase()}</div>
            <div class="profile-info">
                <h3>${escapeHtml(targetUsername)}</h3>
                <span class="profile-badge ${level}">${badges[level] || badges.regular}</span>
            </div>
            <button class="profile-close" onclick="this.closest('.profile-modal').remove()">✕</button>
        </div>
        <div class="profile-stats">
            <div class="stat-item">
                <span class="stat-label">Messages</span>
                <span class="stat-value">${messages.filter(m => m.username === targetUsername).length}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Level</span>
                <span class="stat-value">${level.toUpperCase()}</span>
            </div>
        </div>
        ${!isOwnProfile ? `
        <div class="profile-actions">
            <button class="profile-action-btn tip-btn" onclick="showTipModal('${targetUsername}')">💰 Send Tip</button>
            <button class="profile-action-btn ${isMuted ? 'unmute-btn' : 'mute-btn'}" onclick="toggleMuteUser('${targetUsername}')">${isMuted ? '🔊 Unmute' : '🔇 Mute'}</button>
            <button class="profile-action-btn report-btn" onclick="reportUser('${targetUsername}')">⚠️ Report</button>
        </div>
        ` : ''}
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Mute/unmute user
function toggleMuteUser(targetUsername) {
    const index = mutedUsers.indexOf(targetUsername);
    if (index > -1) {
        mutedUsers.splice(index, 1);
        showSystemMessage(`Unmuted ${targetUsername}`);
    } else {
        mutedUsers.push(targetUsername);
        showSystemMessage(`Muted ${targetUsername}. You won't see their messages.`);
    }
    localStorage.setItem('mutedUsers', JSON.stringify(mutedUsers));
    
    // Remove modal and refresh messages
    document.querySelector('.profile-modal')?.remove();
    refreshMessages();
}

// Report user
function reportUser(targetUsername) {
    if (confirm(`Report ${targetUsername} for inappropriate behavior?`)) {
        socket.emit('reportUser', { reportedUser: targetUsername, reporter: username });
        showSystemMessage(`Reported ${targetUsername}. Our moderators will review.`);
        document.querySelector('.profile-modal')?.remove();
    }
}

// Tip system
function showTipModal(targetUsername) {
    document.querySelector('.profile-modal')?.remove();
    
    const modal = document.createElement('div');
    modal.className = 'profile-modal tip-modal';
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
    
    const modalContent = document.createElement('div');
    modalContent.className = 'profile-modal-content';
    
    modalContent.innerHTML = `
        <div class="profile-header">
            <h3>💰 Send Tip to ${escapeHtml(targetUsername)}</h3>
            <button class="profile-close" onclick="this.closest('.profile-modal').remove()">✕</button>
        </div>
        <div class="tip-content">
            <p>Your coins: <strong>${userCoins}</strong> 🪙</p>
            <input type="number" id="tipAmount" class="tip-input" placeholder="Amount" min="1" max="${userCoins}" value="10">
            <div class="tip-presets">
                <button onclick="document.getElementById('tipAmount').value='10'">10 🪙</button>
                <button onclick="document.getElementById('tipAmount').value='50'">50 🪙</button>
                <button onclick="document.getElementById('tipAmount').value='100'">100 🪙</button>
                <button onclick="document.getElementById('tipAmount').value='${userCoins}'">All In</button>
            </div>
            <button class="tip-send-btn" onclick="sendTip('${targetUsername}')">Send Tip</button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Send tip
function sendTip(targetUsername) {
    const amount = parseInt(document.getElementById('tipAmount').value);
    
    if (!amount || amount < 1) {
        alert('Please enter a valid amount');
        return;
    }
    
    if (amount > userCoins) {
        alert('Insufficient coins!');
        return;
    }
    
    userCoins -= amount;
    localStorage.setItem('userCoins', userCoins);
    updateCoinDisplay();
    
    socket.emit('sendTip', {
        from: username,
        to: targetUsername,
        amount: amount,
        channel: currentChannel
    });
    
    // Show tip animation
    showTipAnimation(amount);
    
    document.querySelector('.tip-modal')?.remove();
    showSystemMessage(`You tipped ${targetUsername} ${amount} coins! 💰`);
}

// Tip animation
function showTipAnimation(amount) {
    const coin = document.createElement('div');
    coin.className = 'tip-coin-animation';
    coin.textContent = `+${amount} 🪙`;
    document.body.appendChild(coin);
    
    setTimeout(() => coin.remove(), 2000);
}

// Show system message
function showSystemMessage(text) {
    const systemMsg = document.createElement('div');
    systemMsg.className = 'system-message';
    systemMsg.textContent = text;
    chatMessages.appendChild(systemMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    setTimeout(() => systemMsg.remove(), 5000);
}

// Refresh messages (after muting/unmuting)
function refreshMessages() {
    const messagesContainer = chatMessages;
    Array.from(messagesContainer.children).forEach(msgEl => {
        if (msgEl.classList.contains('message')) {
            const msgUsername = msgEl.dataset.username;
            if (mutedUsers.includes(msgUsername)) {
                msgEl.style.display = 'none';
            } else {
                msgEl.style.display = '';
            }
        }
    });
}

// Desktop notifications
function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'chat-notification'
        });
    }
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Process chat commands
function processChatCommand(text) {
    if (!text.startsWith('/')) return false;
    
    const parts = text.slice(1).split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    switch (command) {
        case 'help':
            showSystemMessage('Commands: /help, /clear, /mute <user>, /unmute <user>, /tip <user> <amount>, /rooms');
            break;
        case 'clear':
            chatMessages.innerHTML = '';
            messages = [];
            showSystemMessage('Chat cleared');
            break;
        case 'mute':
            if (args[0]) {
                toggleMuteUser(args[0]);
            } else {
                showSystemMessage('Usage: /mute <username>');
            }
            break;
        case 'unmute':
            if (args[0]) {
                toggleMuteUser(args[0]);
            } else {
                showSystemMessage('Usage: /unmute <username>');
            }
            break;
        case 'tip':
            if (args[0]) {
                showTipModal(args[0]);
            } else {
                showSystemMessage('Usage: /tip <username>');
            }
            break;
        case 'rooms':
            showSystemMessage(`Available rooms: ${availableRooms.join(', ')}`);
            break;
        default:
            showSystemMessage(`Unknown command: /${command}. Type /help for commands.`);
    }
    
    return true;
}

// Update coin display in header
function updateCoinDisplay() {
    const coinAmountEl = document.querySelector('.coin-amount');
    if (coinAmountEl) {
        coinAmountEl.textContent = userCoins;
        
        // Animate coin update
        coinAmountEl.style.transform = 'scale(1.2)';
        setTimeout(() => {
            coinAmountEl.style.transform = 'scale(1)';
        }, 200);
    }
}
