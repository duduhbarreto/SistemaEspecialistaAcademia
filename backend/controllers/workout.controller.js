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

// algoritmo genético
exports.getRecommendedGenetic = async (req, res) => {
  try {
    logger.info(`recomendação genética de treino para usuário: ${req.userId}`);
    
    // Obter dados do usuário
    const userId = req.userId;
    const user = await db.user.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Buscar todos os exercícios disponíveis
    const allExercises = await Exercise.findAll({
      include: [{ model: MuscleGroup }]
    });
    
    // Buscar treinos existentes para inspiração
    const existingWorkouts = await Workout.findAll({
      include: [{
        model: Exercise,
        through: {
          attributes: ['sets', 'repetitions', 'rest_time']
        },
        include: [{ model: MuscleGroup }]
      }]
    });
    
    // Executar algoritmo genético
    const geneticWorkout = await geneticAlgorithm(user, allExercises, existingWorkouts);
    
    return res.status(200).json({
      success: true,
      message: 'Treino gerado com algoritmo genético',
      workout: geneticWorkout
    });
    
  } catch (error) {
    logger.error(`Erro ao gerar treino genético: ${error.message}`, { error: error.stack });
    
    return res.status(500).json({
      success: false,
      message: 'Falha ao gerar treino com algoritmo genético',
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

// =================== ALGORITMO GENÉTICO ===================

// Função principal do algoritmo genético
async function geneticAlgorithm(user, allExercises, existingWorkouts) {
  // Parâmetros do algoritmo
  const POPULATION_SIZE = 20;
  const MAX_GENERATIONS = 15;
  const MUTATION_RATE = 0.2;
  const CROSSOVER_RATE = 0.7;
  
  // Definir número de exercícios baseado na experiência
  const exerciseCount = user.experience_level === 'Iniciante' ? 6 : 
                        user.experience_level === 'Intermediário' ? 8 : 10;
  
  logger.info(`Iniciando algoritmo genético - população: ${POPULATION_SIZE}, gerações: ${MAX_GENERATIONS}`);
  
  // Inicializar população
  let population = initializePopulation(
    POPULATION_SIZE, 
    exerciseCount, 
    allExercises, 
    existingWorkouts, 
    user
  );
  
  // Evoluir por várias gerações
  for (let gen = 0; gen < MAX_GENERATIONS; gen++) {
    // Calcular fitness para cada indivíduo
    const fitnessScores = population.map(individual => 
      calculateFitness(individual, user, allExercises)
    );
    
    // Elitismo - manter o melhor indivíduo
    const bestIndex = fitnessScores.indexOf(Math.max(...fitnessScores));
    const bestIndividual = [...population[bestIndex]];
    
    // Criar nova população
    const newPopulation = [bestIndividual]; // Elitismo
    
    while (newPopulation.length < POPULATION_SIZE) {
      // Seleção
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
        mutate(offspring, allExercises);
      }
      
      // Adicionar à nova população
      newPopulation.push(offspring);
    }
    
    // Substituir população
    population = newPopulation;
    
    logger.info(`Geração ${gen+1} completa - melhor fitness: ${Math.max(...fitnessScores)}`);
  }
  
  // Encontrar o melhor indivíduo da população final
  const finalFitness = population.map(individual => 
    calculateFitness(individual, user, allExercises)
  );
  
  const bestFinalIndex = finalFitness.indexOf(Math.max(...finalFitness));
  const bestSolution = population[bestFinalIndex];
  
  // Criar treino a partir do melhor indivíduo
  return createWorkout(bestSolution, user, allExercises);
}

// Inicializar população
function initializePopulation(size, numExercises, allExercises, existingWorkouts, user) {
  const population = [];
  
  // Usar treinos existentes relevantes como parte da população inicial
  const relevantWorkouts = existingWorkouts.filter(workout => 
    workout.goal === user.goal || workout.experience_level === user.experience_level
  );
  
  // Extrair cromossomos dos treinos existentes
  for (const workout of relevantWorkouts) {
    if (population.length < size / 2) {
      const chromosome = workout.exercises.map(ex => ex.id);
      
      // Ajustar o tamanho se necessário
      while (chromosome.length > numExercises) {
        chromosome.splice(Math.floor(Math.random() * chromosome.length), 1);
      }
      
      while (chromosome.length < numExercises) {
        const randomExercise = allExercises[Math.floor(Math.random() * allExercises.length)];
        if (!chromosome.includes(randomExercise.id)) {
          chromosome.push(randomExercise.id);
        }
      }
      
      population.push(chromosome);
    }
  }
  
  // Preencher o restante com indivíduos aleatórios
  while (population.length < size) {
    const chromosome = [];
    
    // Garantir diversidade de grupos musculares
    const muscleGroups = new Set();
    
    while (chromosome.length < numExercises) {
      const randomIndex = Math.floor(Math.random() * allExercises.length);
      const exercise = allExercises[randomIndex];
      
      // Evitar duplicatas
      if (!chromosome.includes(exercise.id)) {
        // Favorecer diversidade de grupos musculares
        if (muscleGroups.size < 5 || Math.random() < 0.5) {
          chromosome.push(exercise.id);
          muscleGroups.add(exercise.muscle_group_id);
        }
      }
    }
    
    population.push(chromosome);
  }
  
  return population;
}

// Função de fitness
function calculateFitness(chromosome, user, allExercises) {
  let fitness = 0;
  
  // Mapear IDs para objetos de exercício
  const exercises = chromosome.map(id => 
    allExercises.find(ex => ex.id === id)
  );
  
  // 1. Diversidade de grupos musculares (muito importante)
  const muscleGroups = new Set(exercises.map(ex => ex.muscle_group_id));
  fitness += muscleGroups.size * 15;
  
  // 2. Adequação ao nível de experiência
  const difficultyMap = { 'Fácil': 1, 'Médio': 2, 'Difícil': 3 };
  const userLevelMap = { 'Iniciante': 1, 'Intermediário': 2, 'Avançado': 3 };
  const userLevel = userLevelMap[user.experience_level];
  
  exercises.forEach(exercise => {
    const exerciseLevel = difficultyMap[exercise.difficulty_level];
    // Penalizar exercícios muito difíceis para iniciantes ou muito fáceis para avançados
    fitness += 10 - Math.abs(exerciseLevel - userLevel) * 3;
  });
  
  // 3. Adequação ao objetivo do usuário
  switch (user.goal) {
    case 'Perda de peso':
      // Favorecer exercícios compostos que trabalham grandes grupos musculares
      exercises.forEach(exercise => {
        if (['Pernas', 'Costas', 'Peito'].includes(exercise.muscleGroup.name)) {
          fitness += 8;
        }
      });
      break;
      
    case 'Hipertrofia':
      // Verificar cobertura dos grupos musculares principais
      const mainGroups = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps'];
      const coveredGroups = new Set(exercises.map(ex => ex.muscleGroup.name));
      
      mainGroups.forEach(group => {
        if (coveredGroups.has(group)) {
          fitness += 7;
        }
      });
      break;
      
    case 'Definição':
      // Preferir mistura de exercícios compostos e isolados
      let compostos = 0;
      let isolados = 0;
      
      exercises.forEach(exercise => {
        if (['Pernas', 'Costas', 'Peito'].includes(exercise.muscleGroup.name)) {
          compostos++;
        } else {
          isolados++;
        }
      });
      
      // Bonificar equilíbrio entre compostos e isolados
      fitness += Math.min(compostos, isolados) * 7;
      break;
      
    case 'Condicionamento':
      // Favorecer diversidade e exercícios compostos
      fitness += muscleGroups.size * 5;
      exercises.forEach(exercise => {
        if (!exercise.equipment_required) {
          fitness += 5; // Bonificar exercícios sem equipamento
        }
      });
      break;
      
    case 'Reabilitação':
      // Favorecer exercícios mais fáceis
      exercises.forEach(exercise => {
        if (exercise.difficulty_level === 'Fácil') {
          fitness += 10;
        }
        if (exercise.difficulty_level === 'Médio') {
          fitness += 5;
        }
      });
      break;
  }
  
  // 4. Penalizar exercícios duplicados do mesmo grupo muscular
  const muscleGroupCounts = {};
  exercises.forEach(exercise => {
    const groupId = exercise.muscle_group_id;
    muscleGroupCounts[groupId] = (muscleGroupCounts[groupId] || 0) + 1;
  });
  
  Object.values(muscleGroupCounts).forEach(count => {
    if (count > 2) {
      fitness -= (count - 2) * 15; // Penalizar fortemente mais de 2 exercícios do mesmo grupo
    }
  });
  
  return Math.max(0, fitness);
}

// Seleção por torneio
function selection(population, fitnessScores) {
  const tournamentSize = 3;
  const tournament = [];
  
  // Selecionar candidatos para o torneio
  while (tournament.length < tournamentSize) {
    const randomIndex = Math.floor(Math.random() * population.length);
    if (!tournament.includes(randomIndex)) {
      tournament.push(randomIndex);
    }
  }
  
  // Selecionar o melhor candidato
  let winner = tournament[0];
  for (let i = 1; i < tournament.length; i++) {
    if (fitnessScores[tournament[i]] > fitnessScores[winner]) {
      winner = tournament[i];
    }
  }
  
  return [...population[winner]];
}

// Crossover (recombinação)
function crossover(parent1, parent2) {
  // Crossover de um ponto
  const point = Math.floor(Math.random() * (parent1.length - 1)) + 1;
  
  let offspring = [
    ...parent1.slice(0, point), 
    ...parent2.slice(point)
  ];
  
  // Remover duplicatas preservando a ordem
  offspring = [...new Set(offspring)];
  
  // Se o tamanho diminuir devido a duplicatas, completar com genes dos pais
  const allGenes = [...new Set([...parent1, ...parent2])];
  
  while (offspring.length < parent1.length) {
    const gene = allGenes[Math.floor(Math.random() * allGenes.length)];
    if (!offspring.includes(gene)) {
      offspring.push(gene);
    }
  }
  
  return offspring;
}

// Mutação
function mutate(chromosome, allExercises) {
  // Número de mutações
  const mutations = Math.floor(Math.random() * 2) + 1;
  
  for (let i = 0; i < mutations; i++) {
    // Posição a ser mutada
    const position = Math.floor(Math.random() * chromosome.length);
    
    // Selecionar novo exercício
    let newExercise;
    do {
      const randomIndex = Math.floor(Math.random() * allExercises.length);
      newExercise = allExercises[randomIndex].id;
    } while (chromosome.includes(newExercise));
    
    // Aplicar mutação
    chromosome[position] = newExercise;
  }
}

// Criar treino a partir do cromossomo
async function createWorkout(chromosome, user, allExercises) {
  // Obter detalhes dos exercícios
  const selectedExercises = chromosome.map(id => 
    allExercises.find(ex => ex.id === id)
  );
  
  // Gerar nome e descrição baseados no objetivo e nível
  let workoutName = `Treino Genético - ${user.goal}`;
  let workoutDescription = `Treino personalizado por algoritmo genético para ${user.goal.toLowerCase()}, nível ${user.experience_level.toLowerCase()}.`;
  
  // Duração estimada baseada na experiência e número de exercícios
  const estimatedDuration = user.experience_level === 'Iniciante' ? 45 : 
                            user.experience_level === 'Intermediário' ? 60 : 75;
  
  // Criar o novo treino
  const workout = await Workout.create({
    name: workoutName,
    description: workoutDescription,
    goal: user.goal,
    experience_level: user.experience_level,
    estimated_duration: estimatedDuration
  });
  
  // Configurar parâmetros de cada exercício baseado no objetivo
  const workoutExercises = [];
  
  selectedExercises.forEach(exercise => {
    let sets, repetitions, rest_time;
    
    switch (user.goal) {
      case 'Perda de peso':
        sets = 3;
        repetitions = '15,15,15';
        rest_time = 45; // segundos
        break;
      case 'Hipertrofia':
        sets = user.experience_level === 'Avançado' ? 4 : 3;
        repetitions = user.experience_level === 'Avançado' ? '12,10,8,6' : '12,10,8';
        rest_time = 90; // segundos
        break;
      case 'Definição':
        sets = 4;
        repetitions = '12,12,12,12';
        rest_time = 60; // segundos
        break;
      case 'Condicionamento':
        sets = 3;
        repetitions = '15,15,15';
        rest_time = 45; // segundos
        break;
      case 'Reabilitação':
        sets = 3;
        repetitions = '12,12,12';
        rest_time = 60; // segundos
        break;
      default:
        sets = 3;
        repetitions = '12,10,8';
        rest_time = 60; // segundos
    }
    
    workoutExercises.push({
      workout_id: workout.id,
      exercise_id: exercise.id,
      sets,
      repetitions,
      rest_time
    });
  });
  
  // Salvar associações entre treino e exercícios
  await WorkoutExercise.bulkCreate(workoutExercises);
  
  // Buscar o treino completo com todos os exercícios
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
  
  return completeWorkout;
}