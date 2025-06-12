// Dados simulados para teste
const MOCK_EXERCISES = [
  // Exercícios de Peito
  { id: 1, name: 'Supino Reto', muscle_group_id: 1, difficulty_level: 'Médio', equipment_required: true, muscleGroup: { name: 'Peito' } },
  { id: 2, name: 'Flexão', muscle_group_id: 1, difficulty_level: 'Fácil', equipment_required: false, muscleGroup: { name: 'Peito' } },
  { id: 3, name: 'Crucifixo', muscle_group_id: 1, difficulty_level: 'Médio', equipment_required: true, muscleGroup: { name: 'Peito' } },
  
  // Exercícios de Costas
  { id: 4, name: 'Puxada Frontal', muscle_group_id: 2, difficulty_level: 'Médio', equipment_required: true, muscleGroup: { name: 'Costas' } },
  { id: 5, name: 'Remada Curvada', muscle_group_id: 2, difficulty_level: 'Difícil', equipment_required: true, muscleGroup: { name: 'Costas' } },
  { id: 6, name: 'Barra Fixa', muscle_group_id: 2, difficulty_level: 'Difícil', equipment_required: false, muscleGroup: { name: 'Costas' } },
  
  // Exercícios de Pernas
  { id: 7, name: 'Agachamento', muscle_group_id: 3, difficulty_level: 'Médio', equipment_required: false, muscleGroup: { name: 'Pernas' } },
  { id: 8, name: 'Leg Press', muscle_group_id: 3, difficulty_level: 'Fácil', equipment_required: true, muscleGroup: { name: 'Pernas' } },
  { id: 9, name: 'Afundo', muscle_group_id: 3, difficulty_level: 'Médio', equipment_required: false, muscleGroup: { name: 'Pernas' } },
  
  // Exercícios de Ombros
  { id: 10, name: 'Desenvolvimento', muscle_group_id: 4, difficulty_level: 'Médio', equipment_required: true, muscleGroup: { name: 'Ombros' } },
  { id: 11, name: 'Elevação Lateral', muscle_group_id: 4, difficulty_level: 'Fácil', equipment_required: true, muscleGroup: { name: 'Ombros' } },
  { id: 12, name: 'Elevação Frontal', muscle_group_id: 4, difficulty_level: 'Fácil', equipment_required: true, muscleGroup: { name: 'Ombros' } },
  
  // Exercícios de Bíceps
  { id: 13, name: 'Rosca Direta', muscle_group_id: 5, difficulty_level: 'Fácil', equipment_required: true, muscleGroup: { name: 'Bíceps' } },
  { id: 14, name: 'Rosca Martelo', muscle_group_id: 5, difficulty_level: 'Fácil', equipment_required: true, muscleGroup: { name: 'Bíceps' } },
  { id: 15, name: 'Rosca Concentrada', muscle_group_id: 5, difficulty_level: 'Médio', equipment_required: true, muscleGroup: { name: 'Bíceps' } },
  
  // Exercícios de Tríceps
  { id: 16, name: 'Tríceps Testa', muscle_group_id: 6, difficulty_level: 'Médio', equipment_required: true, muscleGroup: { name: 'Tríceps' } },
  { id: 17, name: 'Tríceps Corda', muscle_group_id: 6, difficulty_level: 'Fácil', equipment_required: true, muscleGroup: { name: 'Tríceps' } },
  { id: 18, name: 'Mergulho', muscle_group_id: 6, difficulty_level: 'Difícil', equipment_required: false, muscleGroup: { name: 'Tríceps' } },
  
  // Exercícios de Core
  { id: 19, name: 'Prancha', muscle_group_id: 7, difficulty_level: 'Fácil', equipment_required: false, muscleGroup: { name: 'Core' } },
  { id: 20, name: 'Abdominal', muscle_group_id: 7, difficulty_level: 'Fácil', equipment_required: false, muscleGroup: { name: 'Core' } }
];

