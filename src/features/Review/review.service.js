const { Review, Product, User } = require('../../models');

class ReviewService {
    async addReview(userId, data) {
        const review = await Review.create({ ...data, userId });

        // Update product average rating
        await this.updateProductRating(data.productId);

        return review;
    }

    async getProductReviews(productId) {
        return await Review.findAll({
            where: { productId, status: 'approved' },
            include: [{ model: User, attributes: ['name', 'avatar'] }]
        });
    }

    async updateProductRating(productId) {
        const reviews = await Review.findAll({ where: { productId, status: 'approved' } });
        if (reviews.length === 0) return;

        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        const average = total / reviews.length;

        await Product.update(
            { average_rating: average, rating_count: reviews.length },
            { where: { id: productId } }
        );
    }
}

module.exports = new ReviewService();
