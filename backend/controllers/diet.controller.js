const db = require('../models');
const Diet = db.diet;
const DietRestriction = db.dietRestriction;
const Food = db.food;
const User = db.user;

// Funções auxiliares para cálculos
const calculateBMR = (gender, weight, height, age) => {
  // Fórmula de Harris-Benedict para metabolismo basal
  if (gender === 'Masculino') {
    return 88.362 + (13.397 * weight) + (4.799 * height * 100) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height * 100) - (4.330 * age);
  }
};

const getActivityMultiplier = (activityLevel) => {
  const multipliers = {
    'Sedentário': 1.2,
    'Levemente ativo': 1.375,
    'Moderadamente ativo': 1.55,
    'Muito ativo': 1.725,
    'Extremamente ativo': 1.9
  };
  return multipliers[activityLevel] || 1.2;
};

// Nova função para calcular IMC e categoria corporal
const calculateBMI = (weight, height) => {
  return weight / (height * height);
};

const getBMICategory = (bmi) => {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
};

// Nova função para determinar ajuste calórico inteligente
const getSmartCaloricAdjustment = (goal, experienceLevel, bmi, bmiCategory, activityLevel) => {
  let adjustment = 0;
  let strategy = '';
  let weeklyWeightChange = 0;

  switch (goal) {
    case 'Perda de peso':
      // Cutting estratégico baseado na composição corporal e experiência
      if (bmiCategory === 'obese') {
        // Pessoas com obesidade podem ter déficit maior
        adjustment = experienceLevel === 'Iniciante' ? -600 : -700;
        strategy = 'Cutting Agressivo';
        weeklyWeightChange = -0.7;
      } else if (bmiCategory === 'overweight') {
        adjustment = experienceLevel === 'Avançado' ? -450 : -500;
        strategy = 'Cutting Moderado';
        weeklyWeightChange = -0.5;
      } else {
        // Pessoas com peso normal precisam de abordagem mais conservadora
        adjustment = experienceLevel === 'Avançado' ? -300 : -400;
        strategy = 'Cutting Conservador';
        weeklyWeightChange = -0.3;
      }
      break;

    case 'Hipertrofia':
      // Bulking estratégico baseado na experiência e atividade
      if (bmiCategory === 'underweight' || bmiCategory === 'normal') {
        if (experienceLevel === 'Iniciante') {
          adjustment = +400; // Iniciantes podem ganhar peso mais rapidamente
          strategy = 'Lean Bulk Moderado';
          weeklyWeightChange = +0.4;
        } else if (experienceLevel === 'Intermediário') {
          adjustment = +300;
          strategy = 'Lean Bulk';
          weeklyWeightChange = +0.3;
        } else {
          adjustment = +250; // Avançados precisam ser mais conservadores
          strategy = 'Lean Bulk Conservador';
          weeklyWeightChange = +0.25;
        }
      } else {
        // Pessoas acima do peso ideal fazem body recomposition
        adjustment = experienceLevel === 'Iniciante' ? +200 : +150;
        strategy = 'Body Recomposition';
        weeklyWeightChange = +0.1;
      }
      break;

    case 'Definição':
      // Mini-cut para pessoas que já têm massa muscular
      if (bmiCategory === 'normal' || bmiCategory === 'overweight') {
        adjustment = experienceLevel === 'Avançado' ? -300 : -350;
        strategy = 'Mini Cut';
        weeklyWeightChange = -0.3;
      } else {
        adjustment = -250;
        strategy = 'Definição Suave';
        weeklyWeightChange = -0.25;
      }
      break;

    case 'Condicionamento':
      // Manutenção com leve déficit para melhorar composição corporal
      adjustment = bmiCategory === 'normal' ? -100 : -200;
      strategy = 'Manutenção Ativa';
      weeklyWeightChange = -0.1;
      break;

    case 'Reabilitação':
      // Manutenção ou leve superávit para recuperação
      adjustment = +100;
      strategy = 'Recuperação';
      weeklyWeightChange = +0.1;
      break;

    default:
      adjustment = 0;
      strategy = 'Manutenção';
      weeklyWeightChange = 0;
  }

  // Ajuste adicional baseado no nível de atividade
  if (activityLevel === 'Muito ativo' || activityLevel === 'Extremamente ativo') {
    if (adjustment < 0) adjustment -= 50; // Mais déficit para muito ativos
    if (adjustment > 0) adjustment += 50; // Mais superávit para muito ativos
  }

  return {
    adjustment,
    strategy,
    weeklyWeightChange,
    description: getStrategyDescription(strategy, Math.abs(weeklyWeightChange))
  };
};

