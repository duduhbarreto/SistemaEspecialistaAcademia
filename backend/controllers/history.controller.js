const db = require('../models');
const WorkoutHistory = db.history;
const Workout = db.workout;
const Exercise = db.exercise;
const MuscleGroup = db.muscleGroup;
const Sequelize = db.Sequelize;
const Op = db.Sequelize.Op;
const logger = require('../utils/logger');

// Importar as funções necessárias do workout.controller
// Note: Em uma implementação real, seria melhor reorganizar estas funções em um módulo compartilhado
const { getTrainingSplits, getRecommendedSplit, geneticAlgorithm } = require('./workout.controller');

// Create a workout history record with next workout recommendation
exports.create = async (req, res) => {
  try {
    // Create history
    const history = await WorkoutHistory.create({
      user_id: req.userId,
      workout_id: req.body.workout_id,
      workout_date: new Date(),
      feedback: req.body.feedback,
      notes: req.body.notes
    });

    // Get the completed workout details
    const completedWorkout = await Workout.findByPk(req.body.workout_id, {
      include: [
        {
          model: Exercise,
          include: [MuscleGroup]
        }
      ]
    });

    // Get user data for next workout recommendation
    const user = await db.user.findByPk(req.userId);
    
    // Get all exercises for the genetic algorithm
    const allExercises = await Exercise.findAll({
      include: [{ model: MuscleGroup }]
    });
    
    // Get existing workouts for inspiration
    const existingWorkouts = await Workout.findAll({
      include: [{
        model: Exercise,
        through: {
          attributes: ['sets', 'repetitions', 'rest_time']
        },
        include: [{ model: MuscleGroup }]
      }]
    });

    // Determine the next split based on training history
    const currentSplitIndex = await getCurrentSplit(completedWorkout);
    const nextSplitIndex = await getNextSplitIndex(currentSplitIndex, req.userId);
    logger.info(`User ${req.userId} completed a ${getTrainingSplits()[currentSplitIndex]?.name || 'unknown'} workout, next recommended split: ${getTrainingSplits()[nextSplitIndex]?.name || 'unknown'}`);

    // Generate next workout using genetic algorithm
    const nextWorkout = await geneticAlgorithm(user, allExercises, existingWorkouts, nextSplitIndex);

    // Return both the created history and the next recommended workout
    return res.status(201).json({
      success: true,
      message: 'Treino registrado com sucesso',
      history: history,
      nextWorkout: {
        workout: nextWorkout,
        split_info: {
          name: getTrainingSplits()[nextSplitIndex].name,
          description: `Próximo treino recomendado na sequência: foco em ${getTrainingSplits()[nextSplitIndex].name}.`
        }
      }
    });
  } catch (error) {
    logger.error('Error recording workout history:', error);
    return res.status(500).json({
      success: false,
      message: 'Falha ao registrar treino',
      error: error.message
    });
  }
};

// Helper function to determine the current split based on the completed workout
async function getCurrentSplit(workout) {
  if (!workout) return 0;
  
  // Extract muscle groups from the workout
  const muscleGroupIds = workout.exercises.map(ex => ex.muscle_group_id);
  const uniqueGroupIds = [...new Set(muscleGroupIds)];
  
  // Get all training splits
  const splits = getTrainingSplits();
  
  // Find the split that best matches the workout's muscle groups
  let bestMatch = 0;
  let bestMatchScore = -1;
  
  splits.forEach((split, index) => {
    let score = 0;
    
    // Score primary groups matches
    split.primaryGroups.forEach(groupId => {
      if (uniqueGroupIds.includes(groupId)) {
        score += 3;
      }
    });
    
    // Score secondary groups matches
    split.secondaryGroups.forEach(groupId => {
      if (uniqueGroupIds.includes(groupId)) {
        score += 2;
      }
    });
    
    if (score > bestMatchScore) {
      bestMatchScore = score;
      bestMatch = index;
    }
  });
  
  return bestMatch;
}

// Helper function to determine the next split in the sequence
async function getNextSplitIndex(currentSplitIndex, userId) {
  const splits = getTrainingSplits();
  
  // Simple sequential progression through splits
  const nextIndex = (currentSplitIndex + 1) % splits.length;
  
  // Advanced logic: check if we should skip any split based on training history
  // For now, we'll use a simple sequential approach
  return nextIndex;
}

