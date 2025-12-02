const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const sequelize = require('./src/config/sequelize');
const routes = require('./src/routes');

const syncJob = require('./src/jobs/sync.job');

const app = express();

// Start Cron Jobs
syncJob();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Porta obrigatória nos buildpacks/docker
const PORT = process.env.PORT || 3000;

const { Category, Product, ProductAttribute, ProductVariation, User, Brand } = require('./src/models');

async function seedData() {
    console.log('🌱 Seeding data...');

    // 0. Roles & Permissions
    const { Role } = require('./src/models');

    const allResources = ['dashboard', 'products', 'orders', 'customers', 'coupons', 'shipping', 'settings', 'roles'];
    const allActions = ['read', 'create', 'update', 'delete'];
    const superAdminPermissions = [];

    allResources.forEach(res => {
        allActions.forEach(act => {
            superAdminPermissions.push(`${res}:${act}`);
        });
    });

    const superAdminRole = await Role.create({
        name: 'Super Admin',
        description: 'Acesso total ao sistema',
        permissions: superAdminPermissions
    });

    console.log('🛡️ Super Admin Role created');

    // 0. Admin Users
    await User.create({
        name: 'Patrick Admin',
        email: 'patrick@gmail.com',
        password: 'patrick123',
        role: 'admin',
        roleId: superAdminRole.id
    });

    await User.create({
        name: 'Admin Principal',
        email: 'Nos.ecolaborativo@gmail.com',
        password: 'Lorena13@',
        role: 'admin',
        roleId: superAdminRole.id
    });

    console.log('👤 Admin users created with Super Admin role');

    // 1. Categories
    const catRoupas = await Category.create({ name: 'Roupas', slug: 'roupas', description: 'O melhor do streetwear.', isActive: true });
    const catAcessorios = await Category.create({ name: 'Acessórios', slug: 'acessorios', description: 'Detalhes que fazem a diferença.', isActive: true });
    const catOutlet = await Category.create({ name: 'Outlet', slug: 'outlet', description: 'Peças com descontos imperdíveis.', isActive: true });

    // 1.1 Brands
    const brandNike = await Brand.create({ name: 'Nike', slug: 'nike', active: true });
    const brandAdidas = await Brand.create({ name: 'Adidas', slug: 'adidas', active: true });
    const brandPuma = await Brand.create({ name: 'Puma', slug: 'puma', active: true });
    const brandGeneric = await Brand.create({ name: 'Genérica', slug: 'generica', active: true });

    // 2. Products (Roupas)
    const tShirt = await Product.create({
        name: 'T-Shirt Oversized Street',
        description: 'Camiseta oversized com estampa exclusiva.',
        price: 129.90,
        categoryId: catRoupas.id,
        category: 'Roupas', // Legacy
        brandId: brandNike.id,
        images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop'],
        is_variable: true,
        weight: 0.2,
        dimensions: { height: 2, width: 20, length: 30 },
        status: 'published'
    });

    // Attributes for T-Shirt
    await ProductAttribute.create({ productId: tShirt.id, name: 'Size', options: ['P', 'M', 'G', 'GG'] });
    await ProductAttribute.create({
        productId: tShirt.id, name: 'Color', options: [
            { name: 'Preto', hex: '#000000' },
            { name: 'Branco', hex: '#FFFFFF' }
        ]
    });

    // Variations for T-Shirt
    await ProductVariation.create({ productId: tShirt.id, price: 129.90, stock: 10, attributes: { "Size": "M", "Color": "Preto" } });
    await ProductVariation.create({ productId: tShirt.id, price: 129.90, stock: 5, attributes: { "Size": "G", "Color": "Branco" } });


    const hoodie = await Product.create({
        name: 'Hoodie Cyberpunk',
        description: 'Moletom futurista com capuz.',
        price: 299.90,
        categoryId: catRoupas.id,
        category: 'Roupas',
        brandId: brandAdidas.id,
        images: ['https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=800&auto=format&fit=crop'],
        is_variable: true,
        weight: 0.5,
        dimensions: { height: 5, width: 30, length: 40 },
        status: 'published'
    });

    await ProductAttribute.create({ productId: hoodie.id, name: 'Size', options: ['M', 'G'] });
    await ProductAttribute.create({ productId: hoodie.id, name: 'Color', options: [{ name: 'Cinza', hex: '#797979' }] });
    await ProductVariation.create({ productId: hoodie.id, price: 299.90, stock: 8, attributes: { "Size": "G", "Color": "Cinza" } });


    // 3. Products (Acessórios)
    const cap = await Product.create({
        name: 'Boné Trucker Vibe',
        description: 'Boné estilo trucker para completar o look.',
        price: 89.90,
        categoryId: catAcessorios.id,
        category: 'Acessórios',
        brandId: brandPuma.id,
        images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop'],
        is_variable: true,
        weight: 0.1,
        dimensions: { height: 10, width: 15, length: 20 },
        status: 'published'
    });

    await ProductAttribute.create({ productId: cap.id, name: 'Color', options: [{ name: 'Preto', hex: '#000000' }, { name: 'Rosa', hex: '#eb68b3' }] });
    await ProductVariation.create({ productId: cap.id, price: 89.90, stock: 15, attributes: { "Color": "Preto" } });
    await ProductVariation.create({ productId: cap.id, price: 89.90, stock: 15, attributes: { "Color": "Rosa" } });

    const chain = await Product.create({
        name: 'Corrente Silver',
        description: 'Corrente prateada grossa.',
        price: 59.90,
        categoryId: catAcessorios.id,
        category: 'Acessórios',
        brandId: brandGeneric.id,
        images: ['https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=800&auto=format&fit=crop'],
        is_variable: false,
        stock: 50,
        weight: 0.05,
        dimensions: { height: 1, width: 5, length: 10 },
        status: 'published'
    });

    // 4. Products (Outlet)
    const oldTee = await Product.create({
        name: 'T-Shirt Last Season',
        description: 'Últimas peças da coleção passada.',
        price: 49.90,
        categoryId: catOutlet.id,
        category: 'Outlet',
        brandId: brandNike.id,
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop'],
        is_variable: true,
        weight: 0.2,
        dimensions: { height: 2, width: 20, length: 30 },
        status: 'published'
    });

    await ProductAttribute.create({ productId: oldTee.id, name: 'Size', options: ['P'] });
    await ProductVariation.create({ productId: oldTee.id, price: 49.90, stock: 2, attributes: { "Size": "P" } });

    console.log('✅ Data seeded successfully!');
}

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // ⚠️ FORCE TRUE ATIVADO A PEDIDO
        await sequelize.sync({ force: true });
        console.log('Models synced with FORCE: TRUE (Tables DROPPED & recreated).');

        await seedData();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

startServer();
