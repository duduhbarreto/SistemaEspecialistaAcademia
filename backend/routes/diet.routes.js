const express = require('express');
const router = express.Router();
const controller = require('../controllers/diet.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Aplicar middleware de autenticação em todas as rotas
router.use(verifyToken);

// Calcular dieta
router.post('/calculate', controller.calculateDiet);

// Obter dieta do usuário
router.get('/', controller.getDiet);

// Obter sugestões de alimentos
router.get('/food-suggestions', controller.getFoodSuggestions);

// Restrições alimentares
router.post('/restrictions', controller.saveRestriction);
router.get('/restrictions', controller.getRestrictions);
router.delete('/restrictions/:id', controller.deleteRestriction);

module.exports = router;