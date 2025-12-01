const userService = require('./user.service');

class UserController {
    async register(req, res) {
        try {
            const user = await userService.register(req.body);
            res.status(201).json({ message: 'User created successfully', userId: user.id });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await userService.login(email, password);
            res.json(result);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

    async getProfile(req, res) {
        try {
            const user = await userService.getProfile(req.user.id);
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const users = await userService.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new UserController();
