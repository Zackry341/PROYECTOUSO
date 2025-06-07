const express = require('express');
const router = express.Router();
const scoreboardController = require('../controllers/scoreboard.controller');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// Obtener tabla de puntajes (público)
router.get('/', scoreboardController.getScoreboard);

// Obtener score personal (requiere autenticación)
router.get('/personal', isAuthenticated, scoreboardController.getPersonalScore);

// Guardar puntaje (requiere autenticación)
router.post('/', isAuthenticated, scoreboardController.saveScore);

// Limpiar tabla de puntajes (requiere autenticación)
router.delete('/', isAuthenticated, scoreboardController.clearScoreboard);

module.exports = router;
