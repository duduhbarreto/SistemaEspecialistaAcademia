const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Apply auth middleware to all routes
router.use(verifyToken);

// Get user profile
router.get('/profile', controller.getProfile);

// Update user profile
router.put('/profile', controller.updateProfile);

// Change password
router.post('/change-password', controller.changePassword);

// Get user stats
router.get('/stats', controller.getStats);

router.post('/update-email', controller.updateEmail);

// Atualizar informações pessoais (nome e idade)
router.put('/personal-info', controller.updatePersonalInfo);

// Excluir conta
router.post('/delete-account', controller.deleteAccount);

module.exports = router;