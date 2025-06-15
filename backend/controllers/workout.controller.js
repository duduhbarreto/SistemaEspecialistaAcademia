const db = require('../models');
const Workout = db.workout;
const Exercise = db.exercise;
const MuscleGroup = db.muscleGroup;
const WorkoutExercise = db.workoutExercise;
const logger = require('../utils/logger');
const Op = db.Sequelize.Op;

// criar novo workout
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

// Obter exercícios recomendados para o usuário
exports.getRecommended = async (req, res) => {
  try {
    // // Obter usuário da solicitação (definido pelo middleware de autenticação)
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

// Definição de divisões de treino
function getTrainingSplits() {
  return [
    {
      name: "Peito e Tríceps",
      primaryGroups: [1], // ID do grupo muscular Peito
      secondaryGroups: [5], // ID do grupo muscular Tríceps
      auxiliaryGroups: [3, 7] // Ombros e Abdômen como grupos auxiliares
    },
    {
      name: "Costas e Bíceps",
      primaryGroups: [2], // ID do grupo muscular Costas
      secondaryGroups: [4], // ID do grupo muscular Bíceps
      auxiliaryGroups: [10, 7] // Antebraço e Abdômen como grupos auxiliares
    },
    {
      name: "Pernas e Glúteos",
      primaryGroups: [6], // ID do grupo muscular Pernas
      secondaryGroups: [8], // ID do grupo muscular Glúteos
      auxiliaryGroups: [9, 7] // Panturrilha e Abdômen como grupos auxiliares
    },
    {
      name: "Ombros e Core",
      primaryGroups: [3], // ID do grupo muscular Ombros
      secondaryGroups: [7], // ID do grupo muscular Abdômen
      auxiliaryGroups: [4, 5] // Bíceps e Tríceps como grupos auxiliares
    }
  ];
}

// Função para determinar qual divisão recomendar com base no histórico
async function getRecommendedSplit(userId) {
  try {
    // Buscar histórico de treinos do usuário
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
    
    if (recentHistory.length === 0) {
      // Se não houver histórico, retornar a primeira divisão
      return 0; // Índice da primeira divisão
    }
    
    // Mapear os grupos musculares treinados recentemente
    const recentlyTrainedGroups = new Set();
    recentHistory.forEach(history => {
      if (history.workout && history.workout.exercises) {
        history.workout.exercises.forEach(exercise => {
          if (exercise.muscle_group_id) {
            recentlyTrainedGroups.add(exercise.muscle_group_id);
          }
        });
      }
    });
    
    // Obter as divisões de treino
    const splits = getTrainingSplits();
    
    // Calcular pontuação para cada divisão com base em quão recentemente seus grupos foram treinados
    const splitScores = splits.map((split, index) => {
      let score = 0;
      // Contar quantos grupos principais desta divisão foram treinados recentemente
      split.primaryGroups.forEach(groupId => {
        if (recentlyTrainedGroups.has(groupId)) {
          score -= 10; // Penalizar divisões com grupos principais treinados recentemente
        } else {
          score += 5; // Bonificar divisões com grupos principais não treinados recentemente
        }
      });
      
      split.secondaryGroups.forEach(groupId => {
        if (recentlyTrainedGroups.has(groupId)) {
          score -= 5; // Penalizar menos para grupos secundários
        } else {
          score += 3;
        }
      });
      
      return { index, score };
    });
    
    // Ordenar por pontuação e retornar o índice da divisão com maior pontuação
    splitScores.sort((a, b) => b.score - a.score);
    return splitScores[0].index;
    
  } catch (error) {
    logger.error('Erro ao determinar próxima divisão de treino:', error);
    return 0; // Em caso de erro, retornar a primeira divisão
  }
}

// Obter um treino recomendado usando algoritmo genético
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
    
    // Determinar qual divisão de treino recomendar
    const splitIndex = await getRecommendedSplit(userId);
    const split = getTrainingSplits()[splitIndex];
    
    // Executar algoritmo genético
    const geneticWorkout = await geneticAlgorithm(user, allExercises, existingWorkouts, splitIndex);
    
    return res.status(200).json({
      success: true,
      message: 'Treino gerado com algoritmo genético',
      workout: geneticWorkout,
      split_info: {
        name: split.name,
        description: `Este treino foca em ${split.name} como parte do seu plano de treino dividido.`
      }
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

//algoritmo genetico
// Função principal - versão modificada para divisão de treino
async function geneticAlgorithm(user, allExercises, existingWorkouts, splitIndex) {
  // Parâmetros
  const POPULATION_SIZE = 20; //Quantidade de treinos diferentes em cada geração (20 treinos)
  const MAX_GENERATIONS = 15; // numero de ciclos evolutivos
  const MUTATION_RATE = 0.2; //mutação de 20% chance de alterar um exercício
  const CROSSOVER_RATE = 0.7; // Probabilidade de ocorrer combinação entre dois treinos (70%)
  
  // Obter informações da divisão selecionada
  const split = getTrainingSplits()[splitIndex];
  
  // Definir número de exercícios baseado na experiência
  const exerciseCount = user.experience_level === 'Iniciante' ? 6 : //Iniciante: 6 exercícios
                        user.experience_level === 'Intermediário' ? 8 : 10; //Intermediário: 8 exercícios, Avançado: 10
  
  logger.info(`Iniciando algoritmo genético - população: ${POPULATION_SIZE}, gerações: ${MAX_GENERATIONS}, divisão: ${split.name}`);
  
  // Inicializar população passando todos parâmetros necessários incluindo a divisão de treino
  let population = initializePopulation(
    POPULATION_SIZE, //tamanho da população
    exerciseCount,  //numeros de exerc por treino
    allExercises,  //lista dos exerc
    existingWorkouts, //treinos existentes para utilizar como base
    user,
    splitIndex  // Novo parâmetro: índice da divisão de treino
  );
  
  // Evoluir por várias gerações
  for (let gen = 0; gen < MAX_GENERATIONS; gen++) { //loop iniciado para executar o processo evolutivo para cada geração
    // Calcular fitness para cada indivíduo, agora considerando a divisão de treino
    const fitnessScores = population.map(individual => 
      calculateFitness(individual, user, allExercises, splitIndex)
    );
    
    // Elitismo - manter o melhor indivíduo
    const bestIndex = fitnessScores.indexOf(Math.max(...fitnessScores));
    const bestIndividual = [...population[bestIndex]];  //copia do melhor treino
    
    // Criar nova população com o melhor individuo
    const newPopulation = [bestIndividual]; // Elitismo
    
    while (newPopulation.length < POPULATION_SIZE) {
      // Seleção dos pais com torneio
      const parent1 = selection(population, fitnessScores);
      const parent2 = selection(population, fitnessScores);
      
      // Crossover
      let offspring;
      if (Math.random() < CROSSOVER_RATE) { //70% chance de crossover entre os pais
        offspring = crossover(parent1, parent2);
      } else {
        offspring = Math.random() < 0.5 ? [...parent1] : [...parent2];  // Se não houver crossover, escolher um dos pais aleatoriamente
      }
      
      // Mutação, agora considerando a divisão de treino
      if (Math.random() < MUTATION_RATE) {
        mutate(offspring, allExercises, splitIndex);
      }
      
      // Adicionar à nova população
      newPopulation.push(offspring);
    }
    
    // Substituir população
    population = newPopulation;
    
    logger.info(`Geração ${gen+1} completa - melhor fitness: ${Math.max(...fitnessScores)}`);
  }
  
  // Encontrar o melhor indivíduo da população final
  const finalFitness = population.map(individual =>  //Avalia cada treino (indivíduo) da população
    calculateFitness(individual, user, allExercises, splitIndex) //Cria um array com a pontuação de cada treino (avaliando fitness final)
  );

  //elitismo  (Identifico índice do treino com maior fitness)
  const bestFinalIndex = finalFitness.indexOf(Math.max(...finalFitness)); //encontrar maior valor de fitness
  const bestSolution = population[bestFinalIndex]; //melhor solução
  
  // Criar treino a partir do melhor indivíduo, incluindo informações da divisão
  return createWorkout(bestSolution, user, allExercises, split);
}

// Inicializar população - Versão modificada para divisão de treino
function initializePopulation(size, numExercises, allExercises, existingWorkouts, user, splitIndex) {
  const population = []; //array com todos os treinos da população
  const split = getTrainingSplits()[splitIndex];
  
  // Filtrar exercícios relevantes para esta divisão
  const primaryExercises = allExercises.filter(ex => split.primaryGroups.includes(ex.muscle_group_id));
  const secondaryExercises = allExercises.filter(ex => split.secondaryGroups.includes(ex.muscle_group_id));
  const auxiliaryExercises = allExercises.filter(ex => split.auxiliaryGroups.includes(ex.muscle_group_id));
  
  // Usar treinos existentes relevantes como parte da população inicial
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
      
      // Completar com exercícios faltantes seguindo a proporção de grupos
      completeChromosome(chromosome, numExercises, primaryExercises, secondaryExercises, auxiliaryExercises);
      
      if (chromosome.length === numExercises) {
        population.push(chromosome);
      }
    }
  }
  
  // Preencher o restante com indivíduos aleatórios
  while (population.length < size) {
    const chromosome = []; //novo treino vazio
    
    // Completar com a proporção correta de grupos musculares
    completeChromosome(chromosome, numExercises, primaryExercises, secondaryExercises, auxiliaryExercises);
    
    if (chromosome.length === numExercises) {
      population.push(chromosome);
    }
  }
  
  return population;
}

// Função auxiliar para completar um cromossomo com a proporção correta de exercícios
function completeChromosome(chromosome, numExercises, primaryExercises, secondaryExercises, auxiliaryExercises) {
  // Garantir que pelo menos 60% dos exercícios sejam dos grupos principais
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
    const randomExercise = allAvailableExercises[Math.floor(Math.random() * allAvailableExercises.length)];
    if (!chromosome.includes(randomExercise.id)) {
      chromosome.push(randomExercise.id);
    }
  }
}

// Função de fitness - Versão modificada para divisão de treino
function calculateFitness(chromosome, user, allExercises, splitIndex) {
  let fitness = 0;
  const split = getTrainingSplits()[splitIndex];
  
  // Converter IDs dos exercícios para objetos
  const exercises = chromosome.map(id => 
    allExercises.find(ex => ex.id === id)
  );
  
  // 1. Verificar aderência à divisão de treino
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
    fitness += groupExercises.length * 15; // Pontuação por cada exercício de grupo principal
    
    // Penalizar se não houver exercícios suficientes dos grupos principais
    if (groupExercises.length < 2) {
      fitness -= 20; // Penalidade por não ter pelo menos 2 exercícios de grupo principal
    }
  });
  
  // Bonificar exercícios dos grupos secundários
  split.secondaryGroups.forEach(groupId => {
    const groupExercises = exercisesByGroup[groupId] || [];
    fitness += groupExercises.length * 10; // Pontuação por cada exercício de grupo secundário
    
    // Penalizar se não houver exercícios suficientes dos grupos secundários
    if (groupExercises.length < 1) {
      fitness -= 15; // Penalidade por não ter pelo menos 1 exercício de grupo secundário
    }
  });
  
  // Bonificar exercícios dos grupos auxiliares
  split.auxiliaryGroups.forEach(groupId => {
    const groupExercises = exercisesByGroup[groupId] || [];
    fitness += groupExercises.length * 5; // Menor pontuação para grupos auxiliares
  });
  
  // 2. Adequação ao nível de experiência
  const difficultyMap = { 'Fácil': 1, 'Médio': 2, 'Difícil': 3 }; // mapeamento de dificuldades
  const userLevelMap = { 'Iniciante': 1, 'Intermediário': 2, 'Avançado': 3 }; //mapeamento de niveis
  const userLevel = userLevelMap[user.experience_level]; // Nível numérico do usuário
  
  exercises.forEach(exercise => { //dificuldade de cada exercício
    const exerciseLevel = difficultyMap[exercise.difficulty_level];
    // Penalizar exercícios muito difíceis para iniciantes ou muito fáceis para avançados
    fitness += 10 - Math.abs(exerciseLevel - userLevel) * 3;
  });
  
  // 3. Adequação ao objetivo do usuário
  switch (user.goal) {
    case 'Perda de peso':
      // favoreço exercicios que queimam mais calorias
      exercises.forEach(exercise => {
        if (['Pernas', 'Costas', 'Peito'].includes(exercise.muscleGroup.name)) {
          fitness += 8; //+8 pontos
        }
      });
      break;
      
    case 'Hipertrofia':
      // Verificar grupos musculares principais
      const mainGroups = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps'];
      const coveredGroups = new Set(exercises.map(ex => ex.muscleGroup.name));
      
      mainGroups.forEach(group => {
        if (coveredGroups.has(group)) {
          fitness += 7; //7 pontos por grupo
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
      fitness += Object.keys(exercisesByGroup).length * 5;
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
          fitness += 10; // +10 pontos para exercícios fáceis
        }
        if (exercise.difficulty_level === 'Médio') {
          fitness += 5; // +5 pontos para exercícios médios
        }
        // Exercícios difíceis não recebem bonificação
      });
      break;
  }
  
  // 4. Penalizar exercícios duplicados do mesmo grupo muscular
  Object.values(exercisesByGroup).forEach(groupExercises => {
    if (groupExercises.length > 3) {
      fitness -= (groupExercises.length - 3) * 15; // Penalizar fortemente mais de 3 exercícios do mesmo grupo
    }
  });
  
  return Math.max(0, fitness); // Garantir que o fitness nunca seja negativo
}

