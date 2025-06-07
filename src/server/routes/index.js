// src/server/routes/index.js
const express = require('express');
const router = express.Router();
const path = require('path');
const { isAuthenticated, isNotAuthenticated } = require('../middlewares/authMiddleware');

// Rutas que requieren NO estar autenticado
router.get('/', isNotAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/pages/login.html'));
});

router.get('/singup', isNotAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/pages/singup.html'));
});

// Ruta pública (accesible para todos)
router.get('/condiciones', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/pages/condiciones.html'));
});

// Rutas protegidas que requieren autenticación
router.get('/bonus', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/pages/bonus.html'));
});

router.get('/game', isAuthenticated,  (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/pages/game.html'));
});

module.exports = router;
