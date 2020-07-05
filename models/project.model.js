module.exports = (sequelize, Sequelize) => {
    const Project = sequelize.define("Project", {
        name: {
            type: Sequelize.STRING
        },
        body: {
            type: Sequelize.TEXT
        },
        status: {
            type: Sequelize.ENUM,
            values: ['active', 'inactive', 'declined', 'completed']
        }
    });

    return Project;
};