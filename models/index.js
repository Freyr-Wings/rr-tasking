const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./user.model.js")(sequelize, Sequelize);
db.projects = require("./project.model.js")(sequelize, Sequelize);
db.tasks = require("./task.model.js")(sequelize, Sequelize);

db.users.hasMany(db.projects, {as: "projects"})
db.projects.belongsTo(db.users, {
    foreignKey: "userId",
    as: "assigner"
})

db.projects.hasMany(db.tasks, {as: "tasks"})
db.tasks.belongsTo(db.projects, {
    foreignKey: "projectId",
    as: "project"
})

module.exports = db;