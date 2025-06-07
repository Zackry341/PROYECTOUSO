const express = require('express');
const router = express.Router();
const creditsController = require('../controllers/credits.controller');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const rewardsController = require('../controllers/rewards.controller');

// Obtener créditos actuales
router.get('/balance', isAuthenticated, creditsController.getCredits);

// Agregar créditos (compra)
router.post('/add', isAuthenticated, creditsController.addCredits);

// Usar créditos
router.post('/use', isAuthenticated, creditsController.useCredits);

router.post('/claim-reward', isAuthenticated, rewardsController.claimReward);

module.exports = router;
