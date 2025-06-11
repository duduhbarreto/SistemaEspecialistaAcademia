module.exports = (sequelize, Sequelize) => {
  const DietRestriction = sequelize.define("diet_restriction", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    restriction_type: {
      type: Sequelize.ENUM,
      values: ['Alergia', 'Intolerância', 'Preferência', 'Dieta'],
      allowNull: false
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false
    }
  });

  return DietRestriction;
};