const MOCK_EXISTING_WORKOUTS = [
  {
    id: 1,
    name: 'Treino Hipertrofia A',
    goal: 'Hipertrofia',
    experience_level: 'Intermediário',
    exercises: [
      { id: 1 }, { id: 4 }, { id: 7 }, { id: 10 }, { id: 13 }, { id: 16 }, { id: 19 }, { id: 2 }
    ]
  },
  {
    id: 2,
    name: 'Treino Perda de Peso',
    goal: 'Perda de peso',
    experience_level: 'Iniciante',
    exercises: [
      { id: 2 }, { id: 6 }, { id: 7 }, { id: 19 }, { id: 8 }, { id: 11 }
    ]
  }
];

const logger = {
  info: (message) => console.log(`[INFO] ${message}`),
  error: (message) => console.log(`[ERROR] ${message}`)
};

// ALGORITMO GENÉTICO

// Função principal 
async function geneticAlgorithm(user, allExercises, existingWorkouts) {

  const POPULATION_SIZE = 20;
  const MAX_GENERATIONS = 15;
  const MUTATION_RATE = 0.2;
  const CROSSOVER_RATE = 0.7;
  
  const exerciseCount = user.experience_level === 'Iniciante' ? 6 : 
                        user.experience_level === 'Intermediário' ? 8 : 10;
  
  logger.info(`Iniciando algoritmo genético - população: ${POPULATION_SIZE}, gerações: ${MAX_GENERATIONS}`);
  logger.info(`Usuário: ${user.goal}, nível ${user.experience_level} (${exerciseCount} exercícios)`);
  
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
    
    // Elitismo
    const bestIndex = fitnessScores.indexOf(Math.max(...fitnessScores));
    const bestIndividual = [...population[bestIndex]];
    
    // nova população
    const newPopulation = [bestIndividual];
    
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
      
      newPopulation.push(offspring);
    }
    
    population = newPopulation;
    
    const avgFitness = fitnessScores.reduce((a, b) => a + b, 0) / fitnessScores.length;
    const maxFitness = Math.max(...fitnessScores);
    logger.info(`Geração ${gen+1}: Fitness médio = ${avgFitness.toFixed(1)}, Melhor = ${maxFitness}`);
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
  
  // Usar treinos existentes relevantes
  const relevantWorkouts = existingWorkouts.filter(workout => 
    workout.goal === user.goal || workout.experience_level === user.experience_level
  );
  
  console.log(`Encontrados ${relevantWorkouts.length} treinos relevantes para inicialização`);
  
  // Extrair cromossomos
  for (const workout of relevantWorkouts) {
    if (population.length < size / 2) {
      const chromosome = workout.exercises.map(ex => ex.id);
      
      // Ajustar o tamanho 
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
    const muscleGroups = new Set();
    
    while (chromosome.length < numExercises) {
      const randomIndex = Math.floor(Math.random() * allExercises.length);
      const exercise = allExercises[randomIndex];
      
      if (!chromosome.includes(exercise.id)) {
        if (muscleGroups.size < 5 || Math.random() < 0.5) {
          chromosome.push(exercise.id);
          muscleGroups.add(exercise.muscle_group_id);
        }
      }
    }
    
    population.push(chromosome);
  }
  
  console.log(`População inicial criada: ${population.length} indivíduos`);
  return population;
}

