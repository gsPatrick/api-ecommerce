const { ShippingRule, StoreConfig } = require('../../models');
const { Op } = require('sequelize');

class ShippingService {
    async calculateShipping(zipCode, weight = 1, price = 0) {
        // 1. Clean ZIP code
        const cleanZip = zipCode.replace(/\D/g, '');

        // 2. Find matching rule
        // We look for a rule where zip_start <= cleanZip <= zip_end
        // Since zip codes are strings, we can compare them lexicographically if they are same length (8 digits)
        // Assuming standard 8-digit BR zip codes.

        const rule = await ShippingRule.findOne({
            where: {
                active: true,
                zip_start: { [Op.lte]: cleanZip },
                zip_end: { [Op.gte]: cleanZip }
            }
        });

        if (rule) {
            // 3. Calculate cost based on rule
            let cost = parseFloat(rule.base_cost) + (parseFloat(weight) * parseFloat(rule.weight_cost_per_kg));

            // Check Free Shipping Threshold
            if (rule.free_shipping_threshold && price >= parseFloat(rule.free_shipping_threshold)) {
                cost = 0;
            }

            return {
                cost: parseFloat(cost.toFixed(2)),
                days: rule.delivery_days,
                provider: 'Loja Própria' // or rule.name
            };
        }

        // 4. Fallback to StoreConfig
        const flatRateConfig = await StoreConfig.findOne({ where: { key: 'shipping_flat_rate' } });
        const flatRate = flatRateConfig ? parseFloat(flatRateConfig.value) : 15.00; // Default fallback if config missing

        const globalFreeThresholdConfig = await StoreConfig.findOne({ where: { key: 'shipping_free_threshold' } });
        const globalFreeThreshold = globalFreeThresholdConfig ? parseFloat(globalFreeThresholdConfig.value) : null;

        let cost = flatRate;
        if (globalFreeThreshold && price >= globalFreeThreshold) {
            cost = 0;
        }

        return {
            cost: parseFloat(cost.toFixed(2)),
            days: 7, // Default fallback days
            provider: 'Fixo'
        };
    }
}

module.exports = new ShippingService();
