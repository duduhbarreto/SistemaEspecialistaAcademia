module.exports = (sequelize, Sequelize) => {
  const Diet = sequelize.define("diet", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    activity_level: {
      type: Sequelize.ENUM,
      values: ['Sedentário', 'Levemente ativo', 'Moderadamente ativo', 'Muito ativo', 'Extremamente ativo'],
      allowNull: false
    },
    calories: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    maintenance_calories: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Calorias de manutenção calculadas'
    },
    caloric_adjustment: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Ajuste calórico aplicado (+/- para bulk/cut)'
    },
    strategy: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Estratégia aplicada (ex: Lean Bulk, Cutting Moderado)'
    },
    strategy_description: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Descrição detalhada da estratégia'
    },
    weekly_weight_change: {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: 'Mudança de peso esperada por semana em kg'
    },
    bmi: {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: 'IMC calculado'
    },
    bmi_category: {
      type: Sequelize.ENUM,
      values: ['underweight', 'normal', 'overweight', 'obese'],
      allowNull: true,
      comment: 'Categoria do IMC'
    },
    protein_g: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    carbs_g: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    fat_g: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    last_updated: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    }
  });

  return Diet;
};