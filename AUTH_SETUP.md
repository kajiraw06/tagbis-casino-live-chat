# Authentication System Setup

## Current Implementation

### Database
- **Storage**: JSON file-based persistence (`data/users.json`)
- **Reason**: Replaced `better-sqlite3` to avoid native module build requirements on Windows
- **Trade-off**: Single-process only; no concurrent write safety
- **Future**: Can migrate to SQLite or PostgreSQL when build tools available

### Features Implemented
- ✅ User registration with password hashing (bcryptjs)
- ✅ Login with JWT tokens (7-day expiry)
- ✅ Logout (client-side token clearing)
- ✅ Socket.io authentication via handshake token
- ✅ Password-protected accounts (min 6 chars)
- ✅ Username validation (3-20 alphanumeric + underscore)
- ✅ Case-insensitive username uniqueness

### API Endpoints
```
POST /api/auth/register
Body: { username, password }
Returns: { success, token, user: { id, username, level, coins } }

POST /api/auth/login
Body: { username, password }
Returns: { success, token, user: { id, username, level, coins } }

POST /api/auth/logout
Headers: Authorization: Bearer <token>
Returns: { success }

GET /api/auth/me
Headers: Authorization: Bearer <token>
Returns: { success, user: { id, username, level, coins } }
```

### Security Notes
- JWT secret defaults to `process.env.JWT_SECRET` (or dev fallback)
- Passwords hashed with bcrypt (salt rounds: 10)
- Token stored in localStorage (client-side)
- CORS currently allows all origins (tighten in production)

### Known Limitations
- No rate limiting on auth endpoints
- No email verification
- No password reset flow
- No refresh tokens
- JSON storage not suitable for high traffic

## Local Development

### Prerequisites
- Node.js v20+ (v24.11.1 tested)
- npm

### Install & Run
```bash
npm install
node server.js
```

Server starts on `http://localhost:3000`

### Windows Note
If `node` command fails, use full path:
```powershell
& "C:\Program Files\nodejs\node.exe" server.js
```

## Deployment (Render.com)

### Environment Variables
Set in Render dashboard:
- `JWT_SECRET`: Strong random string for token signing

### Build Command
```
npm install
```

### Start Command
```
node server.js
```

### Notes
- Render has proper Node.js; no PATH issues
- JSON file persists in `/data/users.json` (ephemeral disk)
- For persistent storage, upgrade to PostgreSQL add-on

## Upgrading to SQL Database

To switch back to SQLite or PostgreSQL:

1. Install dependency:
   ```bash
   npm install better-sqlite3  # or pg for PostgreSQL
   ```

2. Replace `db.js` with SQL implementation

3. Update connection string in environment variables

4. Migrate existing users from `data/users.json`

## Testing Authentication

### Register New User
```javascript
fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'testuser', password: 'test123' })
})
```

### Login
```javascript
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'testuser', password: 'test123' })
})
```

Token returned in response; stored automatically by client.

## Client Integration

Socket connection now includes auth token:
```javascript
const token = localStorage.getItem('authToken');
const socket = io(url, {
  auth: token ? { token } : {}
});
```

Server verifies token on connection and loads user profile.
