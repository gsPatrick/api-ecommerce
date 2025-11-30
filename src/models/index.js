const sequelize = require('../config/sequelize');
const User = require('./user');
const Product = require('./product');
const Category = require('./category');
const ProductAttribute = require('./productAttribute');
const ProductVariation = require('./productVariation');
const Coupon = require('./coupon');
const Cart = require('./cart');
const CartItem = require('./cartItem');
const Order = require('./order');
const OrderItem = require('./orderItem');

const Address = require('./address');
const StoreConfig = require('./storeConfig');
const Review = require('./review');
const Wishlist = require('./wishlist');
const Payment = require('./payment');
const File = require('./file');
const StockMovement = require('./stockMovement');
const Role = require('./role');
const ProductBatch = require('./productBatch');
const Question = require('./question');
const RelatedProduct = require('./relatedProduct');
const TrackingEvent = require('./trackingEvent');

// User & Role
User.belongsTo(Role, { foreignKey: 'roleId' });
Role.hasMany(User, { foreignKey: 'roleId' });

// ... (Existing)

// Product & ProductBatch
Product.hasMany(ProductBatch, { foreignKey: 'productId' });
ProductBatch.belongsTo(Product, { foreignKey: 'productId' });

// Variation & ProductBatch
ProductVariation.hasMany(ProductBatch, { foreignKey: 'variationId' });
ProductBatch.belongsTo(ProductVariation, { foreignKey: 'variationId' });

// Product & Question
Product.hasMany(Question, { foreignKey: 'productId' });
Question.belongsTo(Product, { foreignKey: 'productId' });
User.hasMany(Question, { foreignKey: 'userId' });
Question.belongsTo(User, { foreignKey: 'userId' });

// Product & RelatedProduct
Product.belongsToMany(Product, {
    as: 'RelatedProducts',
    through: RelatedProduct,
    foreignKey: 'productId',
    otherKey: 'relatedId'
});

// User & TrackingEvent
User.hasMany(TrackingEvent, { foreignKey: 'userId' });
TrackingEvent.belongsTo(User, { foreignKey: 'userId' });

// ... (Associations)

// Category Associations
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

// Subcategories
Category.hasMany(Category, { as: 'subcategories', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

module.exports = {
    sequelize,
    User,
    Product,
    ProductAttribute,
    ProductVariation,
    Coupon,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Address,
    StoreConfig,
    Review,
    Wishlist,
    Payment,
    File,
    StockMovement,
    Role,
    ProductBatch,
    Question,
    RelatedProduct,
    TrackingEvent,
    Category
};
