# Tagbis Casino Live Chat API Documentation

Base URL: `http://localhost:3000/api`

## REST API Endpoints

### 📊 **General**

#### GET `/api/health`
Health check endpoint
```json
Response: {
  "success": true,
  "status": "online",
  "uptime": 123.45,
  "timestamp": "2025-11-24T..."
}
```

#### GET `/api/stats`
Get overall statistics
```json
Response: {
  "success": true,
  "stats": {
    "totalMessages": 150,
    "onlineUsers": 5,
    "channels": [
      { "name": "global", "messages": 50 },
      { "name": "filipino", "messages": 20 }
    ]
  }
}
```

---

### 💬 **Channels**

#### GET `/api/channels`
Get all available channels
```json
Response: {
  "success": true,
  "channels": [
    { "name": "global", "messageCount": 50 },
    { "name": "filipino", "messageCount": 20 }
  ]
}
```

#### GET `/api/messages/:channel`
Get messages from a specific channel

**Query Parameters:**
- `limit` (optional, default: 50) - Number of messages to return
- `offset` (optional, default: 0) - Offset for pagination

**Example:** `/api/messages/global?limit=20&offset=0`

```json
Response: {
  "success": true,
  "channel": "global",
  "messages": [
    {
      "id": 1732467890123,
      "username": "John",
      "text": "Hello!",
      "timestamp": "2025-11-24T...",
      "channel": "global"
    }
  ],
  "total": 50
}
```

#### DELETE `/api/channels/:channel/clear`
Clear all messages in a channel (Admin)

**Example:** `/api/channels/global/clear`

```json
Response: {
  "success": true,
  "message": "global cleared"
}
```

---

### 💬 **Messages**

#### POST `/api/messages`
Send a message via REST API

**Request Body:**
```json
{
  "username": "John",
  "text": "Hello everyone!",
  "channel": "global"
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": 1732467890123,
    "username": "John",
    "text": "Hello everyone!",
    "timestamp": "2025-11-24T...",
    "channel": "global"
  }
}
```

#### DELETE `/api/messages/:id`
Delete a specific message (Admin)

**Query Parameters:**
- `channel` (required) - Channel name

**Example:** `/api/messages/1732467890123?channel=global`

```json
Response: {
  "success": true,
  "message": "Message deleted"
}
```

---

### 👥 **Users**

#### GET `/api/users/online`
Get online users count and list

```json
Response: {
  "success": true,
  "count": 5,
  "users": [
    {
      "id": "socket-id-123",
      "username": "John",
      "joinedAt": "2025-11-24T..."
    }
  ]
}
```

---

## WebSocket Events

### Client → Server

```javascript
// Connect
socket.connect()

// Send message
socket.emit('sendMessage', {
    username: 'John',
    text: 'Hello!',
    channel: 'global'
})

// Join channel
socket.emit('joinChannel', 'filipino')

// Register username
socket.emit('registerUser', 'John')

// Typing indicators
socket.emit('typing', 'John')
socket.emit('stopTyping')
```

### Server → Client

```javascript
// User count updates
socket.on('userCount', (count) => {
    console.log('Online users:', count)
})

// Recent messages
socket.on('recentMessages', (messages) => {
    console.log('Messages:', messages)
})

// New message
socket.on('newMessage', (message) => {
    console.log('New message:', message)
})

// Message deleted
socket.on('messageDeleted', ({ id }) => {
    console.log('Deleted message ID:', id)
})

// Channel cleared
socket.on('channelCleared', () => {
    console.log('Channel was cleared')
})

// Typing indicators
socket.on('userTyping', (username) => {})
socket.on('userStoppedTyping', () => {})
```

---

## Example Usage

### Using cURL

```bash
# Get all channels
curl http://localhost:3000/api/channels

# Get messages from global channel
curl http://localhost:3000/api/messages/global?limit=10

# Send a message
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"username":"John","text":"Hello!","channel":"global"}'

# Get online users
curl http://localhost:3000/api/users/online

# Get stats
curl http://localhost:3000/api/stats

# Delete a message
curl -X DELETE "http://localhost:3000/api/messages/1732467890123?channel=global"
```

### Using JavaScript (Fetch)

```javascript
// Get messages
const response = await fetch('http://localhost:3000/api/messages/global');
const data = await response.json();
console.log(data.messages);

// Send message
await fetch('http://localhost:3000/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        username: 'John',
        text: 'Hello!',
        channel: 'global'
    })
});
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error
