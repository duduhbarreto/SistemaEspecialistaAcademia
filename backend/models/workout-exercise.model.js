module.exports = (sequelize, Sequelize) => {
  const WorkoutExercise = sequelize.define("workout_exercise", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    workout_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    exercise_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    sets: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    repetitions: {
      type: Sequelize.STRING,
      allowNull: false
    },
    rest_time: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: 'Rest time in seconds'
    }
  });

  return WorkoutExercise;
};