const getStrategyDescription = (strategy, weeklyChange) => {
  const descriptions = {
    'Cutting Agressivo': `Déficit maior para perda de peso acelerada (~${weeklyChange}kg/semana). Requer acompanhamento próximo.`,
    'Cutting Moderado': `Déficit equilibrado para perda de peso sustentável (~${weeklyChange}kg/semana). Ideal para a maioria das pessoas.`,
    'Cutting Conservador': `Déficit suave para preservar massa muscular (~${weeklyChange}kg/semana). Recomendado para pessoas próximas ao peso ideal.`,
    'Lean Bulk': `Superávit controlado para ganho de massa com mínimo de gordura (~${weeklyChange}kg/semana).`,
    'Lean Bulk Moderado': `Superávit moderado ideal para iniciantes (~${weeklyChange}kg/semana).`,
    'Lean Bulk Conservador': `Superávit mínimo para atletas avançados (~${weeklyChange}kg/semana).`,
    'Body Recomposition': `Recomposição corporal - ganho de músculo e perda de gordura simultâneos.`,
    'Mini Cut': `Déficit curto e intenso para definição rápida (~${weeklyChange}kg/semana).`,
    'Definição Suave': `Déficit leve para definição gradual (~${weeklyChange}kg/semana).`,
    'Manutenção Ativa': `Leve déficit para melhorar composição corporal mantendo performance.`,
    'Recuperação': `Leve superávit para otimizar recuperação e performance.`,
    'Manutenção': `Calorias de manutenção para estabilizar o peso atual.`
  };
  return descriptions[strategy] || 'Estratégia personalizada baseada no seu perfil.';
};

const calculateMacrosByGoal = (totalCalories, goal, weight, strategy) => {
  let protein, carbs, fat;
  
  // Proteína sempre alta para preservar/construir massa muscular
  const proteinMultiplier = strategy.includes('Cutting') ? 2.4 : 
                           strategy.includes('Bulk') ? 2.0 : 2.2;
  
  protein = weight * proteinMultiplier;
  
  switch (goal) {
    case 'Perda de peso':
    case 'Definição':
      // Mais proteína, gorduras moderadas, carboidratos ajustados
      fat = (totalCalories * 0.25) / 9;
      carbs = (totalCalories - (protein * 4) - (fat * 9)) / 4;
      break;
      
    case 'Hipertrofia':
      // Carboidratos altos para energia, gorduras moderadas
      fat = (totalCalories * 0.23) / 9;
      carbs = (totalCalories - (protein * 4) - (fat * 9)) / 4;
      break;
      
    case 'Condicionamento':
      // Carboidratos moderados-altos para performance
      fat = (totalCalories * 0.27) / 9;
      carbs = (totalCalories - (protein * 4) - (fat * 9)) / 4;
      break;
      
    case 'Reabilitação':
      // Gorduras mais altas para anti-inflamatório
      fat = (totalCalories * 0.32) / 9;
      carbs = (totalCalories - (protein * 4) - (fat * 9)) / 4;
      break;
      
    default:
      fat = (totalCalories * 0.28) / 9;
      carbs = (totalCalories - (protein * 4) - (fat * 9)) / 4;
  }
  
  return {
    protein: Math.round(Math.max(protein, 1)),
    carbs: Math.round(Math.max(carbs, 1)),
    fat: Math.round(Math.max(fat, 1))
  };
};

