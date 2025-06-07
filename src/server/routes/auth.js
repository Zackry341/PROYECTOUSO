const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const passwordResetController = require('../controllers/passwordReset.controller');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// Ruta para procesar el formulario de registro
router.post('/singup', authController.singup);

// Ruta para procesar el formulario de inicio de sesión
router.post('/login', authController.login);

router.post('/logout', authController.logout);

// Restablecimiento de contraseña
router.post('/reset-password-request', passwordResetController.requestPasswordReset);
router.post('/verify-reset-code', passwordResetController.verifyResetCode);
router.post('/reset-password', passwordResetController.resetPassword);

router.get('/user-info', isAuthenticated, authController.getUserInfo);

module.exports = router;
