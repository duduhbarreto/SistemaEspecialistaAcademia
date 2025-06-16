const db = require('../models');
const Workout = db.workout;
const Exercise = db.exercise;
const MuscleGroup = db.muscleGroup;
const WorkoutExercise = db.workoutExercise;
const logger = require('../utils/logger');
const Op = db.Sequelize.Op;

// ====================================================================
// FUNÇÕES BÁSICAS DE CRUD
// ====================================================================

// Criar novo workout
exports.create = async (req, res) => {
  try {
    // criar workout
    const workout = await Workout.create({
      name: req.body.name,
      description: req.body.description,
      goal: req.body.goal,
      experience_level: req.body.experience_level,
      estimated_duration: req.body.estimated_duration
    });

    // se os exercícios forem fornecidos, criar as associações
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

// Obter todos os treinos
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

// ====================================================================
// SISTEMA DE RECOMENDAÇÃO TRADICIONAL
// ====================================================================

// Obter exercícios recomendados para o usuário
exports.getRecommended = async (req, res) => {
  try {
    // Obter usuário da solicitação (definido pelo middleware de autenticação)
    const userId = req.userId;
    
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

// ====================================================================
// SISTEMA DE SEQUÊNCIA INTELIGENTE ABC
// ====================================================================

// Definição das divisões de treino com sequência automática
function getTrainingSplits() {
  return [
    {
      id: 0,
      name: "Peito e Tríceps",
      primaryGroups: [1], // ID do grupo muscular Peito
      secondaryGroups: [5], // ID do grupo muscular Tríceps
      auxiliaryGroups: [3, 7], // Ombros e Abdômen como grupos auxiliares
      nextSplit: 1,
      description: "Treino focado no desenvolvimento do peitoral e tríceps"
    },
    {
      id: 1,
      name: "Costas e Bíceps",
      primaryGroups: [2], // ID do grupo muscular Costas
      secondaryGroups: [4], // ID do grupo muscular Bíceps
      auxiliaryGroups: [10, 7], // Antebraço e Abdômen como grupos auxiliares
      nextSplit: 2,
      description: "Treino para desenvolvimento das costas e bíceps"
    },
    {
      id: 2,
      name: "Pernas e Glúteos",
      primaryGroups: [6], // ID do grupo muscular Pernas
      secondaryGroups: [8], // ID do grupo muscular Glúteos
      auxiliaryGroups: [9, 7], // Panturrilha e Abdômen como grupos auxiliares
      nextSplit: 3,
      description: "Treino completo para membros inferiores"
    },
    {
      id: 3,
      name: "Ombros e Core",
      primaryGroups: [3], // ID do grupo muscular Ombros
      secondaryGroups: [7], // ID do grupo muscular Abdômen
      auxiliaryGroups: [4, 5], // Bíceps e Tríceps como grupos auxiliares
      nextSplit: 0, // Volta para o primeiro
      description: "Treino focado em ombros e fortalecimento do core"
    }
  ];
}

// Função inteligente para determinar qual divisão recomendar com base no histórico
async function getNextRecommendedSplit(userId) {
  try {
    logger.info(`Determinando próximo treino para usuário: ${userId}`);
    
    // Buscar o histórico de treinos do usuário (últimos 10 treinos)
    const recentHistory = await db.history.findAll({
      where: { user_id: userId },
      order: [['workout_date', 'DESC']],
      limit: 10,
      include: [{
        model: db.workout,
        include: [{
          model: db.exercise,
          include: [db.muscleGroup]
        }]
      }]
    });
    
    logger.info(`Encontrados ${recentHistory.length} treinos no histórico`);
    
    if (recentHistory.length === 0) {
      logger.info('Nenhum histórico encontrado, iniciando com Peito e Tríceps');
      return 0; // Começar com Peito e Tríceps
    }
    
    // Analisar os últimos treinos para identificar qual divisão foi feita
    const splits = getTrainingSplits();
    let lastSplitIndex = -1;
    
    // Verificar o treino mais recente
    const lastWorkout = recentHistory[0];
    if (lastWorkout && lastWorkout.workout && lastWorkout.workout.exercises) {
      const lastWorkoutGroups = new Set();
      
      lastWorkout.workout.exercises.forEach(exercise => {
        if (exercise.muscle_group_id) {
          lastWorkoutGroups.add(exercise.muscle_group_id);
        }
      });
      
      logger.info('Grupos musculares do último treino:', Array.from(lastWorkoutGroups));
      
      // Identificar qual divisão melhor corresponde ao último treino
      for (let i = 0; i < splits.length; i++) {
        const split = splits[i];
        const splitGroups = [...split.primaryGroups, ...split.secondaryGroups];
        
        // Calcular quantos grupos do último treino correspondem a esta divisão
        const matches = splitGroups.filter(groupId => lastWorkoutGroups.has(groupId)).length;
        const coverage = matches / splitGroups.length;
        
        // Se mais de 50% dos grupos correspondem, assumir que foi esta divisão
        if (coverage >= 0.5) {
          lastSplitIndex = i;
          logger.info(`Último treino identificado como: ${split.name} (${Math.round(coverage * 100)}% de correspondência)`);
          break;
        }
      }
    }
    
    // Determinar o próximo treino na sequência
    if (lastSplitIndex >= 0) {
      const nextSplitIndex = splits[lastSplitIndex].nextSplit;
      logger.info(`Próximo treino recomendado: ${splits[nextSplitIndex].name}`);
      return nextSplitIndex;
    }
    
    // Se não conseguiu identificar, usar lógica de balanceamento
    return getBalancedSplit(userId, recentHistory, splits);
    
  } catch (error) {
    logger.error('Erro ao determinar próximo treino:', error);
    return 0; // Em caso de erro, retornar primeira divisão
  }
}

// Função auxiliar para balanceamento quando não consegue identificar o padrão
async function getBalancedSplit(userId, recentHistory, splits) {
  logger.info('Usando lógica de balanceamento para próximo treino');
  
  // Contar quantas vezes cada grupo muscular foi treinado recentemente
  const groupFrequency = {};
  const recentDays = 7; // Considerar últimos 7 dias
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - recentDays);
  
  recentHistory.forEach(history => {
    const workoutDate = new Date(history.workout_date);
    if (workoutDate >= cutoffDate && history.workout && history.workout.exercises) {
      history.workout.exercises.forEach(exercise => {
        if (exercise.muscle_group_id) {
          groupFrequency[exercise.muscle_group_id] = (groupFrequency[exercise.muscle_group_id] || 0) + 1;
        }
      });
    }
  });
  
  logger.info('Frequência de grupos musculares (últimos 7 dias):', groupFrequency);
  
  // Encontrar a divisão com grupos menos treinados
  let bestSplit = 0;
  let lowestFrequency = Infinity;
  
  splits.forEach((split, index) => {
    const splitGroups = [...split.primaryGroups, ...split.secondaryGroups];
    const totalFrequency = splitGroups.reduce((sum, groupId) => {
      return sum + (groupFrequency[groupId] || 0);
    }, 0);
    
    const averageFrequency = totalFrequency / splitGroups.length;
    
    if (averageFrequency < lowestFrequency) {
      lowestFrequency = averageFrequency;
      bestSplit = index;
    }
  });
  
  logger.info(`Divisão balanceada selecionada: ${splits[bestSplit].name} (frequência média: ${lowestFrequency})`);
  return bestSplit;
}

// ====================================================================
// ALGORITMO GENÉTICO MELHORADO
// ====================================================================

// Função principal do algoritmo genético com melhorias
async function geneticAlgorithm(user, allExercises, existingWorkouts, splitIndex) {
  // Parâmetros otimizados
  const POPULATION_SIZE = 25; // Aumentado para mais diversidade
  const MAX_GENERATIONS = 20; // Mais gerações para melhor evolução
  const MUTATION_RATE = 0.15; // Taxa de mutação otimizada
  const CROSSOVER_RATE = 0.75; // Taxa de crossover aumentada
  
  // Obter informações da divisão selecionada
  const split = getTrainingSplits()[splitIndex];
  
  // Definir número de exercícios baseado na experiência e objetivo
  let exerciseCount;
  if (user.experience_level === 'Iniciante') {
    exerciseCount = user.goal === 'Hipertrofia' ? 7 : 6;
  } else if (user.experience_level === 'Intermediário') {
    exerciseCount = user.goal === 'Hipertrofia' ? 9 : 8;
  } else { // Avançado
    exerciseCount = user.goal === 'Hipertrofia' ? 11 : 10;
  }
  
  logger.info(`Algoritmo genético iniciado:`);
  logger.info(`- População: ${POPULATION_SIZE} indivíduos`);
  logger.info(`- Gerações: ${MAX_GENERATIONS}`);
  logger.info(`- Exercícios: ${exerciseCount}`);
  logger.info(`- Divisão: ${split.name}`);
  
  // Inicializar população passando todos parâmetros necessários
  let population = initializePopulation(
    POPULATION_SIZE,
    exerciseCount,
    allExercises,
    existingWorkouts,
    user,
    splitIndex
  );
  
  let bestFitnessHistory = [];
  
  // Evoluir por várias gerações
  for (let gen = 0; gen < MAX_GENERATIONS; gen++) {
    // Calcular fitness para cada indivíduo
    const fitnessScores = population.map(individual => 
      calculateFitness(individual, user, allExercises, splitIndex)
    );
    
    const bestFitness = Math.max(...fitnessScores);
    const averageFitness = fitnessScores.reduce((a, b) => a + b, 0) / fitnessScores.length;
    
    bestFitnessHistory.push(bestFitness);
    
    // Elitismo - preservar os 2 melhores indivíduos
    const sortedIndices = fitnessScores
      .map((fitness, index) => ({ fitness, index }))
      .sort((a, b) => b.fitness - a.fitness);
    
    const newPopulation = [
      [...population[sortedIndices[0].index]], // Melhor
      [...population[sortedIndices[1].index]]  // Segundo melhor
    ];
    
    // Gerar resto da população
    while (newPopulation.length < POPULATION_SIZE) {
      // Seleção dos pais com torneio
      const parent1 = selection(population, fitnessScores);
      const parent2 = selection(population, fitnessScores);
      
      // Crossover
      let offspring;
      if (Math.random() < CROSSOVER_RATE) {
        offspring = crossover(parent1, parent2);
      } else {
        offspring = Math.random() < 0.5 ? [...parent1] : [...parent2];
      }
      
      // Mutação
      if (Math.random() < MUTATION_RATE) {
        mutate(offspring, allExercises, splitIndex);
      }
      
      // Adicionar à nova população
      newPopulation.push(offspring);
    }
    
    // Substituir população
    population = newPopulation;
    
    logger.info(`Geração ${gen + 1}: Melhor = ${bestFitness.toFixed(2)}, Média = ${averageFitness.toFixed(2)}`);
    
    // Critério de parada por convergência
    if (gen >= 5) {
      const recentBest = Math.max(...bestFitnessHistory.slice(-5));
      const olderBest = Math.max(...bestFitnessHistory.slice(-10, -5));
      
      if (recentBest - olderBest < 1) {
        logger.info(`Convergência detectada na geração ${gen + 1}, parando algoritmo`);
        break;
      }
    }
  }
  
  // Encontrar o melhor indivíduo da população final
  const finalFitness = population.map(individual =>
    calculateFitness(individual, user, allExercises, splitIndex)
  );

  const bestFinalIndex = finalFitness.indexOf(Math.max(...finalFitness));
  const bestSolution = population[bestFinalIndex];
  
  logger.info(`Algoritmo finalizado. Fitness final: ${Math.max(...finalFitness).toFixed(2)}`);
  
  // Criar treino a partir do melhor indivíduo
  return createWorkout(bestSolution, user, allExercises, split);
}

// Inicializar população com foco na divisão de treino
function initializePopulation(size, numExercises, allExercises, existingWorkouts, user, splitIndex) {
  const population = [];
  const split = getTrainingSplits()[splitIndex];
  
  // Filtrar exercícios relevantes para esta divisão
  const primaryExercises = allExercises.filter(ex => split.primaryGroups.includes(ex.muscle_group_id));
  const secondaryExercises = allExercises.filter(ex => split.secondaryGroups.includes(ex.muscle_group_id));
  const auxiliaryExercises = allExercises.filter(ex => split.auxiliaryGroups.includes(ex.muscle_group_id));
  
  // Usar treinos existentes relevantes como semente
  const relevantWorkouts = existingWorkouts.filter(workout => 
    workout.goal === user.goal || workout.experience_level === user.experience_level
  );
  
  // Extrair cromossomos dos treinos existentes
  for (const workout of relevantWorkouts) {
    if (population.length < size / 2) {
      const chromosome = [];
      
      // Verificar quais exercícios do treino existente pertencem à divisão atual
      const relevantExercises = workout.exercises.filter(ex => 
        split.primaryGroups.includes(ex.muscle_group_id) || 
        split.secondaryGroups.includes(ex.muscle_group_id) || 
        split.auxiliaryGroups.includes(ex.muscle_group_id)
      );
      
      // Adicionar IDs dos exercícios relevantes
      relevantExercises.forEach(ex => {
        if (!chromosome.includes(ex.id) && chromosome.length < numExercises) {
          chromosome.push(ex.id);
        }
      });
      
      // Completar com exercícios faltantes
      completeChromosome(chromosome, numExercises, primaryExercises, secondaryExercises, auxiliaryExercises);
      
      if (chromosome.length === numExercises) {
        population.push(chromosome);
      }
    }
  }
  
  // Preencher o restante com indivíduos aleatórios
  while (population.length < size) {
    const chromosome = [];
    completeChromosome(chromosome, numExercises, primaryExercises, secondaryExercises, auxiliaryExercises);
    
    if (chromosome.length === numExercises) {
      population.push(chromosome);
    }
  }
  
  return population;
}

// Função auxiliar para completar um cromossomo com a proporção correta
function completeChromosome(chromosome, numExercises, primaryExercises, secondaryExercises, auxiliaryExercises) {
  // Garantir proporção: 60% principais, 30% secundários, 10% auxiliares
  const primaryCount = Math.ceil(numExercises * 0.6);
  const secondaryCount = Math.ceil(numExercises * 0.3);
  const auxiliaryCount = numExercises - primaryCount - secondaryCount;
  
  // Adicionar exercícios dos grupos principais
  while (chromosome.filter(id => primaryExercises.some(ex => ex.id === id)).length < primaryCount && primaryExercises.length > 0) {
    const randomIndex = Math.floor(Math.random() * primaryExercises.length);
    const exercise = primaryExercises[randomIndex];
    if (!chromosome.includes(exercise.id)) {
      chromosome.push(exercise.id);
    }
  }
  
  // Adicionar exercícios dos grupos secundários
  while (chromosome.filter(id => secondaryExercises.some(ex => ex.id === id)).length < secondaryCount && secondaryExercises.length > 0) {
    const randomIndex = Math.floor(Math.random() * secondaryExercises.length);
    const exercise = secondaryExercises[randomIndex];
    if (!chromosome.includes(exercise.id)) {
      chromosome.push(exercise.id);
    }
  }
  
  // Preencher o restante com exercícios auxiliares
  while (chromosome.length < numExercises && auxiliaryExercises.length > 0) {
    const randomIndex = Math.floor(Math.random() * auxiliaryExercises.length);
    const exercise = auxiliaryExercises[randomIndex];
    if (!chromosome.includes(exercise.id)) {
      chromosome.push(exercise.id);
    } 
  }
  
  // Se ainda faltam exercícios, preencher com qualquer um disponível
  while (chromosome.length < numExercises) {
    const allAvailableExercises = [...primaryExercises, ...secondaryExercises, ...auxiliaryExercises];
    if (allAvailableExercises.length === 0) break;
    
    const randomExercise = allAvailableExercises[Math.floor(Math.random() * allAvailableExercises.length)];
    if (!chromosome.includes(randomExercise.id)) {
      chromosome.push(randomExercise.id);
    }
  }
}

// Função de fitness melhorada para divisão de treino
function calculateFitness(chromosome, user, allExercises, splitIndex) {
  let fitness = 0;
  const split = getTrainingSplits()[splitIndex];
  
  // Converter IDs dos exercícios para objetos
  const exercises = chromosome.map(id => 
    allExercises.find(ex => ex.id === id)
  ).filter(ex => ex); // Remover exercícios não encontrados
  
  // 1. Verificar aderência à divisão de treino (peso 40%)
  const exercisesByGroup = {};
  exercises.forEach(exercise => {
    const groupId = exercise.muscle_group_id;
    if (!exercisesByGroup[groupId]) {
      exercisesByGroup[groupId] = [];
    }
    exercisesByGroup[groupId].push(exercise);
  });
  
  // Bonificar exercícios dos grupos principais
  split.primaryGroups.forEach(groupId => {
    const groupExercises = exercisesByGroup[groupId] || [];
    fitness += groupExercises.length * 20;
    
    if (groupExercises.length < 2) {
      fitness -= 25; // Penalidade por poucos exercícios principais
    }
  });
  
  // Bonificar exercícios dos grupos secundários
  split.secondaryGroups.forEach(groupId => {
    const groupExercises = exercisesByGroup[groupId] || [];
    fitness += groupExercises.length * 15;
    
    if (groupExercises.length < 1) {
      fitness -= 20; // Penalidade por não ter exercícios secundários
    }
  });
  
  // Bonificar exercícios dos grupos auxiliares
  split.auxiliaryGroups.forEach(groupId => {
    const groupExercises = exercisesByGroup[groupId] || [];
    fitness += groupExercises.length * 8;
  });
  
  // 2. Adequação ao nível de experiência (peso 25%)
  const difficultyMap = { 'Fácil': 1, 'Médio': 2, 'Difícil': 3 };
  const userLevelMap = { 'Iniciante': 1, 'Intermediário': 2, 'Avançado': 3 };
  const userLevel = userLevelMap[user.experience_level];
  
  exercises.forEach(exercise => {
    const exerciseLevel = difficultyMap[exercise.difficulty_level];
    if (exerciseLevel) {
      fitness += 12 - Math.abs(exerciseLevel - userLevel) * 4;
    }
  });
  
  // 3. Adequação ao objetivo do usuário (peso 25%)
  switch (user.goal) {
    case 'Perda de peso':
      exercises.forEach(exercise => {
        if (['Pernas', 'Costas', 'Peito'].includes(exercise.muscleGroup?.name)) {
          fitness += 10;
        }
      });
      break;
      
    case 'Hipertrofia':
      const mainGroups = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps'];
      const coveredGroups = new Set(exercises.map(ex => ex.muscleGroup?.name));
      
      mainGroups.forEach(group => {
        if (coveredGroups.has(group)) {
          fitness += 8;
        }
      });
      break;
      
    case 'Definição':
      let compostos = 0;
      let isolados = 0;
      
      exercises.forEach(exercise => {
        if (['Pernas', 'Costas', 'Peito'].includes(exercise.muscleGroup?.name)) {
          compostos++;
        } else {
          isolados++;
        }
      });
      
      fitness += Math.min(compostos, isolados) * 8;
      break;
      
    case 'Condicionamento':
      fitness += Object.keys(exercisesByGroup).length * 6;
      exercises.forEach(exercise => {
        if (!exercise.equipment_required) {
          fitness += 6;
        }
      });
      break;
      
    case 'Reabilitação':
      exercises.forEach(exercise => {
        if (exercise.difficulty_level === 'Fácil') {
          fitness += 12;
        } else if (exercise.difficulty_level === 'Médio') {
          fitness += 6;
        }
      });
      break;
  }
  
  // 4. Penalizações (peso 10%)
  Object.values(exercisesByGroup).forEach(groupExercises => {
    if (groupExercises.length > 4) {
      fitness -= (groupExercises.length - 4) * 20;
    }
  });
  
  // Penalizar cromossomos com exercícios inexistentes
  if (exercises.length < chromosome.length) {
    fitness -= (chromosome.length - exercises.length) * 50;
  }
  
  return Math.max(0, fitness);
}

// Seleção por torneio
function selection(population, fitnessScores) {
  const tournamentSize = 4; // Aumentado para mais pressão seletiva
  const tournament = [];
  
  while (tournament.length < tournamentSize) {
    const randomIndex = Math.floor(Math.random() * population.length);
    if (!tournament.includes(randomIndex)) {
      tournament.push(randomIndex);
    }
  }
  
  let winner = tournament[0];
  for (let i = 1; i < tournament.length; i++) {
    if (fitnessScores[tournament[i]] > fitnessScores[winner]) {
      winner = tournament[i];
    }
  }
  
  return [...population[winner]];
}

// Crossover melhorado
function crossover(parent1, parent2) {
  // Crossover de dois pontos para mais diversidade
  const point1 = Math.floor(Math.random() * (parent1.length - 2)) + 1;
  const point2 = Math.floor(Math.random() * (parent1.length - point1)) + point1;
  
  let offspring = [
    ...parent1.slice(0, point1),
    ...parent2.slice(point1, point2),
    ...parent1.slice(point2)
  ];
  
  // Remover duplicatas
  offspring = [...new Set(offspring)];
  
  // Completar com genes dos pais se necessário
  const allGenes = [...new Set([...parent1, ...parent2])];
  
  while (offspring.length < parent1.length && allGenes.length > 0) {
    const availableGenes = allGenes.filter(gene => !offspring.includes(gene));
    if (availableGenes.length === 0) break;
    
    const gene = availableGenes[Math.floor(Math.random() * availableGenes.length)];
    offspring.push(gene);
  }
  
  return offspring;
}

// Mutação respeitando a divisão de treino
function mutate(chromosome, allExercises, splitIndex) {
  const split = getTrainingSplits()[splitIndex];
  const mutations = Math.floor(Math.random() * 3) + 1; // 1-3 mutações
  
  for (let i = 0; i < mutations; i++) {
    const position = Math.floor(Math.random() * chromosome.length);
    const currentExerciseId = chromosome[position];
    const currentExercise = allExercises.find(ex => ex.id === currentExerciseId);
    
    if (!currentExercise) continue;
    
    const currentGroupId = currentExercise.muscle_group_id;
    
    // Determinar grupos alvo baseado no grupo atual
    let targetGroups;
    if (split.primaryGroups.includes(currentGroupId)) {
      targetGroups = split.primaryGroups;
    } else if (split.secondaryGroups.includes(currentGroupId)) {
      targetGroups = split.secondaryGroups;
    } else {
      targetGroups = split.auxiliaryGroups;
    }
    
    // Buscar exercícios candidatos
    const candidateExercises = allExercises.filter(ex => 
      targetGroups.includes(ex.muscle_group_id) && 
      !chromosome.includes(ex.id) &&
      ex.id !== currentExerciseId
    );
    
    if (candidateExercises.length > 0) {
      const randomIndex = Math.floor(Math.random() * candidateExercises.length);
      const newExercise = candidateExercises[randomIndex];
      chromosome[position] = newExercise.id;
    }
  }
}

// Criar treino otimizado a partir do cromossomo
async function createWorkout(chromosome, user, allExercises, split) {
  // Obter detalhes dos exercícios
  const selectedExercises = chromosome.map(id => 
    allExercises.find(ex => ex.id === id)
  ).filter(ex => ex);
  
  // Gerar nome único e descritivo
  const timestamp = new Date().toISOString().slice(0, 16);
  let workoutName = `${split.name} - ${user.goal} (IA Genética ${timestamp})`;
  let workoutDescription = `Treino personalizado de ${split.name} para ${user.goal.toLowerCase()}, nível ${user.experience_level.toLowerCase()}. Gerado por algoritmo genético baseado no seu histórico e objetivos.`;
  
  // Duração estimada inteligente
  const baseTime = user.experience_level === 'Iniciante' ? 35 : 
                  user.experience_level === 'Intermediário' ? 50 : 65;
  const exerciseTime = selectedExercises.length * 4; // 4 min por exercício
  const estimatedDuration = baseTime + exerciseTime;
  
  // Criar o treino
  const workout = await Workout.create({
    name: workoutName,
    description: workoutDescription,
    goal: user.goal,
    experience_level: user.experience_level,
    estimated_duration: estimatedDuration
  });

  // Configurar parâmetros otimizados para cada exercício
  const workoutExercises = [];
  
  selectedExercises.forEach(exercise => {
    let sets, repetitions, rest_time;
    
    const isPrimaryExercise = split.primaryGroups.includes(exercise.muscle_group_id);
    const isSecondaryExercise = split.secondaryGroups.includes(exercise.muscle_group_id);
    
    // Configurações baseadas no objetivo e experiência
    switch (user.goal) {
      case 'Perda de peso':
        sets = isPrimaryExercise ? 4 : 3;
        if (user.experience_level === 'Iniciante') {
          repetitions = isPrimaryExercise ? '15,12,12,10' : '15,12,12';
        } else {
          repetitions = isPrimaryExercise ? '18,15,12,10' : '15,12,10';
        }
        rest_time = 45;
        break;
        
      case 'Hipertrofia':
        sets = isPrimaryExercise ? 4 : (isSecondaryExercise ? 3 : 2);
        if (user.experience_level === 'Iniciante') {
          repetitions = isPrimaryExercise ? '12,10,8,8' : '12,10,8';
        } else if (user.experience_level === 'Intermediário') {
          repetitions = isPrimaryExercise ? '12,10,8,6' : '12,10,8';
        } else {
          repetitions = isPrimaryExercise ? '15,12,10,8' : '12,10,8';
        }
        rest_time = 90;
        break;
        
      case 'Definição':
        sets = isPrimaryExercise ? 4 : 3;
        repetitions = user.experience_level === 'Avançado' ? '15,12,10,8' : '12,12,10,10';
        rest_time = 60;
        break;
        
      case 'Condicionamento':
        sets = 3;
        repetitions = '15,15,12';
        rest_time = 45;
        break;
        
      case 'Reabilitação':
        sets = isPrimaryExercise ? 3 : 2;
        repetitions = '12,10,8';
        rest_time = 75;
        break;
        
      default:
        sets = 3;
        repetitions = '12,10,8';
        rest_time = 60;
    }
    
    workoutExercises.push({
      workout_id: workout.id,
      exercise_id: exercise.id,
      sets,
      repetitions,
      rest_time
    });
  });
  
  // Salvar associações
  await WorkoutExercise.bulkCreate(workoutExercises);
  
  // Buscar o treino completo
  const completeWorkout = await Workout.findByPk(workout.id, {
    include: [{
      model: Exercise,
      through: {
        attributes: ['sets', 'repetitions', 'rest_time']
      },
      include: [{
        model: MuscleGroup,
        attributes: ['id', 'name']
      }]
    }]
  });
  
  logger.info(`Treino criado com sucesso: ID ${workout.id}, ${selectedExercises.length} exercícios`);
  
  return completeWorkout;
}

// ====================================================================
// ENDPOINT PRINCIPAL - ALGORITMO GENÉTICO INTELIGENTE
// ====================================================================

// Controller principal para recomendação genética inteligente
exports.getRecommendedGenetic = async (req, res) => {
  try {
    logger.info(`Recomendação genética inteligente para usuário: ${req.userId}`);
    
    const userId = req.userId;
    const user = await db.user.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Buscar exercícios e treinos existentes
    const allExercises = await Exercise.findAll({
      include: [{ model: MuscleGroup }]
    });
    
    const existingWorkouts = await Workout.findAll({
      include: [{
        model: Exercise,
        through: { attributes: ['sets', 'repetitions', 'rest_time'] },
        include: [{ model: MuscleGroup }]
      }]
    });
    
    // FUNCIONALIDADE PRINCIPAL: Determinar próxima divisão inteligentemente
    const splitIndex = await getNextRecommendedSplit(userId);
    const split = getTrainingSplits()[splitIndex];
    
    logger.info(`Divisão selecionada: ${split.name} (índice: ${splitIndex})`);
    
    // Executar algoritmo genético otimizado
    const geneticWorkout = await geneticAlgorithm(user, allExercises, existingWorkouts, splitIndex);
    
    // Buscar treino completo com todas as informações
    const completeWorkout = await Workout.findByPk(geneticWorkout.id, {
      include: [{
        model: Exercise,
        through: { attributes: ['sets', 'repetitions', 'rest_time'] },
        include: [{ model: MuscleGroup, attributes: ['id', 'name'] }]
      }]
    });
    
    // Informações sobre a próxima divisão na sequência
    const nextSplit = getTrainingSplits()[split.nextSplit];
    
    return res.status(200).json({
      success: true,
      message: 'Próximo treino gerado com IA genética',
      workout: completeWorkout,
      split_info: {
        name: split.name,
        description: split.description,
        sequence_info: `Este é o próximo treino na sua sequência ABC. Após completar, o sistema recomendará automaticamente: ${nextSplit.name}`
      },
      algorithm_info: {
        split_detected: splitIndex,
        evolution_generations: 'Algoritmo evolutivo com 25 indivíduos e até 20 gerações',
        personalization: 'Baseado no seu histórico, objetivos e nível de experiência',
        fitness_optimization: 'Otimizado para divisão de treino, adequação ao objetivo e experiência'
      }
    });
    
  } catch (error) {
    logger.error(`Erro ao gerar treino genético: ${error.message}`, { error: error.stack });
    
    return res.status(500).json({
      success: false,
      message: 'Falha ao gerar próximo treino inteligente',
      error: error.message
    });
  }
};
module.exports.getTrainingSplits = getTrainingSplits;
module.exports.getNextRecommendedSplit = getNextRecommendedSplit;
module.exports.geneticAlgorithm = geneticAlgorithm;