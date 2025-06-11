module.exports = (sequelize, Sequelize) => {
    const MuscleGroup = sequelize.define("muscle_group", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      }
    });
  
    return MuscleGroup;
  };