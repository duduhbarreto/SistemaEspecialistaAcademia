const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');

// Register a new user
router.post('/signup', controller.signup);

// Login
router.post('/signin', controller.signin);

module.exports = router;