console.log('Test starting...');
try {
    const db = require('./db');
    console.log('✅ DB module loaded');
    console.log('getUserByUsername:', typeof db.getUserByUsername);
    console.log('createUser:', typeof db.createUser);
} catch (e) {
    console.error('❌ DB Error:', e.message);
    console.error(e.stack);
    process.exit(1);
}
