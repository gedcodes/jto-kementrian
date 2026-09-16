const { Users } = require('../models');

module.exports = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).json({ message: 'Missing API Key' });
    }

    try {
        const user = await Users.findOne({
            where: {
                api_key: apiKey,
                is_active: true,
                is_deleted: false
            },
            logging: false
        });

        if (!user) {
            return res.status(403).json({ message: 'Invalid API Key' });
        }

        // Optional: bisa inject user info ke req
        req.apiUser = {
            id: user.id,
            email: user.email,
            role_id: user.role_id
        };

        return next();
    } catch (err) {
        console.error('API Key Auth Error:', err);
        return res.status(500).json({ message: 'Server Error' });
    }
};
