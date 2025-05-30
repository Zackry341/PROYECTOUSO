const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const configureSecurityMiddleware = require('./server/middlewares/securityMiddleware');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar rutas
const indexRoutes = require('./server/routes/index');
const authRoutes = require('./server/routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar limitador de tasa para login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos
    message: {
        success: false,
        message: 'Demasiados intentos de inicio de sesión. Por favor, intenta nuevamente después de 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Aplicar los middlewares de seguridad
const securityMiddlewares = configureSecurityMiddleware();
securityMiddlewares.forEach(middleware => app.use(middleware));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Servir archivos estáticos con rutas específicas
app.use('/styles', express.static(path.join(__dirname, 'client/styles'), {
    setHeaders: function (res, path) {
        if (path.endsWith('.css')) {
            res.set('Content-Type', 'text/css');
        }
    }
}));

app.use('/js', express.static(path.join(__dirname, 'client/js'), {
    setHeaders: function (res, path) {
        if (path.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
        }
    }
}));

app.use('/assets', express.static(path.join(__dirname, 'client/assets')));
app.use('/pages', express.static(path.join(__dirname, 'client/pages')));

// Configurar sesiones de usuario
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 60 * 1000 // 30 minutos
    }
}));

app.use('/api/login', loginLimiter);

// Usar las rutas
app.use('/', indexRoutes);
app.use('/api', authRoutes);

// Middleware para manejar rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'client/pages/404.html'));
});

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
