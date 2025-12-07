const { ProductAttribute } = require('../../models');

class AttributeController {
    async list(req, res) {
        try {
            const attributes = await ProductAttribute.findAll();
            return res.json(attributes);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async addOption(req, res) {
        try {
            const { name, option } = req.body;
            if (!name || !option) return res.status(400).json({ error: 'Name and option are required' });

            const [attribute, created] = await ProductAttribute.findOrCreate({
                where: { name },
                defaults: { options: [] }
            });

            let options = attribute.options || [];
            if (!options.includes(option)) {
                options.push(option);
                // Sort options if needed, or keep insertion order
                options.sort();
                await attribute.update({ options });
            }

            return res.json(attribute);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AttributeController();
