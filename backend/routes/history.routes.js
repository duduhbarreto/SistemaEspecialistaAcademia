const express = require('express');
const router = express.Router();
const controller = require('../controllers/history.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Apply auth middleware to all routes
router.use(verifyToken);

// Record a workout
router.post('/', controller.create);

// Get all workout history
router.get('/', controller.findAll);

// Get recent workout history
router.get('/recent', controller.getRecent);

// Get workout history stats
router.get('/stats', controller.getStats);

// Get next recommended workout
router.get('/next-workout', controller.getNextWorkout);

// Get a single workout history entry
router.get('/:id', controller.findOne);

// Delete a workout history entry
router.delete('/:id', controller.delete);

module.exports = router;