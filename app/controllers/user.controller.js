// API endpoints:
// GET /API/users - responds with a list of users. One must be able to filter by name and surname. The response must contain the list itself and additional information required for client-side pagination.
// GET /API/tasks - responds with a list of tasks. One must be able to filter by name, description, status array (boolean OR operation filter), name/surname of the assigner, name/surname/id of the assignee(s) and by score. Example: you must be able to fetch all tasks, the assignees of which are User1, User2, User3, with either ”inactive” or ”declined” status, with the score no less than 4. The response must contain the list itself and additional information required for client-side pagination.
// GET /API/projects - responds with a list of users. One must be able to filter by name, description of the project, status array (boolean OR operation filter), name/surname of the assigner, name/surname/id of the assignee(s), and by the score of the tasks.
//  Example: you must be able to fetch all projects, the assignees of which have ids: [1,2,3], with either ”inactive” or ”declined” status, where all tasks of the projects have the score no less than 4. The response must contain the list itself, additional information required for client-side pagination, and the average score of all completed tasks of the project.
// POST /API/tasks - creates a task
// POST /API/projects - creates a project
// POST /API/users - creates a user

const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;
const paging = require("./paging")

// Retrieve all Users from the database.
exports.findAll = async (req, res) => {
    const { page, size, name, surname } = req.query;

    var condition = name || surname ? {} : null;
    if (name) {
        condition["name"] = { [Op.like]: `%${name}%` };
    }
    if (surname) {
        condition["surname"] = { [Op.like]: `%${surname}%` };
    }
    const { limit, offset } = paging.getPagination(page, size);

    try {
        const data = await User.findAndCountAll({ where: condition, limit, offset });
        const response = paging.getPagingData(data, page, limit);
        res.send(response);
    } catch (err) {
        if (err instanceof db.Sequelize.BaseError) {
            res.status(400).send({
                message: err.message
            });
        } else {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving the User."
            });
        }
    }
};

// Create and Save a new User
exports.create = async (req, res) => {
    // Create a user
    const user = {
        email: req.body.email,
        name: req.body.name,
        surname: req.body.surname
    };

    // Save user in the database
    try {
        const data = await User.create(user);
        res.send(data);
    } catch (err) {
        if (err instanceof db.Sequelize.ValidationError) {
            res.status(422).send({
                message: err.message
            });
        } else if (err instanceof db.Sequelize.BaseError) {
            res.status(400).send({
                message: err.message
            });
        } else {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the User."
            });
        }
    }
};
