// server/setup-db.js
require('dotenv').config();
const db = require('./models');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// Modelos
const User = db.user;
const MuscleGroup = db.muscleGroup;
const Exercise = db.exercise;
const Workout = db.workout;
const WorkoutExercise = db.workoutExercise;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para inicializar o banco de dados
async function initDatabase(forceReset = false) {
  try {
    console.log('\n==== CONFIGURAÇÃO DO BANCO DE DADOS ====');
    console.log('Conectando ao banco de dados...');
    
    // Verificar conexão
    await db.sequelize.authenticate();
    console.log('✓ Conexão estabelecida com sucesso!');
    
    if (forceReset) {
      console.log('\n⚠️  ATENÇÃO: Isso irá APAGAR todos os dados existentes! ⚠️');
      await new Promise((resolve) => {
        rl.question('Deseja continuar? (s/n): ', (answer) => {
          if (answer.toLowerCase() !== 's') {
            console.log('Operação cancelada.');
            process.exit(0);
          }
          resolve();
        });
      });
    }
    
    // Sincronizar modelos com o banco de dados
    console.log('\nSincronizando modelos com o banco de dados...');
    await db.sequelize.sync({ force: forceReset });
    console.log('✓ Modelos sincronizados com sucesso!');
    
    if (forceReset) {
      console.log('\nPopulando banco de dados com dados iniciais...');
      
      // Seed grupo muscular
      console.log('  Criando grupos musculares...');
      const muscleGroups = await MuscleGroup.bulkCreate([
        { name: 'Peito' },
        { name: 'Costas' },
        { name: 'Ombros' },
        { name: 'Bíceps' },
        { name: 'Tríceps' },
        { name: 'Pernas' },
        { name: 'Abdômen' },
        { name: 'Glúteos' },
        { name: 'Panturrilha' },
        { name: 'Antebraço' }
      ]);
      console.log(`  ✓ ${muscleGroups.length} grupos musculares criados.`);
      
      // Seed exercícios
      console.log('  Criando exercícios...');
      const exercises = await Exercise.bulkCreate([
        {
          name: 'Supino Reto',
          description: 'Exercício para desenvolvimento do peitoral utilizando barra e banco reto.',
          difficulty_level: 'Médio',
          equipment_required: true,
          muscle_group_id: muscleGroups[0].id // Peito
        },
        {
          name: 'Agachamento',
          description: 'Exercício para desenvolvimento de quadríceps, glúteos e fortalecimento de core.',
          difficulty_level: 'Médio',
          equipment_required: false,
          muscle_group_id: muscleGroups[5].id // Pernas
        },
        {
          name: 'Puxada Alta',
          description: 'Exercício para desenvolvimento das costas, com foco no latíssimo do dorso.',
          difficulty_level: 'Médio',
          equipment_required: true,
          muscle_group_id: muscleGroups[1].id // Costas
        },
        {
          name: 'Desenvolvimento com Halteres',
          description: 'Exercício para desenvolvimento dos ombros.',
          difficulty_level: 'Médio',
          equipment_required: true,
          muscle_group_id: muscleGroups[2].id // Ombros
        },
        {
          name: 'Rosca Direta',
          description: 'Exercício isolado para desenvolvimento dos bíceps.',
          difficulty_level: 'Fácil',
          equipment_required: true,
          muscle_group_id: muscleGroups[3].id // Bíceps
        },
        {
          name: 'Tríceps Corda',
          description: 'Exercício isolado para desenvolvimento da cabeça lateral do tríceps.',
          difficulty_level: 'Fácil',
          equipment_required: true,
          muscle_group_id: muscleGroups[4].id // Tríceps
        },
        {
          name: 'Abdominal Reto',
          description: 'Exercício para fortalecimento do abdômen.',
          difficulty_level: 'Fácil',
          equipment_required: false,
          muscle_group_id: muscleGroups[6].id // Abdômen
        },
        {
          name: 'Elevação Pélvica',
          description: 'Exercício para fortalecimento dos glúteos e posterior da coxa.',
          difficulty_level: 'Fácil',
          equipment_required: false,
          muscle_group_id: muscleGroups[7].id // Glúteos
        },
        {
          name: 'Elevação de Panturrilha',
          description: 'Exercício para desenvolvimento das panturrilhas.',
          difficulty_level: 'Fácil',
          equipment_required: false,
          muscle_group_id: muscleGroups[8].id // Panturrilha
        },
        {
          name: 'Flexão de Punho',
          description: 'Exercício para fortalecimento dos músculos do antebraço.',
          difficulty_level: 'Fácil',
          equipment_required: true,
          muscle_group_id: muscleGroups[9].id // Antebraço
        }
      ]);
      console.log(`  ✓ ${exercises.length} exercícios criados.`);

      // Seed treinos
      console.log('  Criando treinos...');
      const workouts = await Workout.bulkCreate([
        {
          name: 'Treino Iniciante Full Body',
          description: 'Treino completo para iniciantes, focado em todos os grupos musculares principais.',
          goal: 'Condicionamento',
          experience_level: 'Iniciante',
          estimated_duration: 45
        },
        {
          name: 'Treino de Hipertrofia A',
          description: 'Treino focado em ganho de massa muscular para superiores (peito, costas e ombros).',
          goal: 'Hipertrofia',
          experience_level: 'Intermediário',
          estimated_duration: 60
        },
        {
          name: 'Treino de Hipertrofia B',
          description: 'Treino focado em ganho de massa muscular para inferiores (pernas e glúteos).',
          goal: 'Hipertrofia',
          experience_level: 'Intermediário',
          estimated_duration: 60
        },
        {
          name: 'Treino de Definição',
          description: 'Treino com maior número de repetições e menor intervalo para definição muscular.',
          goal: 'Definição',
          experience_level: 'Avançado',
          estimated_duration: 50
        },
        {
          name: 'Treino para Perda de Peso',
          description: 'Treino com exercícios compostos e alta intensidade para maximizar o gasto calórico.',
          goal: 'Perda de peso',
          experience_level: 'Iniciante',
          estimated_duration: 40
        }
      ]);
      console.log(`  ✓ ${workouts.length} treinos criados.`);

      // Associar treinos com exercícios
      console.log('  Criando associações entre treinos e exercícios...');
      
      // Workout 1: Iniciante Full Body
      await WorkoutExercise.bulkCreate([
        { workout_id: workouts[0].id, exercise_id: exercises[1].id, sets: 3, repetitions: '12,10,10', rest_time: 60 }, // Agachamento
        { workout_id: workouts[0].id, exercise_id: exercises[0].id, sets: 3, repetitions: '12,10,10', rest_time: 60 }, // Supino
        { workout_id: workouts[0].id, exercise_id: exercises[2].id, sets: 3, repetitions: '12,10,10', rest_time: 60 }, // Puxada
        { workout_id: workouts[0].id, exercise_id: exercises[6].id, sets: 3, repetitions: '15,15,15', rest_time: 45 }  // Abdominal
      ]);

      // Workout 2: Hipertrofia A
      await WorkoutExercise.bulkCreate([
        { workout_id: workouts[1].id, exercise_id: exercises[0].id, sets: 4, repetitions: '12,10,8,8', rest_time: 90 },  // Supino
        { workout_id: workouts[1].id, exercise_id: exercises[2].id, sets: 4, repetitions: '12,10,8,8', rest_time: 90 },  // Puxada
        { workout_id: workouts[1].id, exercise_id: exercises[3].id, sets: 3, repetitions: '12,10,10', rest_time: 60 },   // Desenvolvimento
        { workout_id: workouts[1].id, exercise_id: exercises[4].id, sets: 3, repetitions: '12,10,10', rest_time: 60 },   // Rosca
        { workout_id: workouts[1].id, exercise_id: exercises[5].id, sets: 3, repetitions: '12,10,10', rest_time: 60 }    // Tríceps
      ]);

      // Workout 3: Hipertrofia B
      await WorkoutExercise.bulkCreate([
        { workout_id: workouts[2].id, exercise_id: exercises[1].id, sets: 4, repetitions: '12,10,8,8', rest_time: 90 },  // Agachamento
        { workout_id: workouts[2].id, exercise_id: exercises[7].id, sets: 4, repetitions: '15,15,15,15', rest_time: 60 }, // Elevação Pélvica
        { workout_id: workouts[2].id, exercise_id: exercises[8].id, sets: 4, repetitions: '20,20,20,20', rest_time: 45 }, // Panturrilha
        { workout_id: workouts[2].id, exercise_id: exercises[6].id, sets: 4, repetitions: '20,20,20,20', rest_time: 45 }  // Abdominal
      ]);

      // Workout 4: Definição
      await WorkoutExercise.bulkCreate([
        { workout_id: workouts[3].id, exercise_id: exercises[0].id, sets: 4, repetitions: '15,15,15,15', rest_time: 30 }, // Supino
        { workout_id: workouts[3].id, exercise_id: exercises[1].id, sets: 4, repetitions: '15,15,15,15', rest_time: 30 }, // Agachamento
        { workout_id: workouts[3].id, exercise_id: exercises[2].id, sets: 4, repetitions: '15,15,15,15', rest_time: 30 }, // Puxada
        { workout_id: workouts[3].id, exercise_id: exercises[3].id, sets: 4, repetitions: '15,15,15,15', rest_time: 30 }, // Desenvolvimento
        { workout_id: workouts[3].id, exercise_id: exercises[6].id, sets: 4, repetitions: '20,20,20,20', rest_time: 30 }  // Abdominal
      ]);

      // Workout 5: Perda de Peso
      await WorkoutExercise.bulkCreate([
        { workout_id: workouts[4].id, exercise_id: exercises[1].id, sets: 3, repetitions: '15,15,15', rest_time: 30 }, // Agachamento
        { workout_id: workouts[4].id, exercise_id: exercises[0].id, sets: 3, repetitions: '15,15,15', rest_time: 30 }, // Supino
        { workout_id: workouts[4].id, exercise_id: exercises[2].id, sets: 3, repetitions: '15,15,15', rest_time: 30 }, // Puxada
        { workout_id: workouts[4].id, exercise_id: exercises[6].id, sets: 3, repetitions: '20,20,20', rest_time: 30 }, // Abdominal
        { workout_id: workouts[4].id, exercise_id: exercises[8].id, sets: 3, repetitions: '20,20,20', rest_time: 30 }  // Panturrilha
      ]);

      console.log('  ✓ Associações entre treinos e exercícios criadas.');

      // Criar usuário admin
      console.log('  Criando usuário administrador...');
      await User.create({
        name: 'Administrador',
        email: 'admin@example.com',
        password: bcrypt.hashSync('123456', 8),
        age: 30,
        weight: 70,
        height: 1.75,
        goal: 'Condicionamento',
        experience_level: 'Intermediário'
      });
      console.log('  ✓ Usuário administrador criado.');
      
      console.log('\n✅ Banco de dados inicializado com sucesso!');
      console.log('\nCredenciais do administrador:');
      console.log('  - Email: admin@example.com');
      console.log('  - Senha: 123456');
    } else {
      console.log('\n✅ Conexão com o banco de dados estabelecida e estrutura verificada!');
    }
    
  } catch (error) {
    console.error('\n❌ Falha na inicialização do banco de dados:');
    console.error(error);
    
    // Mensagens de erro específicas para problemas comuns
    if (error.name === 'SequelizeConnectionRefusedError') {
      console.error('\nO servidor MySQL não está em execução ou a conexão foi recusada.');
      console.error('Verifique se o MySQL está instalado e em execução, e se as configurações de conexão estão corretas.\n');
    } else if (error.name === 'SequelizeConnectionError') {
      console.error('\nNão foi possível conectar ao banco de dados.');
      console.error('Verifique se o nome do banco de dados, usuário e senha estão corretos.\n');
    } else if (error.name === 'SequelizeDatabaseError') {
      console.error('\nErro ao executar operação no banco de dados.');
      console.error('Verifique os detalhes do erro acima para mais informações.\n');
    }
    
  } finally {
    rl.close();
    process.exit();
  }
}

// Perguntar ao usuário se deseja resetar o banco de dados
rl.question('Deseja resetar o banco de dados? (s/n): ', (answer) => {
  const forceReset = answer.toLowerCase() === 's';
  initDatabase(forceReset);
});