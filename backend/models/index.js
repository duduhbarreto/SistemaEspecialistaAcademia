const dbConfig = require('../config/db.config.js');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: 0,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
db.user = require('./user.model.js')(sequelize, Sequelize);
db.exercise = require('./exercise.model.js')(sequelize, Sequelize);
db.muscleGroup = require('./muscle.model.js')(sequelize, Sequelize);
db.workout = require('./workout.model.js')(sequelize, Sequelize);
db.workoutExercise = require('./workout-exercise.model.js')(sequelize, Sequelize);
db.history = require('./history.model.js')(sequelize, Sequelize);

// Relationships

// Muscle Group and Exercise
db.muscleGroup.hasMany(db.exercise, { foreignKey: 'muscle_group_id' });
db.exercise.belongsTo(db.muscleGroup, { foreignKey: 'muscle_group_id' });

// Workout and Exercise (many-to-many)
db.workout.belongsToMany(db.exercise, { 
  through: db.workoutExercise,
  foreignKey: 'workout_id',
  otherKey: 'exercise_id'
});
db.exercise.belongsToMany(db.workout, { 
  through: db.workoutExercise,
  foreignKey: 'exercise_id',
  otherKey: 'workout_id'
});

// User and History
db.user.hasMany(db.history, { foreignKey: 'user_id' });
db.history.belongsTo(db.user, { foreignKey: 'user_id' });

// Workout and History
db.workout.hasMany(db.history, { foreignKey: 'workout_id' });
db.history.belongsTo(db.workout, { foreignKey: 'workout_id' });

db.diet = require('./diet.model.js')(sequelize, Sequelize);
db.dietRestriction = require('./diet_restriction.model.js')(sequelize, Sequelize);
db.food = require('./food.model.js')(sequelize, Sequelize);

db.user.hasOne(db.diet, { foreignKey: 'user_id' });
db.diet.belongsTo(db.user, { foreignKey: 'user_id' });

db.user.hasMany(db.dietRestriction, { foreignKey: 'user_id' });
db.dietRestriction.belongsTo(db.user, { foreignKey: 'user_id' });

db.diet = require('./diet.model.js')(sequelize, Sequelize);
db.dietRestriction = require('./diet_restriction.model.js')(sequelize, Sequelize);
db.food = require('./food.model.js')(sequelize, Sequelize);

db.user.hasOne(db.diet, { foreignKey: 'user_id' });
db.diet.belongsTo(db.user, { foreignKey: 'user_id' });

db.user.hasMany(db.dietRestriction, { foreignKey: 'user_id' });
db.dietRestriction.belongsTo(db.user, { foreignKey: 'user_id' });
module.exports = db;