module.exports = app => {
    const projects = require("../controllers/project.controller");

    var router = require("express").Router();

    router.post("/", projects.create);

    router.get("/", projects.findAll);

    router.put("/", projects.addTasks);

    app.use("/api/projects", router);
};