// Seleção por torneio
function selection(population, fitnessScores) {
  const tournamentSize = 3; //3 participantes
  const tournament = [];
  
  // Selecionar candidatos para o torneio
  while (tournament.length < tournamentSize) {
    const randomIndex = Math.floor(Math.random() * population.length);
    if (!tournament.includes(randomIndex)) {
      tournament.push(randomIndex);
    }
  }
  
  // Selecionar o melhor candidato
  let winner = tournament[0];  //1° competidor como inicial
  for (let i = 1; i < tournament.length; i++) {
    if (fitnessScores[tournament[i]] > fitnessScores[winner]) {
      winner = tournament[i];  // Atualizar vencedor se encontrar fitness melhor
    }
  }
  
  return [...population[winner]];  //retorno do treino vencedor
}

// Crossover 
function crossover(parent1, parent2) {
  // Crossover de um ponto aleatorio
  const point = Math.floor(Math.random() * (parent1.length - 1)) + 1;
  
  let offspring = [  //Combinar primeira parte do pai1 com segunda parte do pai2
    ...parent1.slice(0, point), 
    ...parent2.slice(point)
  ];
  
  // Remover exerc duplicados
  offspring = [...new Set(offspring)];
  
  // Se o tamanho diminuir devido a duplicatas, completar com genes dos pais
  const allGenes = [...new Set([...parent1, ...parent2])];
  
  while (offspring.length < parent1.length) {
    const gene = allGenes[Math.floor(Math.random() * allGenes.length)]; //adicionar aleatoriamente um gene dos pais
    if (!offspring.includes(gene)) {
      offspring.push(gene);
    }
  }
  
  return offspring; //retorno do filho gerado
}

