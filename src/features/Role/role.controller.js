const roleService = require('./role.service');

class RoleController {
    async list(req, res) {
        try {
            const roles = await roleService.list();
            res.json(roles);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async get(req, res) {
        try {
            const role = await roleService.getById(req.params.id);
            if (!role) return res.status(404).json({ error: 'Role not found' });
            res.json(role);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const role = await roleService.create(req.body);
            res.status(201).json(role);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const role = await roleService.update(req.params.id, req.body);
            res.json(role);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            await roleService.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new RoleController();
