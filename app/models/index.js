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

// db.users.hasMany(db.projects, { as: "projects" })
db.projects.belongsTo(db.users, {
    as: "assigner",
    foreignKey: "user_id",
})

db.projects.hasMany(db.tasks, { 
    as: "tasks",
    foreignKey: "project_id"
})
db.tasks.belongsTo(db.projects, {
    as: "project",
    foreignKey: "project_id"
})

db.users.hasMany(db.tasks, { 
    as: "tasks",
    foreignKey: {
        name: "user_id",
        allowNull: false,
    },
})
db.tasks.belongsTo(db.users, {
    as: "assigner",
    foreignKey: {
        name: "user_id",
        allowNull: false,
    },
    onDelete: 'CASCADE'
})

db.users.belongsToMany(db.tasks, { 
    as: "assignments",
    through: "users_tasks",
    foreignKey: "user_id"
})

db.tasks.belongsToMany(db.users, {
    as: "assignees", 
    through: "users_tasks",
    foreignKey: "task_id"
})

module.exports = db;