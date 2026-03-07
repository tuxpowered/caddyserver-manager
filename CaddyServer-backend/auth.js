const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

// Secret key for JWT (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'caddyserver-webui-secret-key-2026';
const TOKEN_EXPIRY = '24h';

const initCredentials = async () => {
    // Database initialization is handled in db.js
    console.log('[AUTH] RBAC initialization ready (via DB)');
};

// Verify credentials against Database
const verifyCredentials = (username, password) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) return reject(err);
            if (!user) return resolve(null);

            const isValid = await bcrypt.compare(password, user.passwordHash);
            if (!isValid) return resolve(null);

            // Parse permissions if they are stored as JSON string
            try {
                user.permissions = JSON.parse(user.permissions);
            } catch (e) {
                user.permissions = [];
            }
            resolve(user);
        });
    });
};

// Change password in Database
const changePassword = async (username, currentPassword, newPassword) => {
    try {
        const user = await verifyCredentials(username, currentPassword);
        if (!user) {
            return { success: false, error: 'Current password is incorrect' };
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        return new Promise((resolve) => {
            db.run('UPDATE users SET passwordHash = ? WHERE username = ?', [newHash, username], (err) => {
                if (err) return resolve({ success: false, error: err.message });
                console.log(`[AUTH] Password for ${username} changed successfully`);
                resolve({ success: true });
            });
        });
    } catch (e) {
        return { success: false, error: e.message };
    }
};

// Generate JWT token with Role and Permissions
const generateToken = (user) => {
    return jwt.sign(
        {
            username: user.username,
            role: user.role,
            permissions: user.permissions
        },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
    );
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Auth middleware
const authMiddleware = (req, res, next) => {
    // Skip auth for login endpoint, status, and public settings
    if (req.path === '/' || req.path === '/index.html' || req.path.startsWith('/assets/') ||
        req.path === '/api/auth/login' || req.path === '/api/auth/verify' ||
        req.path === '/api/settings/public' || req.path === '/api/status' || req.path === '/api/health' ||
        req.path === '/api/ping' || req.path === '/api/system/discovery' ||
        req.path === '/api/pki/root' || req.path === '/vite.svg' || req.path === '/favicon.ico') {
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
};


// Setup auth routes
const setupAuthRoutes = (app) => {
    // Login endpoint
    app.post('/api/auth/login', async (req, res) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        try {
            const user = await verifyCredentials(username, password);
            if (!user) {
                console.log(`[AUTH] Failed login attempt for user: ${username}`);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = generateToken(user);
            console.log(`[AUTH] Successful login for user: ${username} (${user.role})`);

            res.json({
                success: true,
                token,
                user: {
                    username: user.username,
                    role: user.role,
                    permissions: user.permissions
                }
            });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // Verify token endpoint
    app.get('/api/auth/verify', (req, res) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ valid: false, error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        if (!decoded) {
            console.log('[AUTH] Token verification failed for /api/auth/verify');
            return res.status(401).json({ valid: false, error: 'Invalid or expired token' });
        }

        res.json({ valid: true, user: decoded });
    });

    // Change password endpoint
    app.post('/api/auth/change-password', async (req, res) => {
        const { currentPassword, newPassword } = req.body;
        const username = req.user.username;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        const result = await changePassword(username, currentPassword, newPassword);
        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        res.json({ success: true, message: 'Password changed successfully' });
    });

    // Logout endpoint
    app.post('/api/auth/logout', (req, res) => {
        res.json({ success: true });
    });
};

module.exports = { authMiddleware, setupAuthRoutes, verifyToken, initCredentials };
