const { Role, User } = require('../../models');

class RoleService {
    async list() {
        return await Role.findAll();
    }

    async getById(id) {
        return await Role.findByPk(id);
    }

    async create(data) {
        // data: { name, description, permissions }
        return await Role.create(data);
    }

    async update(id, data) {
        const role = await Role.findByPk(id);
        if (!role) throw new Error('Role not found');
        return await role.update(data);
    }

    async delete(id) {
        const role = await Role.findByPk(id);
        if (!role) throw new Error('Role not found');

        // Check if any user is using this role
        const usersCount = await User.count({ where: { roleId: id } });
        if (usersCount > 0) {
            throw new Error('Cannot delete role assigned to users');
        }

        return await role.destroy();
    }
}

module.exports = new RoleService();
