// backend/migrate-diet-table.js - VERSÃO CORRIGIDA
require('dotenv').config();
const db = require('./models');
const logger = require('./utils/logger');

const migrateDietTable = async () => {
  try {
    logger.info('Iniciando migração da tabela de dietas...');
    
    // Conectar ao banco
    await db.sequelize.authenticate();
    logger.info('Conexão com banco estabelecida com sucesso');
    
    // Função para verificar se coluna existe
    const columnExists = async (tableName, columnName) => {
      try {
        const result = await db.sequelize.query(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
          {
            replacements: [db.sequelize.config.database, tableName, columnName],
            type: db.sequelize.QueryTypes.SELECT
          }
        );
        return result.length > 0;
      } catch (error) {
        logger.error(`Erro ao verificar coluna ${columnName}:`, error);
        return false;
      }
    };

    // Definir as migrações com verificação
    const migrations = [
      {
        column: 'maintenance_calories',
        sql: `ALTER TABLE diets ADD COLUMN maintenance_calories INT DEFAULT NULL COMMENT 'Calorias de manutenção calculadas'`
      },
      {
        column: 'caloric_adjustment',
        sql: `ALTER TABLE diets ADD COLUMN caloric_adjustment INT DEFAULT NULL COMMENT 'Ajuste calórico aplicado (+/- para bulk/cut)'`
      },
      {
        column: 'strategy',
        sql: `ALTER TABLE diets ADD COLUMN strategy VARCHAR(255) DEFAULT NULL COMMENT 'Estratégia aplicada (ex: Lean Bulk, Cutting Moderado)'`
      },
      {
        column: 'strategy_description',
        sql: `ALTER TABLE diets ADD COLUMN strategy_description TEXT DEFAULT NULL COMMENT 'Descrição detalhada da estratégia'`
      },
      {
        column: 'weekly_weight_change',
        sql: `ALTER TABLE diets ADD COLUMN weekly_weight_change FLOAT DEFAULT NULL COMMENT 'Mudança de peso esperada por semana em kg'`
      },
      {
        column: 'bmi',
        sql: `ALTER TABLE diets ADD COLUMN bmi FLOAT DEFAULT NULL COMMENT 'IMC calculado'`
      },
      {
        column: 'bmi_category',
        sql: `ALTER TABLE diets ADD COLUMN bmi_category ENUM('underweight', 'normal', 'overweight', 'obese') DEFAULT NULL COMMENT 'Categoria do IMC'`
      }
    ];
    
    // Executar cada migração com verificação
    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i];
      
      try {
        // Verificar se a coluna já existe
        const exists = await columnExists('diets', migration.column);
        
        if (exists) {
          logger.info(`Coluna '${migration.column}' já existe - pulando migração ${i + 1}/${migrations.length}`);
          continue;
        }
        
        // Executar a migração
        await db.sequelize.query(migration.sql);
        logger.info(`✅ Migração ${i + 1}/${migrations.length} executada com sucesso: ${migration.column}`);
        
      } catch (error) {
        if (error.message.includes('Duplicate column name')) {
          logger.info(`Coluna '${migration.column}' já existe - ignorando erro`);
        } else {
          logger.error(`❌ Erro na migração da coluna '${migration.column}':`, error.message);
          throw error;
        }
      }
    }
    
    // Sincronizar modelos (sem force para não perder dados)
    try {
      await db.sequelize.sync({ alter: true });
      logger.info('✅ Sincronização de modelos concluída');
    } catch (syncError) {
      logger.warn('⚠️ Aviso na sincronização (pode ser normal):', syncError.message);
    }
    
    // Verificar estrutura final da tabela
    try {
      const tableStructure = await db.sequelize.query(
        `DESCRIBE diets`,
        { type: db.sequelize.QueryTypes.SELECT }
      );
      
      const newColumns = tableStructure.filter(col => 
        ['maintenance_calories', 'caloric_adjustment', 'strategy', 'strategy_description', 
         'weekly_weight_change', 'bmi', 'bmi_category'].includes(col.Field)
      );
      
      logger.info(`✅ Estrutura da tabela atualizada! Novas colunas encontradas: ${newColumns.length}`);
      newColumns.forEach(col => {
        logger.info(`   - ${col.Field}: ${col.Type}`);
      });
      
    } catch (error) {
      logger.warn('⚠️ Não foi possível verificar a estrutura final da tabela');
    }
    
    logger.info('🎉 Migração da tabela de dietas concluída com sucesso!');
    
    // Verificar se existem dietas para atualizar
    const existingDiets = await db.diet.findAll();
    logger.info(`📊 Encontradas ${existingDiets.length} dietas existentes`);
    
    if (existingDiets.length > 0) {
      logger.info('💡 IMPORTANTE: As dietas existentes precisarão ser recalculadas para usar as novas funcionalidades');
      logger.info('   👉 Os usuários devem usar o botão "Recalcular Dieta" na interface');
      logger.info('   👉 Ou usar a opção "Calcular Dieta" se ainda não possuem uma');
    }
    
    logger.info('✅ Sistema de Dieta Inteligente está pronto para uso!');
    process.exit(0);
    
  } catch (error) {
    logger.error('❌ Erro durante a migração:', error);
    
    // Mensagens de erro específicas
    if (error.name === 'SequelizeConnectionRefusedError') {
      logger.error('🔌 O servidor MySQL não está em execução ou a conexão foi recusada.');
      logger.error('   👉 Verifique se o MySQL está rodando');
      logger.error('   👉 Verifique as configurações no arquivo .env');
    } else if (error.name === 'SequelizeAccessDeniedError') {
      logger.error('🔒 Acesso negado ao banco de dados.');
      logger.error('   👉 Verifique as credenciais no arquivo .env');
      logger.error('   👉 Verifique se o usuário tem permissões para alterar tabelas');
    } else if (error.name === 'SequelizeDatabaseError') {
      logger.error('💾 Erro de banco de dados:', error.message);
      logger.error('   👉 Verifique se o banco de dados existe');
      logger.error('   👉 Verifique se a tabela "diets" existe');
    } else {
      logger.error('❓ Erro desconhecido:', error.message);
    }
    
    logger.error('');
    logger.error('🆘 Para resolver:');
    logger.error('   1. Verifique se o MySQL está rodando');
    logger.error('   2. Verifique as configurações do .env');
    logger.error('   3. Execute: npm run init-db (se necessário)');
    logger.error('   4. Tente novamente: node migrate-diet-table.js');
    
    process.exit(1);
  }
};

// Função para verificar pré-requisitos
const checkPrerequisites = async () => {
  try {
    // Verificar se a tabela diets existe
    const tables = await db.sequelize.query(
      `SHOW TABLES LIKE 'diets'`,
      { type: db.sequelize.QueryTypes.SELECT }
    );
    
    if (tables.length === 0) {
      logger.error('❌ Tabela "diets" não encontrada!');
      logger.error('   👉 Execute primeiro: npm run init-db');
      process.exit(1);
    }
    
    logger.info('✅ Pré-requisitos verificados');
    return true;
  } catch (error) {
    logger.error('❌ Erro ao verificar pré-requisitos:', error.message);
    process.exit(1);
  }
};

// Executar migração
const runMigration = async () => {
  logger.info('🚀 Iniciando Sistema de Migração de Dieta Inteligente...');
  await checkPrerequisites();
  await migrateDietTable();
};

runMigration();