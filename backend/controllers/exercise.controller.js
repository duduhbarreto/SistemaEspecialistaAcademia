const db = require('../models');
const Exercise = db.exercise;
const MuscleGroup = db.muscleGroup;
const Workout = db.workout;
const Op = db.Sequelize.Op;

// Get all exercises
exports.findAll = async (req, res) => {
  try {
    const exercises = await Exercise.findAll({
      include: [
        {
          model: MuscleGroup,
          attributes: ['id', 'name']
        }
      ],
      order: [['name', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      exercises: exercises
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao buscar exercícios',
      error: error.message
    });
  }
};

// Get a single exercise
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const exercise = await Exercise.findByPk(id, {
      include: [
        {
          model: MuscleGroup,
          attributes: ['id', 'name']
        },
        {
          model: Workout,
          attributes: ['id', 'name', 'goal', 'experience_level'],
          through: {
            attributes: ['sets', 'repetitions', 'rest_time']
          }
        }
      ]
    });

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: `Exercício com id=${id} não encontrado`
      });
    }

    return res.status(200).json({
      success: true,
      exercise: exercise
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao buscar exercício',
      error: error.message
    });
  }
};

// Get exercises by muscle group
exports.findByMuscleGroup = async (req, res) => {
  try {
    const muscleGroupId = req.params.id;
    
    const exercises = await Exercise.findAll({
      where: {
        muscle_group_id: muscleGroupId
      },
      include: [
        {
          model: MuscleGroup,
          attributes: ['id', 'name']
        }
      ],
      order: [['name', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      exercises: exercises
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao buscar exercícios por grupo muscular',
      error: error.message
    });
  }
};

// Get exercises by difficulty level
exports.findByDifficulty = async (req, res) => {
  try {
    const difficultyLevel = req.params.level;
    
    const exercises = await Exercise.findAll({
      where: {
        difficulty_level: difficultyLevel
      },
      include: [
        {
          model: MuscleGroup,
          attributes: ['id', 'name']
        }
      ],
      order: [['name', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      exercises: exercises
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao buscar exercícios por nível de dificuldade',
      error: error.message
    });
  }
};

// Create a new exercise
exports.create = async (req, res) => {
  try {
    const exercise = await Exercise.create({
      name: req.body.name,
      description: req.body.description,
      muscle_group_id: req.body.muscle_group_id,
      difficulty_level: req.body.difficulty_level,
      equipment_required: req.body.equipment_required
    });

    return res.status(201).json({
      success: true,
      message: 'Exercício criado com sucesso',
      exercise: exercise
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao criar exercício',
      error: error.message
    });
  }
};

// Update an exercise
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    const result = await Exercise.update(req.body, {
      where: { id: id }
    });

    if (result[0] === 0) {
      return res.status(404).json({
        success: false,
        message: `Não foi possível atualizar o exercício com id=${id}.`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Exercício atualizado com sucesso'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao atualizar exercício',
      error: error.message
    });
  }
};

// Delete an exercise
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    const result = await Exercise.destroy({
      where: { id: id }
    });

    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: `Não foi possível excluir o exercício com id=${id}.`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Exercício excluído com sucesso'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao excluir exercício',
      error: error.message
    });
  }
};

// Search exercises
exports.search = async (req, res) => {
  try {
    const { term } = req.query;
    
    const exercises = await Exercise.findAll({
      where: {
        name: {
          [Op.like]: `%${term}%`
        }
      },
      include: [
        {
          model: MuscleGroup,
          attributes: ['id', 'name']
        }
      ],
      order: [['name', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      exercises: exercises
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao buscar exercícios',
      error: error.message
    });
  }
};