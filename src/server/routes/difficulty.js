const express = require('express');
const router = express.Router();
const difficultyController = require('../controllers/difficulty.controller');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// Ruta para guardar la dificultad
router.post('/save', isAuthenticated, difficultyController.saveDifficulty);

// Ruta para obtener la dificultad actual
router.get('/current', isAuthenticated, difficultyController.getDifficulty);

module.exports = router;
