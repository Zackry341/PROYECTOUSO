const compression = require('compression');
const helmet = require('helmet');

const configureSecurityMiddleware = () => {
    const middlewares = [];

    // Middleware de compresión
    middlewares.push(compression());

    // Middleware de Helmet con configuración personalizada
    middlewares.push(helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "connect-src": [
                    "'self'",
                    "https://www.google.com/",
                    "https://www.google.com/recaptcha/",
                    "https://www.gstatic.com/recaptcha/",
                    "https://recaptcha.google.com/recaptcha/",
                    "https://*.google.com"
                ],
                "script-src": [
                    "'self'",
                    "https://www.google.com/recaptcha/",
                    "https://www.gstatic.com/recaptcha/",
                    "'unsafe-inline'"
                ],
                "frame-src": [
                    "'self'",
                    "https://www.google.com/recaptcha/",
                    "https://recaptcha.google.com/recaptcha/"
                ],
                "img-src": [
                    "'self'", 
                    "i.ibb.co", 
                    "data:", 
                    "https://cdn.dribbble.com",
                    "https://*.dribbble.com"
                ],
                "style-src": ["'self'", "'unsafe-inline'"]
            }
        }
    }));

    return middlewares;
};

module.exports = configureSecurityMiddleware;