// Mutação - Versão modificada para respeitar a divisão de treino
function mutate(chromosome, allExercises, splitIndex) {
  const split = getTrainingSplits()[splitIndex];
  const mutations = Math.floor(Math.random() * 2) + 1;
  
  for (let i = 0; i < mutations; i++) {
    // Posição a ser mutada
    const position = Math.floor(Math.random() * chromosome.length);
    
    // Identificar o exercício atual
    const currentExerciseId = chromosome[position];
    const currentExercise = allExercises.find(ex => ex.id === currentExerciseId);
    
    if (!currentExercise) continue;
    
    const currentGroupId = currentExercise.muscle_group_id;
    
    // Determinar a qual tipo de grupo o exercício pertence
    let targetGroups;
    if (split.primaryGroups.includes(currentGroupId)) {
      targetGroups = split.primaryGroups; // Substituir por outro exercício de grupo principal
    } else if (split.secondaryGroups.includes(currentGroupId)) {
      targetGroups = split.secondaryGroups; // Substituir por outro exercício de grupo secundário
    } else {
      targetGroups = split.auxiliaryGroups; // Substituir por outro exercício de grupo auxiliar
    }
    
    // Buscar exercícios candidatos do mesmo tipo de grupo
    const candidateExercises = allExercises.filter(ex => 
      targetGroups.includes(ex.muscle_group_id) && 
      !chromosome.includes(ex.id) &&
      ex.id !== currentExerciseId
    );
    
    if (candidateExercises.length > 0) {
      // Selecionar novo exercício aleatoriamente entre os candidatos
      const randomIndex = Math.floor(Math.random() * candidateExercises.length);
      const newExercise = candidateExercises[randomIndex];
      chromosome[position] = newExercise.id;
    }
  }
}

