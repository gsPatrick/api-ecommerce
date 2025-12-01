const { Sequelize, Op } = require('sequelize');
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
const ShippingRule = require('./shippingRule');

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

// User & Address
User.hasMany(Address, { foreignKey: 'userId' });
Address.belongsTo(User, { foreignKey: 'userId' });

// User & Cart
User.hasOne(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });

// User & Order
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// User & Review
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

// User & Wishlist
User.hasMany(Wishlist, { foreignKey: 'userId' });
Wishlist.belongsTo(User, { foreignKey: 'userId' });

// Product & Attributes
Product.hasMany(ProductAttribute, { foreignKey: 'productId', as: 'attributes' });
ProductAttribute.belongsTo(Product, { foreignKey: 'productId' });

// Product & Variations
Product.hasMany(ProductVariation, { foreignKey: 'productId', as: 'variations' });
ProductVariation.belongsTo(Product, { foreignKey: 'productId' });

// Product & Review
Product.hasMany(Review, { foreignKey: 'productId' });
Review.belongsTo(Product, { foreignKey: 'productId' });

// Product & Wishlist
Product.hasMany(Wishlist, { foreignKey: 'productId' });
Wishlist.belongsTo(Product, { foreignKey: 'productId' });

// Product & StockMovement
Product.hasMany(StockMovement, { foreignKey: 'productId' });
StockMovement.belongsTo(Product, { foreignKey: 'productId' });

// Variation & StockMovement
ProductVariation.hasMany(StockMovement, { foreignKey: 'variationId' });
StockMovement.belongsTo(ProductVariation, { foreignKey: 'variationId' });

// Cart & CartItem
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

// CartItem & Product/Variation
CartItem.belongsTo(Product, { foreignKey: 'productId' });
CartItem.belongsTo(ProductVariation, { foreignKey: 'variationId' });

// Order & OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// OrderItem & Product/Variation
OrderItem.belongsTo(Product, { foreignKey: 'productId' });
OrderItem.belongsTo(ProductVariation, { foreignKey: 'variationId' });

// Order & Coupon
Order.belongsTo(Coupon, { foreignKey: 'couponId' });

// Order & Payment
Order.hasMany(Payment, { foreignKey: 'orderId' });
Payment.belongsTo(Order, { foreignKey: 'orderId' });

// Order & StockMovement
Order.hasMany(StockMovement, { foreignKey: 'orderId' });
StockMovement.belongsTo(Order, { foreignKey: 'orderId' });

// User & File (Uploads)
User.hasMany(File, { foreignKey: 'userId' });
File.belongsTo(User, { foreignKey: 'userId' });

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
    Category,
    ShippingRule,
    Sequelize,
    Op
};