// Calcular dieta do usuário com ajustes inteligentes
exports.calculateDiet = async (req, res) => {
  try {
    const userId = req.userId;
    const { activity_level, gender, diet_approach } = req.body;
    
    // Obter dados do usuário
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Calcular IMC e categoria
    const bmi = calculateBMI(user.weight, user.height);
    const bmiCategory = getBMICategory(bmi);
    
    // Calcular necessidades calóricas base
    const bmr = calculateBMR(gender || 'Masculino', user.weight, user.height, user.age);
    const activityMultiplier = getActivityMultiplier(activity_level);
    const maintenanceCalories = Math.round(bmr * activityMultiplier);
    
    // Obter ajuste calórico inteligente
    const caloricStrategy = getSmartCaloricAdjustment(
      user.goal, 
      user.experience_level, 
      bmi, 
      bmiCategory, 
      activity_level
    );
    
    // Aplicar ajuste personalizado se fornecido
    let finalAdjustment = caloricStrategy.adjustment;
    if (diet_approach && diet_approach !== 'automatic') {
      const manualAdjustments = {
        'aggressive_cut': -600,
        'moderate_cut': -400,
        'conservative_cut': -250,
        'maintenance': 0,
        'lean_bulk': +250,
        'moderate_bulk': +400,
        'aggressive_bulk': +600
      };
      finalAdjustment = manualAdjustments[diet_approach] || finalAdjustment;
    }
    
    const totalCalories = maintenanceCalories + finalAdjustment;
    
    // Calcular macronutrientes
    const macros = calculateMacrosByGoal(totalCalories, user.goal, user.weight, caloricStrategy.strategy);
    
    // Verificar se o usuário já tem uma dieta
    let diet = await Diet.findOne({ where: { user_id: userId } });
    
    const dietData = {
      user_id: userId,
      activity_level: activity_level,
      calories: totalCalories,
      maintenance_calories: maintenanceCalories,
      caloric_adjustment: finalAdjustment,
      strategy: caloricStrategy.strategy,
      strategy_description: caloricStrategy.description,
      weekly_weight_change: caloricStrategy.weeklyWeightChange,
      bmi: Math.round(bmi * 10) / 10,
      bmi_category: bmiCategory,
      protein_g: macros.protein,
      carbs_g: macros.carbs,
      fat_g: macros.fat,
      last_updated: new Date()
    };
    
    if (diet) {
      // Atualizar dieta existente
      await Diet.update(dietData, { where: { user_id: userId } });
    } else {
      // Criar nova dieta
      diet = await Diet.create(dietData);
    }
    
    // Buscar dieta atualizada
    const updatedDiet = await Diet.findOne({ 
      where: { user_id: userId },
      include: [{
        model: User,
        attributes: ['name', 'goal', 'weight', 'height', 'age', 'experience_level']
      }]
    });
    
    return res.status(200).json({
      success: true,
      message: 'Dieta calculada com sucesso',
      diet: updatedDiet,
      insights: {
        bmr: Math.round(bmr),
        maintenanceCalories,
        strategy: caloricStrategy.strategy,
        weeklyWeightChange: caloricStrategy.weeklyWeightChange,
        bmiStatus: bmiCategory,
        proteinPerKg: Math.round((macros.protein / user.weight) * 10) / 10
      }
    });
  } catch (error) {
    console.error('Error calculating diet:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao calcular dieta',
      error: error.message
    });
  }
};

// Resto das funções permanecem iguais...
exports.getDiet = async (req, res) => {
  try {
    const userId = req.userId;
    
    const diet = await Diet.findOne({ 
      where: { user_id: userId },
      include: [{
        model: User,
        attributes: ['name', 'goal', 'weight', 'height', 'age', 'experience_level']
      }]
    });
    
    if (!diet) {
      return res.status(404).json({
        success: false,
        message: 'Dieta não encontrada para este usuário'
      });
    }
    
    return res.status(200).json({
      success: true,
      diet: diet
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar dieta',
      error: error.message
    });
  }
};

