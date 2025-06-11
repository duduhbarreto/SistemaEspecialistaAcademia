module.exports = (sequelize, Sequelize) => {
    const Workout = sequelize.define("workout", {
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
      goal: {
        type: Sequelize.ENUM,
        values: ['Perda de peso', 'Hipertrofia', 'Condicionamento', 'Definição', 'Reabilitação'],
        allowNull: false
      },
      experience_level: {
        type: Sequelize.ENUM,
        values: ['Iniciante', 'Intermediário', 'Avançado'],
        allowNull: false
      },
      estimated_duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 0
        }
      }
    });
  
    return Workout;
  };