// Criar treino a partir do cromossomo (convertir o cromossomo em treino)
async function createWorkout(chromosome, user, allExercises, split) {
  // Obter detalhes dos exercícios
  const selectedExercises = chromosome.map(id => 
    allExercises.find(ex => ex.id === id)
  );
  
  // Gerar nome e descrição baseados na divisão e objetivo
  let workoutName = `Treino de ${split.name} - ${user.goal}`;
  let workoutDescription = `Treino personalizado de ${split.name} para ${user.goal.toLowerCase()}, nível ${user.experience_level.toLowerCase()}.`;
  
  // Duração estimada baseada na experiência
  const estimatedDuration = user.experience_level === 'Iniciante' ? 45 :  //45 min para iniciantes
                            user.experience_level === 'Intermediário' ? 60 : 75; //60 p intermediarios, 75 avançado
  
  // Criar o novo treino
  const workout = await Workout.create({
    name: workoutName,
    description: workoutDescription,
    goal: user.goal,
    experience_level: user.experience_level,
    estimated_duration: estimatedDuration
  });

  // Configurar parâmetros de cada exercício baseado no objetivo e na divisão
  const workoutExercises = [];
  
  selectedExercises.forEach(exercise => {
    let sets, repetitions, rest_time;
    
    // Verificar se é exercício de grupo principal, secundário ou auxiliar
    const isPrimaryExercise = split.primaryGroups.includes(exercise.muscle_group_id);
    const isSecondaryExercise = split.secondaryGroups.includes(exercise.muscle_group_id);
    
    switch (user.goal) {
      case 'Perda de peso':
        sets = isPrimaryExercise ? 4 : 3;
        repetitions = isPrimaryExercise ? '15,15,12,12' : '15,15,15';
        rest_time = 45; // segundos
        break;
      case 'Hipertrofia':
        sets = isPrimaryExercise ? 4 : (isSecondaryExercise ? 3 : 2);
        repetitions = user.experience_level === 'Avançado' ? 
                     (isPrimaryExercise ? '12,10,8,6' : '12,10,8') : 
                     (isPrimaryExercise ? '12,10,8,8' : '12,10,10');
        rest_time = 90; // segundos
        break;
      case 'Definição':
        sets = isPrimaryExercise ? 4 : 3;
        repetitions = '12,12,12,12';
        rest_time = 60; // segundos
        break;
      case 'Condicionamento':
        sets = 3;
        repetitions = '15,15,15';
        rest_time = 45; // segundos
        break;
      case 'Reabilitação':
        sets = isPrimaryExercise ? 3 : 2;
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