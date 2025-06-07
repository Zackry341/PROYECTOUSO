const bcrypt = require('bcryptjs');
const connection = require('../db/connection');

// Clase de error personalizada
class APIError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'APIError';
        Error.captureStackTrace(this, this.constructor);
    }
}

// Controlador para el registro de usuarios - MEJORADO
exports.singup = async (req, res) => {
    try {
        const { nombre, email, password, telefono } = req.body;

        // Validación de entrada
        if (!nombre || !email || !password || !telefono) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }

        if (nombre.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'El nombre debe tener al menos 3 caracteres'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 8 caracteres'
            });
        }

        // Verificar email con manejo de errores mejorado
        const checkEmailQuery = 'SELECT * FROM usuarios WHERE email = ?';
        
        const checkEmailResults = await new Promise((resolve, reject) => {
            connection.query(checkEmailQuery, [email], (error, results) => {
                if (error) {
                    console.error('Error en consulta de email:', error);
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        if (checkEmailResults.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Este correo electrónico ya está registrado'
            });
        }

        // Hashear contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insertar usuario
        const insertQuery = 'INSERT INTO usuarios (nombre, email, password, telefono) VALUES (?, ?, ?, ?)';
        
        const insertResults = await new Promise((resolve, reject) => {
            connection.query(insertQuery, [nombre, email, hashedPassword, telefono], (error, results) => {
                if (error) {
                    console.error('Error al insertar usuario:', error);
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        // Crear sesión automáticamente
        const userId = insertResults.insertId;
        
        req.session.loggedin = true;
        req.session.userId = userId;
        req.session.email = email;
        req.session.nombre = nombre;

        // Guardar sesión
        req.session.save((err) => {
            if (err) {
                console.error('Error al guardar sesión:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Usuario registrado pero error al crear sesión'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Usuario registrado correctamente',
                redirect: '/bonus'
            });
        });

    } catch (error) {
        console.error('Error completo en registro:', error);
        
        // Manejo específico de errores de base de datos
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            return res.status(500).json({
                success: false,
                message: 'Error de conexión a la base de datos'
            });
        }
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(500).json({
                success: false,
                message: 'No se puede conectar a la base de datos'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Controlador de login - MEJORADO
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new APIError('Por favor, ingresa tu correo electrónico y contraseña', 400);
        }

        // Buscar usuario con Promise
        const results = await new Promise((resolve, reject) => {
            const query = 'SELECT * FROM usuarios WHERE email = ?';
            connection.query(query, [email], (error, results) => {
                if (error) {
                    reject(new APIError('Error al buscar usuario', 500));
                } else {
                    resolve(results);
                }
            });
        });

        if (results.length === 0) {
            throw new APIError('Correo electrónico o contraseña incorrectos', 401);
        }

        const usuario = results[0];
        const passwordMatch = await bcrypt.compare(password, usuario.password);
        
        if (!passwordMatch) {
            throw new APIError('Correo electrónico o contraseña incorrectos', 401);
        }

        // Crear sesión
        req.session.loggedin = true;
        req.session.userId = usuario.id;
        req.session.email = usuario.email;
        req.session.nombre = usuario.nombre;
        
        res.status(200).json({ 
            success: true, 
            message: 'Inicio de sesión exitoso',
            redirect: '/bonus'
        });

    } catch (error) {
        console.error('Error en login:', error);
        
        if (error instanceof APIError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor. Por favor, intenta nuevamente.'
        });
    }
};


exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error al cerrar sesión'
            });
        }
        
        res.clearCookie('connect.sid'); // Nombre por defecto de la cookie de sesión
        res.status(200).json({
            success: true,
            message: 'Sesión cerrada correctamente',
            redirect: '/'
        });
    });
};

// Obtener información del usuario actual
exports.getUserInfo = (req, res) => {
    const userId = req.session.userId;
    
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: 'Usuario no autenticado'
        });
    }

    const query = 'SELECT nombre, score, credits, difficulty FROM usuarios WHERE id = ?';
    
    connection.query(query, [userId], (error, results) => {
        if (error) {
            console.error('Error al obtener información del usuario:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        const user = results[0];
        res.json({
            success: true,
            user: {
                nombre: user.nombre,
                bestScore: user.score || 0,
                credits: user.credits || 0,
                difficulty: user.difficulty || 1
            }
        });
    });
};
