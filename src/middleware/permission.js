const { User, Role } = require('../models');

const checkPermission = (permission) => {
    return async (req, res, next) => {
        try {
            const user = await User.findByPk(req.user.id, { include: Role });

            if (!user) return res.status(401).json({ error: 'User not found' });

            // Super Admin bypass
            if (user.role === 'admin' || (user.Role && user.Role.name === 'Super Admin')) {
                return next();
            }

            if (!user.Role || !user.Role.permissions) {
                return res.status(403).json({ error: 'Access denied. No role assigned.' });
            }

            if (user.Role.permissions.includes(permission)) {
                next();
            } else {
                res.status(403).json({ error: `Access denied. Missing permission: ${permission}` });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
};

module.exports = { checkPermission };
