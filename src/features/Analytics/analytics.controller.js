const analyticsService = require('./analytics.service');

class AnalyticsController {
    async track(req, res) {
        try {
            const { eventType, data, sessionId } = req.body;
            await analyticsService.trackEvent({
                eventType,
                data,
                userId: req.user ? req.user.id : null,
                sessionId,
                ip_address: req.ip,
                user_agent: req.get('User-Agent')
            });
            res.status(201).send();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getFunnel(req, res) {
        try {
            const funnel = await analyticsService.getFunnel();
            res.json(funnel);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getReports(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const reports = await analyticsService.getSalesReports(startDate, endDate);
            res.json(reports);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getProductPerformance(req, res) {
        try {
            const performance = await analyticsService.getProductPerformance();
            res.json(performance);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getCustomerInsights(req, res) {
        try {
            const insights = await analyticsService.getCustomerInsights();
            res.json(insights);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getCartAnalysis(req, res) {
        try {
            const analysis = await analyticsService.getCartAnalysis();
            res.json(analysis);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AnalyticsController();
