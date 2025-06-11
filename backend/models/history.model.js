module.exports = (sequelize, Sequelize) => {
    const WorkoutHistory = sequelize.define("workout_history", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      workout_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      workout_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      feedback: {
        type: Sequelize.ENUM,
        values: ['Muito fácil', 'Adequado', 'Difícil', 'Muito difícil'],
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });
  
    return WorkoutHistory;
  };