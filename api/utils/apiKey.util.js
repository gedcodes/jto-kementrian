const { v4: uuidv4 } = require('uuid');

/**
 * Generate a new API key.
 */
function generateApiKey() {
    return uuidv4().replace(/-/g, '') + uuidv4().slice(0, 8); // 40 karakter
}

module.exports = {
    generateApiKey,
};
