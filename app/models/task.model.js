module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define("task", {
        name: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.TEXT
        },
        score: {
            type: DataTypes.INTEGER
        },
        status: {
            type: DataTypes.ENUM,
            values: ['active', 'inactive', 'declined', 'completed']
        }
    });

    return Task;
};