const bcrypt = require('bcrypt');
const connection = require('../db/connection');

// Controlador para el inicio de sesión
exports.login = (req, res) => {
    const { email, password } = req.body;

    // Verificar que se proporcionaron email y password
    if (!email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Por favor, ingresa tu correo electrónico y contraseña' 
        });
    }

    // Consultar la base de datos para encontrar el usuario
    const query = 'SELECT * FROM usuarios WHERE email = ?';
    connection.query(query, [email], async (error, results) => {
        if (error) {
            return res.status(500).json({ 
                success: false, 
                message: 'Error en el servidor. Por favor, intenta nuevamente.' 
            });
        }

        // Verificar si se encontró el usuario
        if (results.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Correo electrónico o contraseña incorrectos' 
            });
        }

        // Usuario encontrado, verificar la contraseña
        const usuario = results[0];
        try {
            // Comparar la contraseña proporcionada con el hash almacenado
            const passwordMatch = await bcrypt.compare(password, usuario.password);
            
            if (!passwordMatch) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Correo electrónico o contraseña incorrectos' 
                });
            }

            // Autenticación exitosa - crear sesión
            req.session.loggedin = true;
            req.session.userId = usuario.id;
            req.session.email = usuario.email;
            req.session.nombre = usuario.nombre;
            
            // Responder con éxito
            res.status(200).json({ 
                success: true, 
                message: 'Inicio de sesión exitoso',
                redirect: '/bonus' // Página a la que redirigir
            });
            
        } catch (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Error en el servidor. Por favor, intenta nuevamente.' 
            });
        }
    });
};

// Controlador para el registro de usuarios
exports.singup = async (req, res) => {
    const { nombre, email, password, telefono } = req.body;

    try {
        // Primero verificar si el correo ya existe
        const checkEmailQuery = 'SELECT * FROM usuarios WHERE email = ?';
        
        connection.query(checkEmailQuery, [email], async (checkError, checkResults) => {
            if (checkError) {
                console.error('Error al verificar email:', checkError);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error al verificar disponibilidad del correo electrónico' 
                });
            }
            
            // Si ya existe un usuario con ese correo
            if (checkResults.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Este correo electrónico ya está registrado.' 
                });
            }
            
            // Si el correo no existe, proceder con el registro
            // Generar un salt y hashear la contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Insertar datos en la base de datos
            const insertQuery = 'INSERT INTO usuarios (nombre, email, password, telefono) VALUES (?, ?, ?, ?)';

            connection.query(insertQuery, [nombre, email, hashedPassword, telefono], (insertError, results) => {
                if (insertError) {
                    console.error('Error al registrar usuario:', insertError);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error al registrar usuario' 
                    });
                }

                res.status(200).json({ 
                    success: true, 
                    message: 'Usuario registrado correctamente' 
                });
            });
        });
    } catch (error) {
        console.error('Error en el proceso de registro:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error en el servidor' 
        });
    }
};
