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

// Retrieve tasks with or withouout conditions
exports.findAll = async (req, res) => {
    // Collect conditions for task
    const { name, description, status, score_least } = req.query;
    console.log(req.query);
    let task_condition = name || description || status || score_least? {} : null;
    if (name) {
        task_condition["name"] = { [Op.like]: `%${name}%` };
    }
    if (description) {
        task_condition["description"] = { [Op.like]: `%${description}%` };
    }
    if (status) {
        task_condition["status"] = { [Op.in]: status instanceof Array ? status : [status] };
    }
    if (score_least) {
        task_condition["score"] = { [Op.gte]: score_least };
    }

    // Collect conditions for assignees
    const { assignees_name, assignees_surname, assignees_ids } = req.query;
    let assignees_condition = assignees_name || assignees_surname || assignees_ids? {} : null;
    if (assignees_name) {
        assignees_condition["name"] = { [Op.like]: `%${assignees_name}%` };
    }
    if (assignees_surname) {
        assignees_condition["surname"] = { [Op.like]: `%${assignees_surname}%` };
    }
    if (assignees_ids) {
        assignees_condition["id"] = { [Op.in]: assignees_ids instanceof Array ? assignees_ids : [assignees_ids] };
    }

    // Collect conditions for assigner
    const { assigner_name, assigner_surname, assigner_ids } = req.query;
    let assigner_condition = assigner_name || assigner_surname ? {} : null;
    if (assigner_name) {
        assigner_condition["name"] = { [Op.like]: `%${assigner_name}%` };
    }
    if (assigner_surname) {
        assigner_condition["surname"] = { [Op.like]: `%${assigner_surname}%` };
    }

    // Collect conditions for paging
    const { page, size } = req.query;
    const { limit, offset } = paging.getPagination(page, size);

    // Retrieve tasks from database
    try {
        const data = await Task.findAndCountAll({ 
            where: task_condition,
            include: [{
                model: User,
                as: "assignees",
                where: assignees_condition,
                through: {
                    attributes: []
                },
                attributes: ["id", "name"],
            },{
                model: User,
                as: "assigner",
                where: assigner_condition,
            }],
            order: [
                ['id', 'ASC'],
                ['name', 'ASC'],
            ],
            limit,
            offset,
            distinct: true
        });
        const response = paging.getPagingData(data, page, limit);
        // console.log(data);
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