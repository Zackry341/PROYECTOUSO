const compression = require('compression');
const helmet = require('helmet');

const configureSecurityMiddleware = () => {
    const middlewares = [];

    // Middleware de compresión
    middlewares.push(compression());

    // Middleware de Helmet con configuración personalizada
    middlewares.push(helmet({
        // Deshabilitar Cross-Origin-Embedder-Policy para resolver problemas con Kaspersky
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "default-src": [
                    "'self'",
                    "https://gc.kis.v2.scr.kaspersky-labs.com",
                    "https://*.kaspersky-labs.com"
                ],
                "connect-src": [
                    "'self'",
                    "https://www.google.com/",
                    "https://www.google.com/recaptcha/",
                    "https://www.gstatic.com/recaptcha/",
                    "https://recaptcha.google.com/recaptcha/",
                    "https://*.google.com",
                    "https://gc.kis.v2.scr.kaspersky-labs.com",
                    "https://*.kaspersky-labs.com"
                ],
                "script-src": [
                    "'self'",
                    "https://www.google.com/recaptcha/",
                    "https://www.gstatic.com/recaptcha/",
                    "https://cdnjs.cloudflare.com",
                    "https://gc.kis.v2.scr.kaspersky-labs.com",
                    "https://*.kaspersky-labs.com",
                    "'unsafe-inline'",
                    "'unsafe-eval'"
                ],
                "script-src-elem": [
                    "'self'",
                    "https://www.google.com/recaptcha/",
                    "https://www.gstatic.com/recaptcha/",
                    "https://cdnjs.cloudflare.com",
                    "https://gc.kis.v2.scr.kaspersky-labs.com",
                    "https://*.kaspersky-labs.com",
                    "'unsafe-inline'"
                ],
                "style-src": [
                    "'self'",
                    "'unsafe-inline'",
                    "https://cdnjs.cloudflare.com",
                    "https://gc.kis.v2.scr.kaspersky-labs.com",
                    "https://*.kaspersky-labs.com"
                ],
                "style-src-elem": [
                    "'self'",
                    "'unsafe-inline'",
                    "https://cdnjs.cloudflare.com",
                    "https://gc.kis.v2.scr.kaspersky-labs.com",
                    "https://*.kaspersky-labs.com"
                ],
                "font-src": [
                    "'self'",
                    "https://cdnjs.cloudflare.com",
                    "https://gc.kis.v2.scr.kaspersky-labs.com",
                    "https://*.kaspersky-labs.com",
                    "data:"
                ],
                "img-src": [
                    "'self'",
                    "i.ibb.co",
                    "data:",
                    "https://cdn.dribbble.com",
                    "https://*.dribbble.com",
                    "https://gc.kis.v2.scr.kaspersky-labs.com",
                    "https://*.kaspersky-labs.com"
                ],
                "frame-src": [
                    "'self'",
                    "https://www.google.com/recaptcha/",
                    "https://recaptcha.google.com/recaptcha/",
                    "https://gc.kis.v2.scr.kaspersky-labs.com",
                    "https://*.kaspersky-labs.com"
                ],
                "worker-src": [
                    "'self'",
                    "blob:",
                    "https://gc.kis.v2.scr.kaspersky-labs.com",
                    "https://*.kaspersky-labs.com"
                ],
                "object-src": [
                    "'self'",
                    "https://gc.kis.v2.scr.kaspersky-labs.com",
                    "https://*.kaspersky-labs.com"
                ]
            }
        }
    }));

    return middlewares;
};

module.exports = configureSecurityMiddleware;
