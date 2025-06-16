const express = require('express');
const router = express.Router();
const controller = require('../controllers/workout.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Apply auth middleware to all routes
router.use(verifyToken);

// Create a new workout
router.post('/', controller.create);

// Get all workouts
router.get('/', controller.findAll);

// Get recommended workout for user
router.get('/genetic-recommendation', controller.getRecommendedGenetic);
router.get('/recommended', controller.getRecommended);

// Get a single workout
router.get('/:id', controller.findOne);

// Update a workout
router.put('/:id', controller.update);

// Delete a workout
router.delete('/:id', controller.delete);

module.exports = router;