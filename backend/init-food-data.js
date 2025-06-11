require('dotenv').config(); 
const db = require('./models');
const Food = db.food;
const logger = require('./utils/logger');

// Dados de alimentos
const foods = [
  // Proteínas
  { name: 'Peito de frango', category: 'Proteína', calories_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6 },
  { name: 'Carne bovina (acém)', category: 'Proteína', calories_per_100g: 250, protein_per_100g: 26, carbs_per_100g: 0, fat_per_100g: 17 },
  { name: 'Salmão', category: 'Proteína', calories_per_100g: 208, protein_per_100g: 20, carbs_per_100g: 0, fat_per_100g: 13 },
  { name: 'Atum em conserva', category: 'Proteína', calories_per_100g: 116, protein_per_100g: 25, carbs_per_100g: 0, fat_per_100g: 1 },
  { name: 'Ovos', category: 'Proteína', calories_per_100g: 155, protein_per_100g: 13, carbs_per_100g: 1, fat_per_100g: 11 },
  { name: 'Tofu', category: 'Proteína', calories_per_100g: 76, protein_per_100g: 8, carbs_per_100g: 2, fat_per_100g: 4.5 },
  { name: 'Whey Protein', category: 'Proteína', calories_per_100g: 400, protein_per_100g: 80, carbs_per_100g: 10, fat_per_100g: 3 },
  { name: 'Feijão preto', category: 'Proteína', calories_per_100g: 132, protein_per_100g: 8.9, carbs_per_100g: 23.7, fat_per_100g: 0.5 },
  { name: 'Lentilha', category: 'Proteína', calories_per_100g: 116, protein_per_100g: 9, carbs_per_100g: 20, fat_per_100g: 0.4 },
  { name: 'Grão de bico', category: 'Proteína', calories_per_100g: 164, protein_per_100g: 8.9, carbs_per_100g: 27.4, fat_per_100g: 2.6 },
  
  // Carboidratos
  { name: 'Arroz branco', category: 'Carboidrato', calories_per_100g: 130, protein_per_100g: 2.7, carbs_per_100g: 28, fat_per_100g: 0.3 },
  { name: 'Arroz integral', category: 'Carboidrato', calories_per_100g: 111, protein_per_100g: 2.6, carbs_per_100g: 23, fat_per_100g: 0.9 },
  { name: 'Batata doce', category: 'Carboidrato', calories_per_100g: 86, protein_per_100g: 1.6, carbs_per_100g: 20, fat_per_100g: 0.1 },
  { name: 'Macarrão integral', category: 'Carboidrato', calories_per_100g: 158, protein_per_100g: 5.5, carbs_per_100g: 30, fat_per_100g: 1.3 },
  { name: 'Pão integral', category: 'Carboidrato', calories_per_100g: 247, protein_per_100g: 13, carbs_per_100g: 41, fat_per_100g: 3.6 },
  { name: 'Aveia', category: 'Carboidrato', calories_per_100g: 389, protein_per_100g: 16.9, carbs_per_100g: 66.3, fat_per_100g: 6.9 },
  { name: 'Quinoa', category: 'Carboidrato', calories_per_100g: 120, protein_per_100g: 4.4, carbs_per_100g: 21.3, fat_per_100g: 1.9 },
  { name: 'Tapioca', category: 'Carboidrato', calories_per_100g: 358, protein_per_100g: 0.5, carbs_per_100g: 88, fat_per_100g: 0.3 },
  { name: 'Mandioca', category: 'Carboidrato', calories_per_100g: 159, protein_per_100g: 1.4, carbs_per_100g: 38, fat_per_100g: 0.3 },
  { name: 'Batata inglesa', category: 'Carboidrato', calories_per_100g: 77, protein_per_100g: 2, carbs_per_100g: 17, fat_per_100g: 0.1 },
  
  // Gorduras
  { name: 'Azeite de oliva', category: 'Gordura', calories_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100 },
  { name: 'Abacate', category: 'Gordura', calories_per_100g: 160, protein_per_100g: 2, carbs_per_100g: 8.5, fat_per_100g: 14.7 },
  { name: 'Castanha do Pará', category: 'Gordura', calories_per_100g: 656, protein_per_100g: 14.5, carbs_per_100g: 12, fat_per_100g: 67 },
  { name: 'Amêndoas', category: 'Gordura', calories_per_100g: 576, protein_per_100g: 21, carbs_per_100g: 22, fat_per_100g: 49 },
  { name: 'Óleo de coco', category: 'Gordura', calories_per_100g: 862, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100 },
  
  // Vegetais
  { name: 'Brócolis', category: 'Vegetal', calories_per_100g: 34, protein_per_100g: 2.8, carbs_per_100g: 7, fat_per_100g: 0.4 },
  { name: 'Espinafre', category: 'Vegetal', calories_per_100g: 23, protein_per_100g: 2.9, carbs_per_100g: 3.6, fat_per_100g: 0.4 },
  { name: 'Alface', category: 'Vegetal', calories_per_100g: 15, protein_per_100g: 1.4, carbs_per_100g: 2.9, fat_per_100g: 0.2 },
  { name: 'Tomate', category: 'Vegetal', calories_per_100g: 18, protein_per_100g: 0.9, carbs_per_100g: 3.9, fat_per_100g: 0.2 },
  { name: 'Cenoura', category: 'Vegetal', calories_per_100g: 41, protein_per_100g: 0.9, carbs_per_100g: 10, fat_per_100g: 0.2 },
  { name: 'Abobrinha', category: 'Vegetal', calories_per_100g: 17, protein_per_100g: 1.2, carbs_per_100g: 3.1, fat_per_100g: 0.3 },
  { name: 'Pepino', category: 'Vegetal', calories_per_100g: 15, protein_per_100g: 0.7, carbs_per_100g: 3.6, fat_per_100g: 0.1 },
  { name: 'Cebola', category: 'Vegetal', calories_per_100g: 40, protein_per_100g: 1.1, carbs_per_100g: 9.3, fat_per_100g: 0.1 },
  
  // Frutas
  { name: 'Banana', category: 'Fruta', calories_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 22.8, fat_per_100g: 0.3 },
  { name: 'Maçã', category: 'Fruta', calories_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 14, fat_per_100g: 0.2 },
  { name: 'Laranja', category: 'Fruta', calories_per_100g: 47, protein_per_100g: 0.9, carbs_per_100g: 12, fat_per_100g: 0.1 },
  { name: 'Morango', category: 'Fruta', calories_per_100g: 32, protein_per_100g: 0.7, carbs_per_100g: 7.7, fat_per_100g: 0.3 },
  { name: 'Abacaxi', category: 'Fruta', calories_per_100g: 50, protein_per_100g: 0.5, carbs_per_100g: 13, fat_per_100g: 0.1 }
];

const initFoodData = async () => {
  try {
    await db.sequelize.authenticate();
    logger.info('Conexão com o banco de dados estabelecida com sucesso.');
    
    // Verifica se já existem alimentos no banco
    const count = await Food.count();
    if (count > 0) {
      logger.info(`Já existem ${count} alimentos no banco de dados. Pulando inicialização.`);
      process.exit(0);
    }
    
    // Inserir alimentos
    await Food.bulkCreate(foods);
    
    logger.info(`${foods.length} alimentos foram inseridos com sucesso.`);
    process.exit(0);
  } catch (error) {
    logger.error('Erro ao inicializar dados de alimentos:', error);
    process.exit(1);
  }
};

initFoodData();