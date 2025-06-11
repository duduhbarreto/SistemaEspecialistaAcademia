module.exports = (sequelize, Sequelize) => {
    const Exercise = sequelize.define("exercise", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      difficulty_level: {
        type: Sequelize.ENUM,
        values: ['Fácil', 'Médio', 'Difícil'],
        allowNull: false
      },
      equipment_required: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    });
  
    return Exercise;
  };