// The rest of the controller functions remain unchanged
// Obter todos os workout history para um usuário
exports.findAll = async (req, res) => {
  try {
    const histories = await WorkoutHistory.findAll({
      where: { user_id: req.userId },
      include: [
        {
          model: Workout,
          attributes: ['id', 'name', 'goal', 'experience_level', 'estimated_duration'],
          include: [
            {
              model: Exercise,
              through: {
                attributes: ['sets', 'repetitions', 'rest_time']
              },
              include: [
                {
                  model: MuscleGroup,
                  attributes: ['name']
                }
              ]
            }
          ]
        }
      ],
      order: [['workout_date', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      history: histories
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao buscar histórico de treinos',
      error: error.message
    });
  }
};

// Get recent workout history
exports.getRecent = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const histories = await WorkoutHistory.findAll({
      where: { user_id: req.userId },
      limit: limit,
      include: [
        {
          model: Workout,
          attributes: ['id', 'name', 'goal', 'experience_level']
        }
      ],
      order: [['workout_date', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      history: histories
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao buscar histórico recente',
      error: error.message
    });
  }
};

// Get workout history stats
exports.getStats = async (req, res) => {
  try {
    // Total workouts
    const totalWorkouts = await WorkoutHistory.count({
      where: { user_id: req.userId }
    });
    
    // Workouts this month
    const thisMonth = await WorkoutHistory.count({
      where: {
        user_id: req.userId,
        workout_date: {
          [Op.gte]: Sequelize.literal('DATE_FORMAT(NOW(), "%Y-%m-01")')
        }
      }
    });
    
    // Streak calculation (simplified)
    const workoutDates = await WorkoutHistory.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('workout_date')), 'date']
      ],
      where: { user_id: req.userId },
      order: [['workout_date', 'DESC']],
      raw: true
    });
    
    let streak = 0;
    if (workoutDates.length > 0) {
      // Check if most recent workout was today
      const today = new Date();
      const mostRecentDate = new Date(workoutDates[0].date);
      
      if (today.toDateString() === mostRecentDate.toDateString()) {
        streak = 1;
        
        // Check consecutive days
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        for (let i = 1; i < workoutDates.length; i++) {
          const currentDate = new Date(workoutDates[i].date);
          if (yesterday.toDateString() === currentDate.toDateString()) {
            streak++;
            yesterday.setDate(yesterday.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }
    
    // Get next recommended workout
    let nextRecommendedSplit = await getRecommendedSplit(req.userId);
    const splits = getTrainingSplits();
    
    return res.status(200).json({
      success: true,
      stats: {
        totalWorkouts,
        thisMonth,
        streak,
        nextRecommendedSplit: splits[nextRecommendedSplit].name
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao buscar estatísticas',
      error: error.message
    });
  }
};

// Get a single workout history entry
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const history = await WorkoutHistory.findOne({
      where: {
        id: id,
        user_id: req.userId
      },
      include: [
        {
          model: Workout,
          include: [
            {
              model: Exercise,
              through: {
                attributes: ['sets', 'repetitions', 'rest_time']
              },
              include: [
                {
                  model: MuscleGroup,
                  attributes: ['name']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!history) {
      return res.status(404).json({
        success: false,
        message: `Registro de treino com id=${id} não encontrado`
      });
    }

    return res.status(200).json({
      success: true,
      history: history
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao buscar registro de treino',
      error: error.message
    });
  }
};

// Delete a workout history entry
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    const result = await WorkoutHistory.destroy({
      where: {
        id: id,
        user_id: req.userId
      }
    });

    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: `Não foi possível excluir o registro de treino com id=${id}`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Registro de treino excluído com sucesso'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao excluir registro de treino',
      error: error.message
    });
  }
};

// New endpoint to get next recommended workout
exports.getNextWorkout = async (req, res) => {
  try {
    // Get the user info
    const user = await db.user.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Get all exercises for the genetic algorithm
    const allExercises = await Exercise.findAll({
      include: [{ model: MuscleGroup }]
    });
    
    // Get existing workouts for inspiration
    const existingWorkouts = await Workout.findAll({
      include: [{
        model: Exercise,
        through: {
          attributes: ['sets', 'repetitions', 'rest_time']
        },
        include: [{ model: MuscleGroup }]
      }]
    });

    // Determine the next recommended split
    const nextSplitIndex = await getRecommendedSplit(req.userId);
    const splits = getTrainingSplits();

    // Generate next workout using genetic algorithm
    const nextWorkout = await geneticAlgorithm(user, allExercises, existingWorkouts, nextSplitIndex);

    return res.status(200).json({
      success: true,
      workout: nextWorkout,
      split_info: {
        name: splits[nextSplitIndex].name,
        description: `Próximo treino recomendado na sequência: foco em ${splits[nextSplitIndex].name}.`,
        split_details: splits[nextSplitIndex]
      }
    });
  } catch (error) {
    logger.error('Error getting next recommended workout:', error);
    return res.status(500).json({
      success: false,
      message: 'Falha ao gerar próximo treino recomendado',
      error: error.message
    });
  }
};