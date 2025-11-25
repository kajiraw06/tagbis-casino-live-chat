const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Store connected users and recent messages per channel
let connectedUsers = new Set();
let userProfiles = new Map(); // Store user info
let channelMessages = {
    global: [],
    filipino: [],
    brazilian: [],
    vip: [],
    sports: [],
    offtopic: []
};
const MAX_MESSAGES = 100;

// ============================================
// REST API ENDPOINTS
// ============================================

// Get all channels
app.get('/api/channels', (req, res) => {
    const channels = Object.keys(channelMessages).map(name => ({
        name,
        messageCount: channelMessages[name].length
    }));
    res.json({ success: true, channels });
});

// Get messages from a specific channel
app.get('/api/messages/:channel', (req, res) => {
    const { channel } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    if (!channelMessages[channel]) {
        return res.status(404).json({ success: false, error: 'Channel not found' });
    }
    
    const messages = channelMessages[channel]
        .slice(-limit - offset, -offset || undefined)
        .reverse();
    
    res.json({ 
        success: true, 
        channel,
        messages,
        total: channelMessages[channel].length
    });
});

// Get online users count
app.get('/api/users/online', (req, res) => {
    res.json({ 
        success: true, 
        count: connectedUsers.size,
        users: Array.from(userProfiles.values())
    });
});

// Post a message via REST API
app.post('/api/messages', (req, res) => {
    const { username, text, channel = 'global' } = req.body;
    
    if (!username || !text) {
        return res.status(400).json({ 
            success: false, 
            error: 'Username and text are required' 
        });
    }
    
    if (!channelMessages[channel]) {
        return res.status(404).json({ 
            success: false, 
            error: 'Channel not found' 
        });
    }
    
    const message = {
        id: Date.now(),
        username,
        text,
        timestamp: new Date(),
        channel
    };
    
    // Store message
    channelMessages[channel].push(message);
    if (channelMessages[channel].length > MAX_MESSAGES) {
        channelMessages[channel].shift();
    }
    
    // Broadcast via WebSocket
    io.to(channel).emit('newMessage', message);
    
    res.status(201).json({ success: true, message });
});

// Delete a message (admin function)
app.delete('/api/messages/:id', (req, res) => {
    const { id } = req.params;
    const { channel } = req.query;
    
    if (!channel || !channelMessages[channel]) {
        return res.status(404).json({ success: false, error: 'Channel not found' });
    }
    
    const messageIndex = channelMessages[channel].findIndex(
        msg => msg.id === parseInt(id)
    );
    
    if (messageIndex === -1) {
        return res.status(404).json({ success: false, error: 'Message not found' });
    }
    
    channelMessages[channel].splice(messageIndex, 1);
    
    // Notify clients to remove message
    io.to(channel).emit('messageDeleted', { id: parseInt(id) });
    
    res.json({ success: true, message: 'Message deleted' });
});

// Get channel statistics
app.get('/api/stats', (req, res) => {
    const stats = {
        totalMessages: Object.values(channelMessages).reduce(
            (sum, messages) => sum + messages.length, 0
        ),
        onlineUsers: connectedUsers.size,
        channels: Object.keys(channelMessages).map(name => ({
            name,
            messages: channelMessages[name].length
        }))
    };
    
    res.json({ success: true, stats });
});

// Clear channel history (admin function)
app.delete('/api/channels/:channel/clear', (req, res) => {
    const { channel } = req.params;
    
    if (!channelMessages[channel]) {
        return res.status(404).json({ success: false, error: 'Channel not found' });
    }
    
    channelMessages[channel] = [];
    io.to(channel).emit('channelCleared');
    
    res.json({ success: true, message: `${channel} cleared` });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        status: 'online',
        uptime: process.uptime(),
        timestamp: new Date()
    });
});

// ============================================
// WEBSOCKET EVENTS
// ============================================