// Função de fitness
function calculateFitness(chromosome, user, allExercises) {
  let fitness = 0;
  
  // Mapear IDs para objetos de exercício
  const exercises = chromosome.map(id => 
    allExercises.find(ex => ex.id === id)
  );
  
  // 1. Diversidade de grupos musculares
  const muscleGroups = new Set(exercises.map(ex => ex.muscle_group_id));
  fitness += muscleGroups.size * 15;
  
  // 2. Adequação ao nível de experiência
  const difficultyMap = { 'Fácil': 1, 'Médio': 2, 'Difícil': 3 };
  const userLevelMap = { 'Iniciante': 1, 'Intermediário': 2, 'Avançado': 3 };
  const userLevel = userLevelMap[user.experience_level];
  
  exercises.forEach(exercise => {
    const exerciseLevel = difficultyMap[exercise.difficulty_level];
    fitness += 10 - Math.abs(exerciseLevel - userLevel) * 3;
  });
  
  // 3. Adequação ao objetivo do usuário
  switch (user.goal) {
    case 'Perda de peso':
      exercises.forEach(exercise => {
        if (['Pernas', 'Costas', 'Peito'].includes(exercise.muscleGroup.name)) {
          fitness += 8;
        }
      });
      break;
      
    case 'Hipertrofia':
      const mainGroups = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps'];
      const coveredGroups = new Set(exercises.map(ex => ex.muscleGroup.name));
      
      mainGroups.forEach(group => {
        if (coveredGroups.has(group)) {
          fitness += 7;
        }
      });
      break;
      
    case 'Definição':
      let compostos = 0;
      let isolados = 0;
      
      exercises.forEach(exercise => {
        if (['Pernas', 'Costas', 'Peito'].includes(exercise.muscleGroup.name)) {
          compostos++;
        } else {
          isolados++;
        }
      });
      
      fitness += Math.min(compostos, isolados) * 7;
      break;
      
    case 'Condicionamento':
      fitness += muscleGroups.size * 5;
      exercises.forEach(exercise => {
        if (!exercise.equipment_required) {
          fitness += 5;
        }
      });
      break;
      
    case 'Reabilitação':
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
      fitness -= (count - 2) * 15;
    }
  });
  
  return Math.max(0, fitness);
}

