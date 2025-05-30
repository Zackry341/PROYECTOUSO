const compression = require('compression');

const configureSecurityMiddleware = () => {
    return [compression()];
};

module.exports = configureSecurityMiddleware;
