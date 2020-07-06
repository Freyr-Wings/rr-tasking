module.exports = (sequelize, DataTypes) => {
    const Project = sequelize.define("Project", {
        name: {
            type: DataTypes.STRING
        },
        body: {
            type: DataTypes.TEXT
        },
        status: {
            type: DataTypes.ENUM,
            values: ['active', 'inactive', 'declined', 'completed']
        }
    });

    return Project;
};