// Seleção por torneio
function selection(population, fitnessScores) {
  const tournamentSize = 3;
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

// Crossover
function crossover(parent1, parent2) {
  const point = Math.floor(Math.random() * (parent1.length - 1)) + 1;
  
  let offspring = [
    ...parent1.slice(0, point), 
    ...parent2.slice(point)
  ];
  
  offspring = [...new Set(offspring)];
  
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
  const mutations = Math.floor(Math.random() * 2) + 1;
  
  for (let i = 0; i < mutations; i++) {
    const position = Math.floor(Math.random() * chromosome.length);
    
    let newExercise;
    do {
      const randomIndex = Math.floor(Math.random() * allExercises.length);
      newExercise = allExercises[randomIndex].id;
    } while (chromosome.includes(newExercise));
    
    chromosome[position] = newExercise;
  }
}

// Criar treino a partir do cromossomo (versão simplificada para teste)
async function createWorkout(chromosome, user, allExercises) {
  const selectedExercises = chromosome.map(id => 
    allExercises.find(ex => ex.id === id)
  );
  
  let workoutName = `Treino Genético - ${user.goal}`;
  let workoutDescription = `Treino personalizado por algoritmo genético para ${user.goal.toLowerCase()}, nível ${user.experience_level.toLowerCase()}.`;
  
  const estimatedDuration = user.experience_level === 'Iniciante' ? 45 : 
                            user.experience_level === 'Intermediário' ? 60 : 75;
  
  // Configurar parâmetros de cada exercício
  const workoutExercises = [];
  
  selectedExercises.forEach(exercise => {
    let sets, repetitions, rest_time;
    
    switch (user.goal) {
      case 'Perda de peso':
        sets = 3;
        repetitions = '15,15,15';
        rest_time = 45;
        break;
      case 'Hipertrofia':
        sets = user.experience_level === 'Avançado' ? 4 : 3;
        repetitions = user.experience_level === 'Avançado' ? '12,10,8,6' : '12,10,8';
        rest_time = 90;
        break;
      case 'Definição':
        sets = 4;
        repetitions = '12,12,12,12';
        rest_time = 60;
        break;
      case 'Condicionamento':
        sets = 3;
        repetitions = '15,15,15';
        rest_time = 45;
        break;
      case 'Reabilitação':
        sets = 3;
        repetitions = '12,12,12';
        rest_time = 60;
        break;
      default:
        sets = 3;
        repetitions = '12,10,8';
        rest_time = 60;
    }
    
    workoutExercises.push({
      exercise: exercise,
      sets,
      repetitions,
      rest_time
    });
  });
  
  return {
    name: workoutName,
    description: workoutDescription,
    goal: user.goal,
    experience_level: user.experience_level,
    estimated_duration: estimatedDuration,
    exercises: workoutExercises,
    chromosome: chromosome,
    fitness: calculateFitness(chromosome, user, allExercises)
  };
}

//FUNÇÃO DE TESTE

async function runTest() {
  console.log(' TESTE DO ALGORITMO GENÉTICO PARA RECOMENDAÇÃO DE TREINOS');
  console.log('='.repeat(70));
  
  // Cenários de teste
  const testUsers = [
    { goal: 'Hipertrofia', experience_level: 'Intermediário' },
    { goal: 'Perda de peso', experience_level: 'Iniciante' },
    { goal: 'Definição', experience_level: 'Avançado' },
    { goal: 'Condicionamento', experience_level: 'Intermediário' },
    { goal: 'Reabilitação', experience_level: 'Iniciante' }
  ];
  
  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];
    
    console.log(`\n TESTE ${i + 1}: ${user.goal} - ${user.experience_level}`);
    console.log('-'.repeat(50));
    
    try {
      const startTime = Date.now();
      
      // Executar algoritmo genético
      const result = await geneticAlgorithm(user, MOCK_EXERCISES, MOCK_EXISTING_WORKOUTS);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      // Exibir resultados
      console.log(`\n TREINO GERADO:`);
      console.log(`   Nome: ${result.name}`);
      console.log(`   Fitness: ${result.fitness} pontos`);
      console.log(`   Duração: ${result.estimated_duration} minutos`);
      console.log(`   Tempo de execução: ${executionTime}ms`);
      console.log(`   Exercícios (${result.exercises.length}):`);
      
      // Analisar diversidade de grupos musculares
      const groups = new Set();
      result.exercises.forEach((ex, idx) => {
        groups.add(ex.exercise.muscleGroup.name);
        console.log(`     ${idx + 1}. ${ex.exercise.name} (${ex.exercise.muscleGroup.name}) - ${ex.sets}x${ex.repetitions} (${ex.rest_time}s)`);
      });
      
      console.log(`   Grupos musculares trabalhados: ${groups.size} (${[...groups].join(', ')})`);
      
      // Análise de qualidade
      console.log(`\n ANÁLISE DE QUALIDADE:`);
      console.log(`   Cromossomo: [${result.chromosome.join(', ')}]`);
      console.log(`   Diversidade muscular: ${groups.size} grupos diferentes`);
      
      // Contagem por grupo
      const groupCounts = {};
      result.exercises.forEach(ex => {
        const group = ex.exercise.muscleGroup.name;
        groupCounts[group] = (groupCounts[group] || 0) + 1;
      });
      
      console.log(`   Distribuição por grupo:`);
      Object.entries(groupCounts).forEach(([group, count]) => {
        console.log(`     - ${group}: ${count} exercício(s)`);
      });
      
    } catch (error) {
      console.error(`❌ Erro no teste ${i + 1}: ${error.message}`);
    }
  }
  
  console.log('\n TESTES CONCLUÍDOS!');
}

 //EXECUÇÃO

// Verificar se o script está sendo executado diretamente
if (require.main === module) {
  runTest().catch(console.error);
}

// Exportar funções para uso em outros módulos
module.exports = {
  geneticAlgorithm,
  calculateFitness,
  MOCK_EXERCISES,
  MOCK_EXISTING_WORKOUTS
};