module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
          max: 120
        }
      },
      weight: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          min: 0
        }
      },
      height: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          min: 0
        }
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
      }
    });
  
    return User;
  };