const isAuthenticated = (req, res, next) => {
    // Verificar AMBAS propiedades para mayor seguridad
    if (req.session && req.session.userId && req.session.loggedin) {
        return next();
    }
    
    // Si es una solicitud AJAX, devolver un error 401
    if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }
    
    // Redirigir a la página de login para solicitudes normales
    res.redirect('/');
};

const isNotAuthenticated = (req, res, next) => {
    // Verificar que NO esté autenticado
    if (!req.session || !req.session.userId || !req.session.loggedin) {
        return next();
    }
    
    // Si es una solicitud AJAX, devolver un error 403
    if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
        return res.status(403).json({ success: false, message: 'Acceso denegado. Ya has iniciado sesión.' });
    }
    
    // Redirigir a la página principal para usuarios autenticados
    res.redirect('/bonus');
};

module.exports = { isAuthenticated, isNotAuthenticated };
