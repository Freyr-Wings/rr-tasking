module.exports = app => {
    const tasks = require("../controllers/task.controller");

    var router = require("express").Router();

    router.post("/", tasks.create);

    router.get("/", tasks.findAll);

    router.put("/", tasks.addAssignee);

    app.use("/api/tasks", router);
};