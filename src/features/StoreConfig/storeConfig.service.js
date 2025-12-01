const { StoreConfig } = require('../../models');

class StoreConfigService {
    async getConfig(key) {
        const config = await StoreConfig.findOne({ where: { key } });
        return config ? config.value : null;
    }

    async getAllPublic() {
        return await StoreConfig.findAll({ where: { is_public: true } });
    }

    async getAllAdmin() {
        return await StoreConfig.findAll();
    }

    async setConfig(key, value, group = 'general', is_public = false) {
        const [config, created] = await StoreConfig.findOrCreate({
            where: { key },
            defaults: { value, group, is_public }
        });

        if (!created) {
            config.value = value;
            config.group = group;
            config.is_public = is_public;
            await config.save();
        }

        return config;
    }

    async bulkUpdate(configs) {
        const results = [];
        for (const cfg of configs) {
            const result = await this.setConfig(cfg.key, cfg.value, cfg.group, cfg.is_public);
            results.push(result);
        }
        return results;
    }
}

module.exports = new StoreConfigService();
