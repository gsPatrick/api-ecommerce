const roleService = require('./role.service');

class RoleController {
    async create(req, res) {
        try {
            const role = await roleService.createRole(req.body);
            res.status(201).json(role);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async list(req, res) {
        try {
            const roles = await roleService.getRoles();
            res.json(roles);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const role = await roleService.updateRole(req.params.id, req.body);
            res.json(role);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            await roleService.deleteRole(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new RoleController();
