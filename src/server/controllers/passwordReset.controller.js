const crypto = require('crypto');
const nodemailer = require('nodemailer');
const connection = require('../db/connection');
require('dotenv').config();

// Configurar el transporte de correo
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Controlador para solicitar restablecimiento de contraseña
exports.requestPasswordReset = (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ 
            success: false, 
            message: 'Por favor, proporciona un correo electrónico' 
        });
    }

    // Verificar si el correo existe en la base de datos
    const query = 'SELECT * FROM usuarios WHERE email = ?';
    
    connection.query(query, [email], (error, results) => {
        if (error) {
            console.error('Error al consultar la base de datos:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Error en el servidor. Por favor, intenta nuevamente.' 
            });
        }

        // Incluso si el usuario no existe, enviar una respuesta positiva por seguridad
        if (results.length === 0) {
            return res.status(200).json({ 
                success: true, 
                message: 'Si el correo está registrado, recibirás un código de verificación.' 
            });
        }

        // Generar código de verificación de 6 dígitos
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetExpires = Date.now() + 3600000; // 1 hora

        // Guardar el código en la base de datos
        const updateQuery = 'UPDATE usuarios SET reset_token = ?, reset_expires = ? WHERE email = ?';
        
        connection.query(updateQuery, [resetCode, resetExpires, email], (updateError) => {
            if (updateError) {
                console.error('Error al guardar el código:', updateError);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error en el servidor. Por favor, intenta nuevamente.' 
                });
            }

            // Configurar el correo electrónico
            const mailOptions = {
                from: `"Proyecto USO" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Código de Verificación para Restablecer Contraseña',
                html: `
                    <h1>Código de Verificación</h1>
                    <p>Has solicitado restablecer tu contraseña.</p>
                    <p>Tu código de verificación es:</p>
                    <h2 style="font-size: 32px; letter-spacing: 5px; text-align: center; padding: 10px; background-color: #f5f5f5; border-radius: 4px;">${resetCode}</h2>
                    <p>Este código expirará en 1 hora.</p>
                    <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                `
            };

            // Enviar el correo
            transporter.sendMail(mailOptions, (emailError) => {
                if (emailError) {
                    console.error('Error al enviar el correo:', emailError);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error al enviar el correo. Por favor, intenta nuevamente.' 
                    });
                }

                res.status(200).json({ 
                    success: true, 
                    message: 'Se ha enviado un código de verificación a tu correo electrónico.' 
                });
            });
        });
    });
};

// Nuevo controlador para verificar el código
exports.verifyResetCode = (req, res) => {
    const { email, codigo } = req.body;
    
    if (!email || !codigo) {
        return res.status(400).json({ 
            success: false, 
            message: 'Por favor, proporciona un correo electrónico y código' 
        });
    }
    
    const query = 'SELECT * FROM usuarios WHERE email = ? AND reset_token = ? AND reset_expires > ?';
    
    connection.query(query, [email, codigo, Date.now()], (error, results) => {
        if (error) {
            console.error('Error al verificar el código:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Error en el servidor. Por favor, intenta nuevamente.' 
            });
        }
        
        if (results.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Código inválido o expirado. Por favor, solicita un nuevo código.' 
            });
        }
        
        // Código válido
        res.status(200).json({ 
            success: true, 
            message: 'Código verificado correctamente' 
        });
    });
};

// Controlador para restablecer la contraseña
exports.resetPassword = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Por favor, proporciona un correo electrónico y una nueva contraseña' 
        });
    }
    
    try {
        // Verificar que el usuario exista y tenga un código de restablecimiento válido
        const query = 'SELECT * FROM usuarios WHERE email = ? AND reset_expires > ?';
        
        connection.query(query, [email, Date.now()], async (error, results) => {
            if (error || results.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'No se puede restablecer la contraseña. Por favor, solicita un nuevo código.' 
                });
            }
            
            const usuario = results[0];
            
            // Generar hash de la nueva contraseña
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            // Actualizar la contraseña y eliminar el código
            const updateQuery = 'UPDATE usuarios SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?';
            
            connection.query(updateQuery, [hashedPassword, usuario.id], (updateError) => {
                if (updateError) {
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error al actualizar la contraseña' 
                    });
                }
                
                res.status(200).json({ 
                    success: true, 
                    message: 'Tu contraseña ha sido actualizada correctamente' 
                });
            });
        });
    } catch (error) {
        console.error('Error al restablecer la contraseña:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error en el servidor. Por favor, intenta nuevamente.' 
        });
    }
};

