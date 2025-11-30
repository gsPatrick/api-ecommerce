const { Wishlist, Product, ProductVariation } = require('../../models');

class WishlistService {
    async toggleWishlist(userId, productId) {
        const existing = await Wishlist.findOne({ where: { userId, productId } });
        if (existing) {
            await existing.destroy();
            return { status: 'removed' };
        } else {
            await Wishlist.create({ userId, productId });
            return { status: 'added' };
        }
    }

    async getWishlist(userId) {
        return await Wishlist.findAll({
            where: { userId },
            include: [
                {
                    model: Product,
                    include: ['variations']
                }
            ]
        });
    }
}

module.exports = new WishlistService();
