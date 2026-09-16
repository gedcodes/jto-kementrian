const jwtPolicy = require('./auth.policy');
const apiKeyPolicy = require('./auth.apiKey.policy');

module.exports = async (req, res, next) => {
    if (req.headers['authorization']) {
        return jwtPolicy(req, res, next);
    }

    if (req.headers['x-api-key']) {
        return apiKeyPolicy(req, res, next);
    }

    return res.status(401).json({ message: 'Unauthorized. Token or API Key required.' });
};
