const bcrypt = require('bcryptjs');
const db = require('../models');
const User = db.user;
const WorkoutHistory = db.history;
const Sequelize = db.Sequelize;
const Op = db.Sequelize.Op;

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    return res.status(200).json({
      success: true,
      user: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar perfil',
      error: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Update user data
    const result = await User.update(
      {
        weight: req.body.weight,
        height: req.body.height,
        goal: req.body.goal,
        experience_level: req.body.experience_level
      },
      {
        where: { id: userId }
      }
    );
    
    if (result[0] === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado ou nenhum campo foi alterado'
      });
    }
    
    // Get updated user
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      user: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar perfil',
      error: error.message
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;
    
    // Find user
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Check current password
    const validPassword = bcrypt.compareSync(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }
    
    // Update password
    await User.update(
      {
        password: bcrypt.hashSync(newPassword, 8)
      },
      {
        where: { id: userId }
      }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao alterar senha',
      error: error.message
    });
  }
};

// Get user stats
exports.getStats = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get total workouts count
    const totalWorkouts = await WorkoutHistory.count({
      where: { user_id: userId }
    });
    
    // Get workouts in the last 30 days
    const lastMonth = await WorkoutHistory.count({
      where: {
        user_id: userId,
        workout_date: {
          [Op.gte]: Sequelize.literal('DATE_SUB(NOW(), INTERVAL 30 DAY)')
        }
      }
    });
    
    // Get streak (consecutive days)
    // This is a simplified version - a more sophisticated calculation would be needed for a real app
    const workoutDates = await WorkoutHistory.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('workout_date')), 'date']
      ],
      where: { user_id: userId },
      order: [['workout_date', 'DESC']],
      raw: true
    });
    
    let streak = 0;
    if (workoutDates.length > 0) {
      // Check if the most recent workout was today
      const today = new Date();
      const mostRecentDate = new Date(workoutDates[0].date);
      
      if (today.toDateString() === mostRecentDate.toDateString()) {
        streak = 1;
        
        // Check for consecutive days
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
        lastMonth,
        streak
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas',
      error: error.message
    });
  }
};

// Adicionar ao backend/controllers/user.controller.js

// Atualizar email
exports.updateEmail = async (req, res) => {
  try {
    const userId = req.userId;
    const { email, password } = req.body;
    
    // Validar email
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }
    
    // Verificar se o email já está em uso
    const existingUser = await User.findOne({
      where: { 
        email: email,
        id: { [Op.ne]: userId }
      }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Este email já está em uso'
      });
    }
    
    // Verificar senha atual
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: 'Senha incorreta'
      });
    }
    
    // Atualizar email
    await User.update(
      { email: email },
      { where: { id: userId } }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Email atualizado com sucesso',
      email: email
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar email',
      error: error.message
    });
  }
};

// Atualizar nome e idade
exports.updatePersonalInfo = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, age } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nome é obrigatório'
      });
    }
    
    if (!age || isNaN(age) || age <= 0 || age > 120) {
      return res.status(400).json({
        success: false,
        message: 'Idade inválida'
      });
    }
    
    await User.update(
      { name, age },
      { where: { id: userId } }
    );
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Informações pessoais atualizadas com sucesso',
      user: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar informações pessoais',
      error: error.message
    });
  }
};

// Excluir conta
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;
    
    // Verificar senha
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: 'Senha incorreta'
      });
    }
    
    // Excluir usuário
    await User.destroy({
      where: { id: userId }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Conta excluída com sucesso'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao excluir conta',
      error: error.message
    });
  }
};