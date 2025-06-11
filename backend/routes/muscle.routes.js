const express = require('express');
const router = express.Router();
const controller = require('../controllers/muscle.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Aplicar middleware de autenticação em todas as rotas
router.use(verifyToken);

// Obter todos os grupos musculares
router.get('/', controller.findAll);

// Obter um grupo muscular específico
router.get('/:id', controller.findOne);

module.exports = router;