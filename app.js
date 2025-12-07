const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const path = require('path');
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

    // 1. Categories - REMOVED AS REQUESTED
    // const catRoupas = await Category.create({ name: 'Roupas', slug: 'roupas', description: 'O melhor do streetwear.', isActive: true });
    // const catAcessorios = await Category.create({ name: 'Acessórios', slug: 'acessorios', description: 'Detalhes que fazem a diferença.', isActive: true });
    // const catOutlet = await Category.create({ name: 'Outlet', slug: 'outlet', description: 'Peças com descontos imperdíveis.', isActive: true });

    // 1.1 Brands - REMOVED AS REQUESTED
    // const brandNike = await Brand.create({ name: 'Nike', slug: 'nike', active: true });
    // const brandAdidas = await Brand.create({ name: 'Adidas', slug: 'adidas', active: true });
    // const brandPuma = await Brand.create({ name: 'Puma', slug: 'puma', active: true });
    // const brandGeneric = await Brand.create({ name: 'Genérica', slug: 'generica', active: true });

    // 2. Products - REMOVED AS REQUESTED
    // ... Products creation code removed ...

    console.log('✅ User/Role Data seeded successfully! (Products/Categories skipped)');
}

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // ⚠️ FORCE TRUE ATIVADO A PEDIDO
        await sequelize.sync({ force: false });
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
