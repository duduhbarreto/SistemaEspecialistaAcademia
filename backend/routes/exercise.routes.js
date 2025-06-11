const express = require('express');
const router = express.Router();
const controller = require('../controllers/exercise.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Apply auth middleware to all routes
router.use(verifyToken);

// Get all exercises
router.get('/', controller.findAll);

// Search exercises
router.get('/search', controller.search);

// Get exercises by muscle group
router.get('/muscle-group/:id', controller.findByMuscleGroup);

// Get exercises by difficulty level
router.get('/difficulty/:level', controller.findByDifficulty);

// Get a single exercise
router.get('/:id', controller.findOne);

// Create a new exercise
router.post('/', controller.create);

// Update an exercise
router.put('/:id', controller.update);

// Delete an exercise
router.delete('/:id', controller.delete);

module.exports = router;