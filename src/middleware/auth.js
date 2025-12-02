const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const integrationSecret = req.headers['x-integration-secret'];

        // Bypass for Integration
        if (integrationSecret && integrationSecret === process.env.BRECHO_API_KEY) {
            req.user = { id: 'integration-system', role: 'admin' }; // Grant admin access
            return next();
        }

        if (!authHeader) {
            return res.status(401).json({ error: 'Token not provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Admins only.' });
    }
};

module.exports = { authMiddleware, adminMiddleware };
