module.exports = (sequelize, Sequelize) => {
    const Task = sequelize.define("Task", {
        name: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.TEXT
        },
        score: {
            type: Sequelize.INTEGER
        },
        status: {
            type: Sequelize.ENUM,
            values: ['active', 'inactive', 'declined', 'completed']
        }
    });

    return Task;
};