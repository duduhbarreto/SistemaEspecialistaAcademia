const db = require('../models');
const MuscleGroup = db.muscleGroup;

// Obter todos os grupos musculares
exports.findAll = async (req, res) => {
  try {
    const muscleGroups = await MuscleGroup.findAll({
      order: [['name', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      muscleGroups: muscleGroups
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao buscar grupos musculares',
      error: error.message
    });
  }
};

// Obter um grupo muscular específico
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const muscleGroup = await MuscleGroup.findByPk(id);

    if (!muscleGroup) {
      return res.status(404).json({
        success: false,
        message: `Grupo muscular com id=${id} não encontrado`
      });
    }

    return res.status(200).json({
      success: true,
      muscleGroup: muscleGroup
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Falha ao buscar grupo muscular',
      error: error.message
    });
  }
};