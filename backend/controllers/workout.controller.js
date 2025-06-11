const db = require('../models');
const Workout = db.workout;
const Exercise = db.exercise;
const MuscleGroup = db.muscleGroup;
const WorkoutExercise = db.workoutExercise;
const logger = require('../utils/logger');
const Op = db.Sequelize.Op;

// Create a new workout
exports.create = async (req, res) => {
  try {
    // Create workout
    const workout = await Workout.create({
      name: req.body.name,
      description: req.body.description,
      goal: req.body.goal,
      experience_level: req.body.experience_level,
      estimated_duration: req.body.estimated_duration
    });

    // If exercises are provided, associate them with the workout
    if (req.body.exercises && Array.isArray(req.body.exercises)) {
      const workoutExercises = req.body.exercises.map(exercise => ({
        workout_id: workout.id,
        exercise_id: exercise.exercise_id,
        sets: exercise.sets,
        repetitions: exercise.repetitions,
        rest_time: exercise.rest_time
      }));

      await WorkoutExercise.bulkCreate(workoutExercises);
    }

    return res.status(201).json({
      success: true,
      message: 'Treino criado com sucesso',
      workout: workout
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao criar treino',
      error: error.message
    });
  }
};

// Get all workouts - adicionar logs para depuração
exports.findAll = async (req, res) => {
  try {
    logger.info(`Fetching all workouts, requested by user id: ${req.userId}`);
    
    const workouts = await Workout.findAll({
      order: [['name', 'ASC']]
    });

    logger.info(`Found ${workouts.length} workouts`);
    
    return res.status(200).json({
      success: true,
      workouts: workouts
    });
  } catch (error) {
    logger.error(`Error fetching workouts: ${error.message}`, { error: error.stack });
    
    return res.status(500).json({
      success: false,
      message: 'Falha ao buscar treinos',
      error: error.message
    });
  }
};

// Get recommended workout for user
exports.getRecommended = async (req, res) => {
  try {
    // Get user from request (set by auth middleware)
    const userId = req.userId;
    
    // Fetch user details
    const user = await db.user.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Logic to recommend workout based on user profile
    const recommendedWorkout = await Workout.findOne({
      where: {
        goal: user.goal,
        experience_level: user.experience_level
      },
      include: [
        {
          model: Exercise,
          through: {
            attributes: ['sets', 'repetitions', 'rest_time']
          },
          include: [
            {
              model: MuscleGroup,
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });
    
    // If no exact match, find workout with matching goal
    if (!recommendedWorkout) {
      const alternativeWorkout = await Workout.findOne({
        where: {
          goal: user.goal
        },
        include: [
          {
            model: Exercise,
            through: {
              attributes: ['sets', 'repetitions', 'rest_time']
            },
            include: [
              {
                model: MuscleGroup,
                attributes: ['id', 'name']
              }
            ]
          }
        ]
      });
      
      if (alternativeWorkout) {
        return res.status(200).json({
          success: true,
          workout: alternativeWorkout
        });
      }
      
      // If still no match, return any workout
      const anyWorkout = await Workout.findOne({
        include: [
          {
            model: Exercise,
            through: {
              attributes: ['sets', 'repetitions', 'rest_time']
            },
            include: [
              {
                model: MuscleGroup,
                attributes: ['id', 'name']
              }
            ]
          }
        ]
      });
      
      if (anyWorkout) {
        return res.status(200).json({
          success: true,
          workout: anyWorkout
        });
      }
      
      return res.status(404).json({
        success: false,
        message: 'Nenhum treino encontrado'
      });
    }
    
    return res.status(200).json({
      success: true,
      workout: recommendedWorkout
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao buscar treino recomendado',
      error: error.message
    });
  }
};

// Get a single workout
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const workout = await Workout.findByPk(id, {
      include: [
        {
          model: Exercise,
          through: {
            attributes: ['sets', 'repetitions', 'rest_time']
          },
          include: [
            {
              model: MuscleGroup,
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: `Treino com id=${id} não encontrado`
      });
    }

    return res.status(200).json({
      success: true,
      workout: workout
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao buscar treino',
      error: error.message
    });
  }
};

// Update a workout
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    const result = await Workout.update(req.body, {
      where: { id: id }
    });

    if (result[0] === 0) {
      return res.status(404).json({
        success: false,
        message: `Não foi possível atualizar o treino com id=${id}.`
      });
    }

    // If exercises are provided, update workout_exercise relationships
    if (req.body.exercises && Array.isArray(req.body.exercises)) {
      // First delete all existing relationships
      await WorkoutExercise.destroy({
        where: { workout_id: id }
      });
      
      // Then create new relationships
      const workoutExercises = req.body.exercises.map(exercise => ({
        workout_id: id,
        exercise_id: exercise.exercise_id,
        sets: exercise.sets,
        repetitions: exercise.repetitions,
        rest_time: exercise.rest_time
      }));

      await WorkoutExercise.bulkCreate(workoutExercises);
    }

    return res.status(200).json({
      success: true,
      message: 'Treino atualizado com sucesso'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao atualizar treino',
      error: error.message
    });
  }
};

// Delete a workout
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    const result = await Workout.destroy({
      where: { id: id }
    });

    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: `Não foi possível excluir o treino com id=${id}.`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Treino excluído com sucesso'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao excluir treino',
      error: error.message
    });
  }
};