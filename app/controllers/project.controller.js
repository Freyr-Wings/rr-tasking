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
// POST /API/tasks - creates a project
// POST /API/projects - creates a project
// POST /API/users - creates a user

const db = require("../models");
const Project = db.projects;
const User = db.users;
const Task = db.tasks;
const Op = db.Sequelize.Op;
const paging = require("./paging.js")

// Retrieve projects with or withouout conditions
exports.findAll = async (req, res) => {
    // Collect conditions for project
    const { name, body, status } = req.query;
    console.log(req.query);
    let project_condition = name || body || status ? {} : null;
    if (name) {
        project_condition["name"] = { [Op.like]: `%${name}%` };
    }
    if (body) {
        project_condition["body"] = { [Op.like]: `%${body}%` };
    }
    if (status) {
        project_condition["status"] = { [Op.in]: status instanceof Array ? status : [status] };
    }

    // Collect conditions for tasks
    const { score_least } = req.query;
    let task_condition = score_least ? {} : null;
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
    const { assigner_name, assigner_surname } = req.query;
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

    // Retrieve projects from database
    try {
        const data = await Project.findAndCountAll({ 
            where: project_condition,
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
            },{
                model: Task,
                as: "tasks",
                where: task_condition,
                attributes: ["id", "name"],
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

// Create and Save a new Project
exports.create = async (req, res) => {
    const user = await User.findByPk(req.body.user_id);
    if (!user) {
        res.status(400).send({
            message: "User not found!"
        });
        return;
    }
    // Create a Project
    const project = {
        name: req.body.name,
        body: req.body.body,
        status: req.body.status,
        user_id: req.body.user_id
    };

    // Save Project in the database
    try {
        const data = await Project.create(project);
        res.send(data);
    } catch (err) {
        if (err instanceof db.Sequelize.BaseError) {
            res.status(400).send({
                message: err.message
            });
        } else {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Project."
            });
        }
    }
};

// Add tasks to project
exports.addTasks = async (req, res) => {
    // Find project and task by id
    const [project, task] = await Promise.all([
        Project.findByPk(req.body.project_id),
        Task.findByPk(req.body.task_id)
    ]);
    if (!project) {
        res.status(400).send({
            message: "Project not found!"
        });
        return;
    }
    if (!task) {
        res.status(400).send({
            message: "Task not found!"
        });
        return;
    }

    try {
        const assign = await project.addTasks(task);
        res.send(assign);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while adding tasks."
        });
    }
};