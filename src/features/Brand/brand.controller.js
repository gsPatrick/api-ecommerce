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

    async update(req, res) {
        try {
            const { id } = req.params;
            const { name, logo, active } = req.body;

            const brand = await Brand.findByPk(id);
            if (!brand) return res.status(404).json({ error: 'Brand not found' });

            await brand.update({
                name: name || brand.name,
                slug: name ? name.toLowerCase().replace(/ /g, '-') : brand.slug,
                logo: logo !== undefined ? logo : brand.logo,
                active: active !== undefined ? active : brand.active
            });

            return res.json(brand);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const brand = await Brand.findByPk(id);
            if (!brand) return res.status(404).json({ error: 'Brand not found' });

            await brand.destroy();
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new BrandController();
