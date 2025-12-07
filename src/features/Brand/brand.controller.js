const { Brand } = require('../../models');

class BrandController {
    async list(req, res) {
        try {
            const brands = await Brand.findAll({
                where: { active: true },
                order: [['name', 'ASC']]
            });
            return res.json(brands);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const { name, logo } = req.body;
            if (!name) return res.status(400).json({ error: 'Name is required' });

            const [brand, created] = await Brand.findOrCreate({
                where: { name },
                defaults: {
                    slug: name.toLowerCase().replace(/ /g, '-'),
                    active: true,
                    logo: logo || null
                }
            });

            if (!created && logo && brand.logo !== logo) {
                await brand.update({ logo });
            }

            return res.status(201).json(brand);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new BrandController();
