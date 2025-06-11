const db = require('../models');
const WorkoutHistory = db.history;
const Workout = db.workout;
const Exercise = db.exercise;
const MuscleGroup = db.muscleGroup;
const Sequelize = db.Sequelize;
const Op = db.Sequelize.Op;

// Create a workout history record
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

    return res.status(201).json({
      success: true,
      message: 'Treino registrado com sucesso',
      history: history
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao registrar treino',
      error: error.message
    });
  }
};

// Get all workout history for a user
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
    
    return res.status(200).json({
      success: true,
      stats: {
        totalWorkouts,
        thisMonth,
        streak
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