io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);
    connectedUsers.add(socket.id);
    
    // Broadcast updated user count
    io.emit('userCount', connectedUsers.size);
    
    // Send current user list
    const users = Array.from(userProfiles.values());
    io.emit('userList', users);
    
    // Handle channel joining
    socket.on('joinChannel', (channel) => {
        socket.join(channel);
        socket.currentChannel = channel;
        
        // Send recent messages for this channel
        socket.emit('recentMessages', channelMessages[channel] || []);
        console.log(`User ${socket.id} joined channel: ${channel}`);
    });
    
    // Send recent messages for global channel (default)
    socket.join('global');
    socket.currentChannel = 'global';
    socket.emit('recentMessages', channelMessages.global);
    
    // Handle username registration
    socket.on('registerUser', (username) => {
        userProfiles.set(socket.id, {
            id: socket.id,
            username: username,
            joinedAt: new Date()
        });
        
        // Notify all users about the new user
        io.emit('userJoined', {
            id: socket.id,
            username: username
        });
        io.emit('userList', Array.from(userProfiles.values()));
    });
    
    // Handle new messages
    socket.on('sendMessage', (data) => {
        const channel = data.channel || 'global';
        const message = {
            id: Date.now(),
            username: data.username,
            text: data.text,
            timestamp: new Date(),
            socketId: socket.id,
            channel: channel,
            replyTo: data.replyTo || null,
            reactions: { '❤️': [], '👍': [], '😂': [] },
            edited: false,
            image: data.image || null,
            fileName: data.fileName || null,
            fileSize: data.fileSize || null
        };
        
        // Store message in channel
        if (!channelMessages[channel]) {
            channelMessages[channel] = [];
        }
        channelMessages[channel].push(message);
        if (channelMessages[channel].length > MAX_MESSAGES) {
            channelMessages[channel].shift();
        }
        
        // Broadcast to users in this channel
        io.to(channel).emit('newMessage', message);
        console.log(`[${channel}] ${data.username}: ${data.text}`);
    });
    
    // Handle message edit
    socket.on('editMessage', (data) => {
        const channel = data.channel || 'global';
        const message = channelMessages[channel]?.find(m => m.id === data.messageId);
        
        if (message && message.socketId === socket.id) {
            message.text = data.newText;
            message.edited = true;
            io.to(channel).emit('messageEdited', {
                messageId: data.messageId,
                newText: data.newText
            });
        }
    });
    
    // Handle message delete
    socket.on('deleteMessage', (data) => {
        const channel = data.channel || 'global';
        const messageIndex = channelMessages[channel]?.findIndex(m => m.id === data.messageId);
        
        if (messageIndex !== -1 && channelMessages[channel][messageIndex].socketId === socket.id) {
            channelMessages[channel].splice(messageIndex, 1);
            io.to(channel).emit('messageDeleted', {
                messageId: data.messageId
            });
        }
    });
    
    // Handle reactions
    socket.on('toggleReaction', (data) => {
        const channel = data.channel || 'global';
        const message = channelMessages[channel]?.find(m => m.id === data.messageId);
        
        if (message) {
            if (!message.reactions) {
                message.reactions = {};
            }
            if (!message.reactions[data.emoji]) {
                message.reactions[data.emoji] = [];
            }
            
            const userIndex = message.reactions[data.emoji].indexOf(data.username);
            if (userIndex > -1) {
                message.reactions[data.emoji].splice(userIndex, 1);
            } else {
                message.reactions[data.emoji].push(data.username);
            }
            
            io.to(channel).emit('reactionUpdated', {
                messageId: data.messageId,
                reactions: message.reactions
            });
        }
    });
    
    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        connectedUsers.delete(socket.id);
        userProfiles.delete(socket.id);
        io.emit('userCount', connectedUsers.size);
        io.emit('userLeft', socket.id);
        io.emit('userList', Array.from(userProfiles.values()));
    });
    
    // Handle typing indicator
    socket.on('typing', (username) => {
        socket.broadcast.emit('userTyping', username);
    });
    
    socket.on('stopTyping', () => {
        socket.broadcast.emit('userStoppedTyping');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log('📡 WebSocket ready for real-time chat');
});
