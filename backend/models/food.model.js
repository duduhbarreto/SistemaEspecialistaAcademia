module.exports = (sequelize, Sequelize) => {
  const Food = sequelize.define("food", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    category: {
      type: Sequelize.ENUM,
      values: ['Proteína', 'Carboidrato', 'Gordura', 'Vegetal', 'Fruta', 'Laticínio', 'Outro'],
      allowNull: false
    },
    calories_per_100g: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    protein_per_100g: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    carbs_per_100g: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    fat_per_100g: {
      type: Sequelize.FLOAT,
      allowNull: false
    }
  });

  return Food;
};