const storeConfigService = require('../features/StoreConfig/storeConfig.service');
const reviewService = require('../features/Review/review.service');
const wishlistService = require('../features/Wishlist/wishlist.service');
const { uploadService } = require('../features/Upload/upload.service');

const StoreConfigController = {
    async getPublic(req, res) {
        const configs = await storeConfigService.getAllPublic();
        res.json(configs);
    },
    async update(req, res) {
        const { key, value, group, is_public } = req.body;
        const config = await storeConfigService.setConfig(key, value, group, is_public);
        res.json(config);
    }
};

const ReviewController = {
    async add(req, res) {
        try {
            const review = await reviewService.addReview(req.user.id, req.body);
            res.status(201).json(review);
        } catch (e) { res.status(400).json({ error: e.message }); }
    },
    async list(req, res) {
        const reviews = await reviewService.getProductReviews(req.params.productId);
        res.json(reviews);
    }
};

const WishlistController = {
    async toggle(req, res) {
        const result = await wishlistService.toggleWishlist(req.user.id, req.body.productId);
        res.json(result);
    },
    async list(req, res) {
        const list = await wishlistService.getWishlist(req.user.id);
        res.json(list);
    }
};

const UploadController = {
    async upload(req, res) {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const record = await uploadService.saveFileRecord(req.file, req.user ? req.user.id : null);
        res.json(record);
    }
};

module.exports = { StoreConfigController, ReviewController, WishlistController, UploadController };
