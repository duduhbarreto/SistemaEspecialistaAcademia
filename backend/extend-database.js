const db = require('./models');
const bcrypt = require('bcryptjs');
const logger = require('./utils/logger');

// Modelos
const Exercise = db.exercise;
const Workout = db.workout;
const WorkoutExercise = db.workoutExercise;
const MuscleGroup = db.muscleGroup;

const initExtendedDatabase = async () => {
  try {
    logger.info('Iniciando expansão do banco de dados...');
    
    // Verificar conexão
    await db.sequelize.authenticate();
    logger.info('Conexão estabelecida com sucesso!');
    
    // Buscar grupos musculares existentes
    const muscleGroups = await MuscleGroup.findAll();
    
    if (muscleGroups.length === 0) {
      logger.error('Nenhum grupo muscular encontrado. Execute setup-db.js primeiro.');
      process.exit(1);
    }
    
    // Mapear IDs dos grupos musculares por nome para referência fácil
    const muscleGroupMap = {};
    muscleGroups.forEach(group => {
      muscleGroupMap[group.name] = group.id;
    });
    
    logger.info('Adicionando novos exercícios...');
    
    // Novos exercícios organizados por grupo muscular
    const newExercises = [
      // PEITO (8 novos exercícios)
      {
        name: 'Supino Inclinado',
        description: 'Exercício para desenvolvimento da parte superior do peitoral utilizando banco inclinado.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Peito']
      },
      {
        name: 'Supino Declinado',
        description: 'Exercício para desenvolvimento da parte inferior do peitoral utilizando banco declinado.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Peito']
      },
      {
        name: 'Crucifixo com Halteres',
        description: 'Exercício de isolamento para o peitoral com foco na abertura horizontal dos braços.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Peito']
      },
      {
        name: 'Crossover (Polia Alta)',
        description: 'Exercício de isolamento para o peitoral usando cabos de polia alta.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Peito']
      },
      {
        name: 'Flexão de Braço',
        description: 'Exercício utilizando o peso corporal para desenvolvimento do peitoral, ombros e tríceps.',
        difficulty_level: 'Médio',
        equipment_required: false,
        muscle_group_id: muscleGroupMap['Peito']
      },
      {
        name: 'Flexão com Pés Elevados',
        description: 'Variação da flexão com os pés elevados para maior ênfase na parte superior do peitoral.',
        difficulty_level: 'Difícil',
        equipment_required: false,
        muscle_group_id: muscleGroupMap['Peito']
      },
      {
        name: 'Supino com Halteres',
        description: 'Exercício para desenvolvimento do peitoral utilizando halteres, permitindo maior amplitude de movimento.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Peito']
      },
      {
        name: 'Mergulho entre Bancos',
        description: 'Exercício com peso corporal que trabalha a parte inferior do peitoral e tríceps.',
        difficulty_level: 'Difícil',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Peito']
      },
      
      // COSTAS (8 novos exercícios)
      {
        name: 'Remada Curvada',
        description: 'Exercício para desenvolvimento das costas, com foco no latíssimo do dorso e trapézio.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Costas']
      },
      {
        name: 'Remada Unilateral com Halter',
        description: 'Exercício que trabalha um lado da costas por vez, com foco no equilíbrio e desenvolvimento simétrico.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Costas']
      },
      {
        name: 'Puxada Fechada',
        description: 'Puxada no pulley com pegada fechada, focando na parte interna das costas e bíceps.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Costas']
      },
      {
        name: 'Remada Cavalinho',
        description: 'Exercício que utiliza o apoio no banco para realizar remada com halteres.',
        difficulty_level: 'Fácil',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Costas']
      },
      {
        name: 'Barra Fixa (Pull-up)',
        description: 'Exercício que utiliza o peso corporal para trabalhar a parte superior das costas e bíceps.',
        difficulty_level: 'Difícil',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Costas']
      },
      {
        name: 'Remada Baixa',
        description: 'Exercício no pulley baixo para focar nos músculos da parte média e baixa das costas.',
        difficulty_level: 'Fácil',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Costas']
      },
      {
        name: 'Puxada Aberta',
        description: 'Exercício de puxada com pegada aberta, focando na largura da costas e desenvolvimento do dorsal.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Costas']
      },
      {
        name: 'Remada Serrote',
        description: 'Exercício unilateral para costas que permite grande contração e isolamento do lado trabalhado.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Costas']
      },
      
      // OMBROS (7 novos exercícios)
      {
        name: 'Elevação Lateral',
        description: 'Exercício de isolamento para os deltoides laterais.',
        difficulty_level: 'Fácil',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Ombros']
      },
      {
        name: 'Elevação Frontal',
        description: 'Exercício de isolamento para os deltoides anteriores.',
        difficulty_level: 'Fácil',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Ombros']
      },
      {
        name: 'Remada Alta',
        description: 'Exercício para desenvolvimento de deltoides e trapézio.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Ombros']
      },
      {
        name: 'Face Pull',
        description: 'Exercício para desenvolvimento dos deltoides posteriores e rotadores do ombro.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Ombros']
      },
      {
        name: 'Desenvolvimento Arnold',
        description: 'Variação do desenvolvimento que envolve rotação dos braços, trabalhando múltiplos aspectos do ombro.',
        difficulty_level: 'Difícil',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Ombros']
      },
      {
        name: 'Pássaro (Elevação Posterior)',
        description: 'Exercício para isolamento dos deltoides posteriores.',
        difficulty_level: 'Fácil',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Ombros']
      },
      {
        name: 'Desenvolvimento Militar',
        description: 'Exercício composto para desenvolvimento dos ombros utilizando barra.',
        difficulty_level: 'Difícil',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Ombros']
      },
      
      // BÍCEPS (5 novos exercícios)
      {
        name: 'Rosca Scott',
        description: 'Exercício para bíceps com apoio de banco Scott, focando na cabeça longa.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Bíceps']
      },
      {
        name: 'Rosca Martelo',
        description: 'Exercício para bíceps e braquial com pegada neutra.',
        difficulty_level: 'Fácil',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Bíceps']
      },
      {
        name: 'Rosca Concentrada',
        description: 'Exercício de isolamento para bíceps, sentado com cotovelo apoiado no joelho.',
        difficulty_level: 'Fácil',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Bíceps']
      },
      {
        name: 'Rosca Alternada',
        description: 'Exercício para bíceps alternando braços, permitindo maior concentração em cada lado.',
        difficulty_level: 'Fácil',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Bíceps']
      },
      {
        name: 'Rosca com Barra W',
        description: 'Exercício para bíceps utilizando barra W, que permite posicionamento mais anatômico dos punhos.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Bíceps']
      },
      
      // TRÍCEPS (5 novos exercícios)
      {
        name: 'Tríceps Francês',
        description: 'Exercício para tríceps realizado com peso sobre a cabeça.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Tríceps']
      },
      {
        name: 'Tríceps Testa',
        description: 'Exercício para tríceps com barra descendo até a testa.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Tríceps']
      },
      {
        name: 'Tríceps Coice',
        description: 'Exercício para tríceps em posição inclinada, simulando o movimento de coice.',
        difficulty_level: 'Fácil',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Tríceps']
      },
      {
        name: 'Tríceps no Banco',
        description: 'Exercício para tríceps utilizando o peso corporal com apoio no banco.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Tríceps']
      },
      {
        name: 'Supino Fechado',
        description: 'Exercício composto que enfatiza o tríceps com pegada próxima.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Tríceps']
      },
      
      // PERNAS (8 novos exercícios)
      {
        name: 'Leg Press',
        description: 'Exercício para quadríceps, posterior e glúteos utilizando máquina específica.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Pernas']
      },
      {
        name: 'Cadeira Extensora',
        description: 'Exercício de isolamento para quadríceps.',
        difficulty_level: 'Fácil',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Pernas']
      },
      {
        name: 'Mesa Flexora',
        description: 'Exercício de isolamento para posterior de coxa.',
        difficulty_level: 'Fácil',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Pernas']
      },
      {
        name: 'Stiff',
        description: 'Exercício para posterior de coxa e glúteos com ênfase no movimento de quadril.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Pernas']
      },
      {
        name: 'Adução de Quadril',
        description: 'Exercício para músculos adutores utilizando máquina ou elástico.',
        difficulty_level: 'Fácil',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Pernas']
      },
      {
        name: 'Abdução de Quadril',
        description: 'Exercício para músculos abdutores e glúteo médio utilizando máquina ou elástico.',
        difficulty_level: 'Fácil',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Pernas']
      },
      {
        name: 'Afundo',
        description: 'Exercício para quadríceps, posterior e glúteos que trabalha cada perna individualmente.',
        difficulty_level: 'Médio',
        equipment_required: false,
        muscle_group_id: muscleGroupMap['Pernas']
      },
      {
        name: 'Agachamento Sumô',
        description: 'Variação do agachamento com pernas mais abertas, focando na parte interna das coxas e glúteos.',
        difficulty_level: 'Médio',
        equipment_required: false,
        muscle_group_id: muscleGroupMap['Pernas']
      },
      
      // ABDÔMEN (5 novos exercícios)
      {
        name: 'Prancha',
        description: 'Exercício isométrico para fortalecimento do core, incluindo abdômen e lombar.',
        difficulty_level: 'Médio',
        equipment_required: false,
        muscle_group_id: muscleGroupMap['Abdômen']
      },
      {
        name: 'Abdominal Infra',
        description: 'Exercício focado na parte inferior do abdômen.',
        difficulty_level: 'Médio',
        equipment_required: false,
        muscle_group_id: muscleGroupMap['Abdômen']
      },
      {
        name: 'Abdominal Oblíquo',
        description: 'Exercício focado nos músculos abdominais oblíquos.',
        difficulty_level: 'Médio',
        equipment_required: false,
        muscle_group_id: muscleGroupMap['Abdômen']
      },
      {
        name: 'Russian Twist',
        description: 'Exercício rotacional para os músculos oblíquos do abdômen.',
        difficulty_level: 'Médio',
        equipment_required: false,
        muscle_group_id: muscleGroupMap['Abdômen']
      },
      {
        name: 'Elevação de Pernas',
        description: 'Exercício para o abdômen inferior com elevação das pernas estendidas.',
        difficulty_level: 'Difícil',
        equipment_required: false,
        muscle_group_id: muscleGroupMap['Abdômen']
      },
      
      // GLÚTEOS (5 novos exercícios)
      {
        name: 'Agachamento Sumo',
        description: 'Variação do agachamento com foco nos glúteos e parte interna das coxas.',
        difficulty_level: 'Médio',
        equipment_required: false,
        muscle_group_id: muscleGroupMap['Glúteos']
      },
      {
        name: 'Coice para Glúteo',
        description: 'Exercício isolado para glúteo máximo, com movimento de extensão de quadril.',
        difficulty_level: 'Fácil',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Glúteos']
      },
      {
        name: 'Abdução de Quadril Deitado',
        description: 'Exercício para glúteo médio realizado em posição deitada lateral.',
        difficulty_level: 'Fácil',
        equipment_required: false,
        muscle_group_id: muscleGroupMap['Glúteos']
      },
      {
        name: 'Agachamento Búlgaro',
        description: 'Exercício unilateral para pernas e glúteos com pé elevado.',
        difficulty_level: 'Difícil',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Glúteos']
      },
      {
        name: 'Ponte com Elevação de Perna',
        description: 'Variação da ponte para glúteos com elevação alternada de pernas.',
        difficulty_level: 'Médio',
        equipment_required: false,
        muscle_group_id: muscleGroupMap['Glúteos']
      },
      
      // PANTURRILHA (3 novos exercícios)
      {
        name: 'Panturrilha Sentado',
        description: 'Exercício para panturrilha com ênfase no sóleo, realizado em posição sentada.',
        difficulty_level: 'Fácil',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Panturrilha']
      },
      {
        name: 'Panturrilha Burro',
        description: 'Exercício para panturrilha realizado em máquina específica com o peso sobre os quadris.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Panturrilha']
      },
      {
        name: 'Panturrilha Unilateral',
        description: 'Exercício para panturrilha realizado com uma perna por vez para maior intensidade.',
        difficulty_level: 'Médio',
        equipment_required: false,
        muscle_group_id: muscleGroupMap['Panturrilha']
      },
      
      // ANTEBRAÇO (3 novos exercícios)
      {
        name: 'Rosca de Punho Inversa',
        description: 'Exercício para os músculos extensores do antebraço.',
        difficulty_level: 'Fácil',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Antebraço']
      },
      {
        name: 'Preensão com Hand Grip',
        description: 'Exercício com grip para fortalecimento da pegada e antebraço.',
        difficulty_level: 'Fácil',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Antebraço']
      },
      {
        name: 'Roda para Antebraço',
        description: 'Exercício com roda para fortalecimento dos flexores e extensores do antebraço.',
        difficulty_level: 'Médio',
        equipment_required: true,
        muscle_group_id: muscleGroupMap['Antebraço']
      }
    ];
    
    // Inserir os novos exercícios
    const createdExercises = await Exercise.bulkCreate(newExercises);
    logger.info(`✅ ${createdExercises.length} novos exercícios adicionados com sucesso!`);
    
    // Criar novos treinos
    logger.info('Adicionando novos treinos...');
    
    const newWorkouts = [
      {
        name: 'Treino ABC (A - Peito/Tríceps/Ombros)',
        description: 'Treino focado em peito, tríceps e ombros para hipertrofia, parte do sistema ABC.',
        goal: 'Hipertrofia',
        experience_level: 'Intermediário',
        estimated_duration: 65
      },
      {
        name: 'Treino ABC (B - Costas/Bíceps/Antebraço)',
        description: 'Treino focado em costas, bíceps e antebraço para hipertrofia, parte do sistema ABC.',
        goal: 'Hipertrofia',
        experience_level: 'Intermediário',
        estimated_duration: 65
      },
      {
        name: 'Treino ABC (C - Pernas/Abdômen)',
        description: 'Treino focado em pernas, glúteos e abdômen para hipertrofia, parte do sistema ABC.',
        goal: 'Hipertrofia',
        experience_level: 'Intermediário',
        estimated_duration: 70
      },
      {
        name: 'HIIT Full Body',
        description: 'Treino de alta intensidade com intervalos curtos para queima de gordura e condicionamento.',
        goal: 'Perda de peso',
        experience_level: 'Intermediário',
        estimated_duration: 35
      },
      {
        name: 'Treino de Força Upper/Lower (Upper)',
        description: 'Treino de força para parte superior do corpo, focado em progressão de carga.',
        goal: 'Hipertrofia',
        experience_level: 'Avançado',
        estimated_duration: 75
      },
      {
        name: 'Treino de Força Upper/Lower (Lower)',
        description: 'Treino de força para parte inferior do corpo, focado em progressão de carga.',
        goal: 'Hipertrofia',
        experience_level: 'Avançado',
        estimated_duration: 70
      },
      {
        name: 'Circuito Metabólico',
        description: 'Treino em circuito com exercícios compostos para máxima queima calórica e condicionamento.',
        goal: 'Perda de peso',
        experience_level: 'Intermediário',
        estimated_duration: 45
      },
      {
        name: 'Treino Push/Pull/Legs (Push)',
        description: 'Treino de empurrar (peito, ombros, tríceps) do sistema PPL.',
        goal: 'Hipertrofia',
        experience_level: 'Avançado',
        estimated_duration: 70
      },
      {
        name: 'Treino Push/Pull/Legs (Pull)',
        description: 'Treino de puxar (costas, bíceps, antebraço) do sistema PPL.',
        goal: 'Hipertrofia',
        experience_level: 'Avançado',
        estimated_duration: 70
      },
      {
        name: 'Treino Push/Pull/Legs (Legs)',
        description: 'Treino de pernas do sistema PPL.',
        goal: 'Hipertrofia',
        experience_level: 'Avançado',
        estimated_duration: 65
      },
      {
        name: 'Treino de Reabilitação para Iniciantes',
        description: 'Treino leve para reabilitação e fortalecimento geral após lesões ou longos períodos de inatividade.',
        goal: 'Reabilitação',
        experience_level: 'Iniciante',
        estimated_duration: 40
      },
      {
        name: 'Treino de Definição Full Body (Alta Repetição)',
        description: 'Treino completo com alta repetição para definição muscular e resistência.',
        goal: 'Definição',
        experience_level: 'Intermediário',
        estimated_duration: 60
      },
      {
        name: 'Treino de Resistência Muscular',
        description: 'Treino com altas repetições e curtos intervalos para aumentar resistência muscular e definição.',
        goal: 'Condicionamento',
        experience_level: 'Iniciante',
        estimated_duration: 50
      },
      {
        name: 'Treino Funcional',
        description: 'Treino com exercícios funcionais que simulam movimentos do dia-a-dia para melhorar força prática e condicionamento.',
        goal: 'Condicionamento',
        experience_level: 'Iniciante',
        estimated_duration: 45
      },
      {
        name: 'Treino para Idosos',
        description: 'Treino específico para idosos com foco em fortalecimento, equilíbrio e manutenção da massa muscular.',
        goal: 'Condicionamento',
        experience_level: 'Iniciante',
        estimated_duration: 40
      }
    ];
    
    // Inserir os novos treinos
    const createdWorkouts = await Workout.bulkCreate(newWorkouts);
    logger.info(`✅ ${createdWorkouts.length} novos treinos adicionados com sucesso!`);
    
    // Buscar todos os exercícios para associar aos treinos
    const allExercises = await Exercise.findAll();
    
    // Mapear exercícios por grupo muscular para facilitar a criação dos treinos
    const exercisesByMuscleGroup = {};
    allExercises.forEach(exercise => {
      if (!exercisesByMuscleGroup[exercise.muscle_group_id]) {
        exercisesByMuscleGroup[exercise.muscle_group_id] = [];
      }
      exercisesByMuscleGroup[exercise.muscle_group_id].push(exercise);
    });
    
    // Função para selecionar exercícios aleatórios de um grupo muscular
    const getRandomExercises = (muscleGroupId, count) => {
      const exercises = exercisesByMuscleGroup[muscleGroupId] || [];
      const shuffled = [...exercises].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.min(count, shuffled.length));
    };
    
    // Criar associações entre treinos e exercícios
    logger.info('Criando associações entre treinos e exercícios...');
    
    const workoutExercises = [];
    
    // Treino ABC (A - Peito/Tríceps/Ombros)
    const treino1 = createdWorkouts[0];
    [
      ...getRandomExercises(muscleGroupMap['Peito'], 3),
      ...getRandomExercises(muscleGroupMap['Tríceps'], 3),
      ...getRandomExercises(muscleGroupMap['Ombros'], 2)
    ].forEach(exercise => {
      workoutExercises.push({
        workout_id: treino1.id,
        exercise_id: exercise.id,
        sets: 4,
        repetitions: '12,10,8,6',
        rest_time: 90
      });
    });
    
    // Treino ABC (B - Costas/Bíceps/Antebraço)
    const treino2 = createdWorkouts[1];
    [
      ...getRandomExercises(muscleGroupMap['Costas'], 3),
      ...getRandomExercises(muscleGroupMap['Bíceps'], 3),
      ...getRandomExercises(muscleGroupMap['Antebraço'], 2)
    ].forEach(exercise => {
      workoutExercises.push({
        workout_id: treino2.id,
        exercise_id: exercise.id,
        sets: 4,
        repetitions: '12,10,8,6',
        rest_time: 90
      });
    });
    
    // Treino ABC (C - Pernas/Abdômen)
    const treino3 = createdWorkouts[2];
    [
      ...getRandomExercises(muscleGroupMap['Pernas'], 4),
      ...getRandomExercises(muscleGroupMap['Glúteos'], 2),
      ...getRandomExercises(muscleGroupMap['Panturrilha'], 1),
      ...getRandomExercises(muscleGroupMap['Abdômen'], 2)
    ].forEach(exercise => {
      workoutExercises.push({
        workout_id: treino3.id,
        exercise_id: exercise.id,
        sets: 4,
        repetitions: '12,10,8,6',
        rest_time: 90
      });
    });
    
    // HIIT Full Body
    const treino4 = createdWorkouts[3];
    [
      ...getRandomExercises(muscleGroupMap['Peito'], 1),
      ...getRandomExercises(muscleGroupMap['Costas'], 1),
      ...getRandomExercises(muscleGroupMap['Pernas'], 2),
      ...getRandomExercises(muscleGroupMap['Ombros'], 1),
      ...getRandomExercises(muscleGroupMap['Abdômen'], 1)
    ].forEach(exercise => {
      workoutExercises.push({
        workout_id: treino4.id,
        exercise_id: exercise.id,
        sets: 3,
        repetitions: '20,20,20',
        rest_time: 30
      });
    });
    
    // Treino de Força Upper/Lower (Upper)
    const treino5 = createdWorkouts[4];
    [
      ...getRandomExercises(muscleGroupMap['Peito'], 2),
      ...getRandomExercises(muscleGroupMap['Costas'], 2),
      ...getRandomExercises(muscleGroupMap['Ombros'], 2),
      ...getRandomExercises(muscleGroupMap['Bíceps'], 1),
      ...getRandomExercises(muscleGroupMap['Tríceps'], 1)
    ].forEach(exercise => {
      workoutExercises.push({
        workout_id: treino5.id,
        exercise_id: exercise.id,
        sets: 5,
        repetitions: '5,5,5,5,5',
        rest_time: 180
      });
    });
    
    // Continuar criando associações para os demais treinos...
    // Treino de Força Upper/Lower (Lower)
    const treino6 = createdWorkouts[5];
    [
      ...getRandomExercises(muscleGroupMap['Pernas'], 3),
      ...getRandomExercises(muscleGroupMap['Glúteos'], 2),
      ...getRandomExercises(muscleGroupMap['Panturrilha'], 1),
      ...getRandomExercises(muscleGroupMap['Abdômen'], 1)
    ].forEach(exercise => {
      workoutExercises.push({
        workout_id: treino6.id,
        exercise_id: exercise.id,
        sets: 5,
        repetitions: '5,5,5,5,5',
        rest_time: 180
      });
    });
    
    // Circuito Metabólico
    const treino7 = createdWorkouts[6];
    [
      ...getRandomExercises(muscleGroupMap['Peito'], 1),
      ...getRandomExercises(muscleGroupMap['Costas'], 1),
      ...getRandomExercises(muscleGroupMap['Pernas'], 1),
      ...getRandomExercises(muscleGroupMap['Ombros'], 1),
      ...getRandomExercises(muscleGroupMap['Abdômen'], 1),
      ...getRandomExercises(muscleGroupMap['Glúteos'], 1)
    ].forEach(exercise => {
      workoutExercises.push({
        workout_id: treino7.id,
        exercise_id: exercise.id,
        sets: 4,
        repetitions: '15,15,15,15',
        rest_time: 15
      });
    });
    
    // Inserir todas as associações
    await WorkoutExercise.bulkCreate(workoutExercises);
    logger.info(`✅ ${workoutExercises.length} associações entre treinos e exercícios criadas com sucesso!`);
    
    logger.info('\n✅ Expansão do banco de dados concluída com sucesso!');
    logger.info(`✓ ${createdExercises.length} novos exercícios adicionados`);
    logger.info(`✓ ${createdWorkouts.length} novos treinos adicionados`);
    logger.info(`✓ ${workoutExercises.length} associações entre treinos e exercícios criadas`);
    
  } catch (error) {
    logger.error('\n❌ Erro na expansão do banco de dados:', error);
  }
};

// Executar a função
initExtendedDatabase();