// Demais funções permanecem iguais (saveRestriction, getRestrictions, deleteRestriction, getFoodSuggestions)
exports.saveRestriction = async (req, res) => {
  try {
    const userId = req.userId;
    const { restriction_type, description } = req.body;
    
    const restriction = await DietRestriction.create({
      user_id: userId,
      restriction_type,
      description
    });
    
    return res.status(201).json({
      success: true,
      message: 'Restrição alimentar adicionada com sucesso',
      restriction
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao adicionar restrição alimentar',
      error: error.message
    });
  }
};

exports.getRestrictions = async (req, res) => {
  try {
    const userId = req.userId;
    
    const restrictions = await DietRestriction.findAll({
      where: { user_id: userId }
    });
    
    return res.status(200).json({
      success: true,
      restrictions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar restrições alimentares',
      error: error.message
    });
  }
};

exports.deleteRestriction = async (req, res) => {
  try {
    const userId = req.userId;
    const restrictionId = req.params.id;
    
    const result = await DietRestriction.destroy({
      where: {
        id: restrictionId,
        user_id: userId
      }
    });
    
    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restrição não encontrada ou não pertence a este usuário'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Restrição alimentar removida com sucesso'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao remover restrição alimentar',
      error: error.message
    });
  }
};

exports.getFoodSuggestions = async (req, res) => {
  try {
    const userId = req.userId;
    
    const diet = await Diet.findOne({ where: { user_id: userId } });
    
    if (!diet) {
      return res.status(404).json({
        success: false,
        message: 'Dieta não encontrada. Por favor, calcule sua dieta primeiro.'
      });
    }
    
    const restrictions = await DietRestriction.findAll({
      where: { user_id: userId }
    });
    
    const restrictionTexts = restrictions.map(r => r.description.toLowerCase());
    
    const proteinFoods = await Food.findAll({ 
      where: { category: 'Proteína' },
      limit: 10
    });
    
    const carbFoods = await Food.findAll({ 
      where: { category: 'Carboidrato' },
      limit: 10
    });
    
    const fatFoods = await Food.findAll({ 
      where: { category: 'Gordura' },
      limit: 5
    });
    
    const vegetables = await Food.findAll({ 
      where: { category: 'Vegetal' },
      limit: 8
    });
    
    const fruits = await Food.findAll({ 
      where: { category: 'Fruta' },
      limit: 5
    });
    
    const filterByRestrictions = (foodList) => {
      return foodList.filter(food => {
        return !restrictionTexts.some(restriction => 
          food.name.toLowerCase().includes(restriction));
      });
    };
    
    const filteredProtein = filterByRestrictions(proteinFoods);
    const filteredCarbs = filterByRestrictions(carbFoods);
    const filteredFats = filterByRestrictions(fatFoods);
    const filteredVegetables = filterByRestrictions(vegetables);
    const filteredFruits = filterByRestrictions(fruits);
    
    const mealSuggestions = {
      cafe_da_manha: {
        name: "Café da manhã",
        options: [
          {
            name: "Opção 1",
            foods: [
              filteredProtein.length > 0 ? filteredProtein[0].name : "Ovos mexidos",
              filteredCarbs.length > 0 ? filteredCarbs[0].name : "Pão integral",
              filteredFruits.length > 0 ? filteredFruits[0].name : "Banana"
            ],
            macros: {
              calories: Math.round(diet.calories * 0.25),
              protein: Math.round(diet.protein_g * 0.2),
              carbs: Math.round(diet.carbs_g * 0.25),
              fat: Math.round(diet.fat_g * 0.2)
            }
          }
        ]
      }
    };
    
    return res.status(200).json({
      success: true,
      diet: diet,
      foodSuggestions: {
        proteins: filteredProtein,
        carbs: filteredCarbs,
        fats: filteredFats,
        vegetables: filteredVegetables,
        fruits: filteredFruits
      },
      mealSuggestions: mealSuggestions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar sugestões de alimentos',
      error: error.message
    });
  }
};