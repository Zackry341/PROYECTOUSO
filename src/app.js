const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const configureSecurityMiddleware = require('./server/middlewares/securityMiddleware');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const indexRoutes = require('./server/routes/index');
const authRoutes = require('./server/routes/auth');
const difficultyRoutes = require('./server/routes/difficulty');
const scoreboardRoutes = require('./server/routes/scoreboard');
const creditsRoutes = require('./server/routes/credits');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

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

app.use('/utilities', express.static(path.join(__dirname, 'client/utilities'), {
    setHeaders: function (res, path) {
        if (path.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
        }
    }
}));

app.use('/components', express.static(path.join(__dirname, 'client/components'), {
    setHeaders: function (res, path) {
        if (path.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
        }
    }
}));

app.use('/pages', (req, res, next) => {
    const protectedFiles = ['bonus.html', 'game.html'];
    const isProtected = protectedFiles.some(file => req.path.includes(file));
    
    if (isProtected) {
        return res.redirect('/'); // Redirigir a la página principal (login)
    }
    
    next();
}, express.static(path.join(__dirname, 'client/pages')));

app.use('/assets', express.static(path.join(__dirname, 'client/assets')));

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

// Usar las rutas
app.use('/', indexRoutes);
app.use('/api', authRoutes);
app.use('/api/difficulty', difficultyRoutes);
app.use('/api/scoreboard', scoreboardRoutes);
app.use('/api/credits', creditsRoutes);

// Middleware para manejar rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'client/pages/404.html'));
});

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
