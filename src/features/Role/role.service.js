const { Role } = require('../../models');

class RoleService {
    async createRole(data) {
        return await Role.create(data);
    }

    async getRoles() {
        return await Role.findAll();
    }

    async updateRole(id, data) {
        const role = await Role.findByPk(id);
        if (!role) throw new Error('Role not found');
        return await role.update(data);
    }

    async deleteRole(id) {
        const role = await Role.findByPk(id);
        if (!role) throw new Error('Role not found');
        return await role.destroy();
    }
}

module.exports = new RoleService();
