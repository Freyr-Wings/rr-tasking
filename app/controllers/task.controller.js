// API endpoints:
// GET /API/users - responds with a list of users. One must be able to filter by name and surname. The response must contain the list itself and 
//     additional information required for client-side pagination.
// GET /API/tasks - responds with a list of tasks. One must be able to filter by name, description, status array (boolean OR operation filter), 
//     name/surname of the assigner, name/surname/id of the assignee(s) and by score. Example: you must be able to fetch all tasks, 
//     the assignees of which are User1, User2, User3, with either ”inactive” or ”declined” status, with the score no less than 4. 
//     The response must contain the list itself and additional information required for client-side pagination.
// GET /API/projects - responds with a list of users. One must be able to filter by name, description of the project, status array (boolean OR operation filter), 
//     name/surname of the assigner, name/surname/id of the assignee(s), and by the score of the tasks.
//  Example: you must be able to fetch all projects, the assignees of which have ids: [1,2,3], with either ”inactive” or ”declined” status, 
//      where all tasks of the projects have the score no less than 4. The response must contain the list itself, additional information required for 
//      client-side pagination, and the average score of all completed tasks of the project.
// POST /API/tasks - creates a task
// POST /API/projects - creates a project
// POST /API/users - creates a user

const db = require("../models");
const Task = db.tasks;
const User = db.users;
const Op = db.Sequelize.Op;
const paging = require("./paging.js")

exports.findAll = async (req, res) => {
    var condition = null;
    try {
        const data = await Task.findAll({ where: condition });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while adding assignee."
        });
    }
};

// Create and Save a new Task
exports.create = async (req, res) => {
    const user = await User.findByPk(req.body.user_id);
    if (!user) {
        res.status(400).send({
            message: "User not found!"
        });
        return;
    }
    // Create a Task
    const task = {
        name: req.body.name,
        description: req.body.description,
        score: req.body.score,
        status: req.body.status,
        user_id: req.body.user_id
    };

    // Save Task in the database
    try {
        const data = await Task.create(task);
        res.send(data);
    } catch (err) {
        if (err instanceof db.Sequelize.BaseError) {
            res.status(400).send({
                message: err.message
            });
        } else {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Task."
            });
        }
    }
};

exports.addAssignee = async (req, res) => {
    const [task, user] = await Promise.all([
        Task.findByPk(req.body.task_id),
        User.findByPk(req.body.user_id)
    ]);
    if (!task) {
        res.status(400).send({
            message: "Task not found!"
        });
        return;
    }
    if (!user) {
        res.status(400).send({
            message: "User not found!"
        });
        return;
    }

    try {
        const assign = await task.addAssignee(user);
        res.send(assign);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while adding assignee."
        });
    }
};