/**
 * Request validation middleware
 */

// Validate user registration
exports.validateSignup = (req, res, next) => {
    // Get data from request body
    const { name, email, password, age, weight, height, goal, experience_level } = req.body;
    const errors = {};
    
    // Validate name
    if (!name || name.trim() === '') {
      errors.name = 'Nome é obrigatório';
    } else if (name.length < 3) {
      errors.name = 'Nome deve ter pelo menos 3 caracteres';
    } else if (name.length > 100) {
      errors.name = 'Nome não pode exceder 100 caracteres';
    }
    
    // Validate email
    if (!email || email.trim() === '') {
      errors.email = 'Email é obrigatório';
    } else {
      // Regular expression for email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = 'Email inválido';
      }
    }
    
    // Validate password
    if (!password || password.trim() === '') {
      errors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    // Validate age
    if (!age) {
      errors.age = 'Idade é obrigatória';
    } else if (isNaN(age) || age < 0 || age > 120) {
      errors.age = 'Idade inválida';
    }
    
    // Validate weight
    if (!weight) {
      errors.weight = 'Peso é obrigatório';
    } else if (isNaN(weight) || weight <= 0) {
      errors.weight = 'Peso inválido';
    }
    
    // Validate height
    if (!height) {
      errors.height = 'Altura é obrigatória';
    } else if (isNaN(height) || height <= 0) {
      errors.height = 'Altura inválida';
    }
    
    // Validate goal
    const validGoals = ['Perda de peso', 'Hipertrofia', 'Condicionamento', 'Definição', 'Reabilitação'];
    if (!goal || goal.trim() === '') {
      errors.goal = 'Objetivo é obrigatório';
    } else if (!validGoals.includes(goal)) {
      errors.goal = 'Objetivo inválido';
    }
    
    // Validate experience_level
    const validLevels = ['Iniciante', 'Intermediário', 'Avançado'];
    if (!experience_level || experience_level.trim() === '') {
      errors.experience_level = 'Nível de experiência é obrigatório';
    } else if (!validLevels.includes(experience_level)) {
      errors.experience_level = 'Nível de experiência inválido';
    }
    
    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dados de cadastro inválidos',
        errors: errors
      });
    }
    
    // If everything is valid, proceed to the next middleware
    next();
  };
  
  // Validate login
  exports.validateSignin = (req, res, next) => {
    // Get data from request body
    const { email, password } = req.body;
    const errors = {};
    
    // Validate email
    if (!email || email.trim() === '') {
      errors.email = 'Email é obrigatório';
    } else {
      // Regular expression for email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = 'Email inválido';
      }
    }
    
    // Validate password
    if (!password || password.trim() === '') {
      errors.password = 'Senha é obrigatória';
    }
    
    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dados de login inválidos',
        errors: errors
      });
    }
    
    // If everything is valid, proceed to the next middleware
    next();
  };
  
  // Validate workout history creation
  exports.validateHistoryCreate = (req, res, next) => {
    // Get data from request body
    const { workout_id, feedback } = req.body;
    const errors = {};
    
    // Validate workout_id
    if (!workout_id) {
      errors.workout_id = 'ID do treino é obrigatório';
    } else if (isNaN(workout_id) || workout_id <= 0) {
      errors.workout_id = 'ID do treino inválido';
    }
    
    // Validate feedback
    const validFeedbacks = ['Muito fácil', 'Adequado', 'Difícil', 'Muito difícil'];
    if (!feedback || feedback.trim() === '') {
      errors.feedback = 'Feedback é obrigatório';
    } else if (!validFeedbacks.includes(feedback)) {
      errors.feedback = 'Feedback inválido';
    }
    
    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dados de registro de treino inválidos',
        errors: errors
      });
    }
    
    // If everything is valid, proceed to the next middleware
    next();
  };
  
  // Validate exercise creation
  exports.validateExerciseCreate = (req, res, next) => {
    // Get data from request body
    const { name, description, muscle_group_id, difficulty_level, equipment_required } = req.body;
    const errors = {};
    
    // Validate name
    if (!name || name.trim() === '') {
      errors.name = 'Nome é obrigatório';
    } else if (name.length < 3) {
      errors.name = 'Nome deve ter pelo menos 3 caracteres';
    } else if (name.length > 100) {
      errors.name = 'Nome não pode exceder 100 caracteres';
    }
    
    // Validate description
    if (!description || description.trim() === '') {
      errors.description = 'Descrição é obrigatória';
    }
    
    // Validate muscle_group_id
    if (!muscle_group_id) {
      errors.muscle_group_id = 'ID do grupo muscular é obrigatório';
    } else if (isNaN(muscle_group_id) || muscle_group_id <= 0) {
      errors.muscle_group_id = 'ID do grupo muscular inválido';
    }
    
    // Validate difficulty_level
    const validLevels = ['Fácil', 'Médio', 'Difícil'];
    if (!difficulty_level || difficulty_level.trim() === '') {
      errors.difficulty_level = 'Nível de dificuldade é obrigatório';
    } else if (!validLevels.includes(difficulty_level)) {
      errors.difficulty_level = 'Nível de dificuldade inválido';
    }
    
    // Validate equipment_required
    if (equipment_required === undefined) {
      errors.equipment_required = 'Informação sobre equipamento é obrigatória';
    } else if (typeof equipment_required !== 'boolean') {
      errors.equipment_required = 'Valor inválido para equipamento';
    }
    
    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dados de exercício inválidos',
        errors: errors
      });
    }
    
    // If everything is valid, proceed to the next middleware
    next();
  };