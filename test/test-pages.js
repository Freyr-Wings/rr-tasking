let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();

chai.use(chaiHttp);
const host = 'http://localhost:9067';
const numUser = 10;
const numTask = 30;
const numProject = 10;

describe('Basic function', function () {
    describe('User', function () {
        it('POST /api/users', async function () {
            let results = [];
            for (let i = 0; i < numUser; i++) {
                // await one by one to match this id with the exact id in database
                const id = i + 1;
                results.push(await chai.request(host)
                    .post('/api/users')
                    .set('Content-Type', 'application/json')
                    .send({
                        email: "tom" + id.toString().padStart(3, "0") + "@cats.com",
                        name: "tom" + id.toString().padStart(3, "0"),
                        surname: "cat"
                    }));
            }
            for (let i = 0; i < numUser; i++) {
                results[i].should.have.status(200);
            }
        });

        it('GET /api/users', async function () {
            const res = await chai.request(host).get("/api/users?page=0&size=10");
            res.should.have.status(200);
            res.body.should.have.property('items');
            res.body.items.should.have.length(numUser);
        });
    });
    describe('Task', function () {
        it('POST /api/tasks', async function () {
            let results = [];
            for (let i = 1; i <= numTask; i++) {
                results.push(await chai.request(host)
                    .post('/api/tasks')
                    .set('Content-Type', 'application/json')
                    .send({
                        name: "task" + i.toString().padStart(3, "0"),
                        description: "do sth No." + i.toString().padStart(3, "0") + "...",
                        score: Math.trunc(i / 4),
                        status: i % 2 == 0 ? "active" : "inactive",
                        user_id: Math.trunc((i - 1) / (numTask / numUser)) + 1,
                    }));
            }
            for (let i = 0; i < numTask; i++) {
                results[i].should.have.status(200);
            }
        });

        it('PUT /api/tasks', async function () {
            let promises = [];
            for (let i = 1; i <= numUser; i++) {
                for (let j = 1; j <= i; j++) {
                    const user_id = i, task_id = j;
                    promises.push(chai.request(host)
                        .put('/api/tasks')
                        .set('Content-Type', 'application/json')
                        .send({
                            user_id,
                            task_id,
                        }));
                }

            }
            const results = await Promise.all(promises);
            for (let i = 0; i < promises.length; i++) {
                results[i].should.have.status(200);
            }
        });

        it('GET /api/tasks', async function () {
            const res = await chai.request(host).get("/api/tasks");
            res.should.have.status(200);
        });

        it('GET /api/tasks?name', async function () {
            const res = await chai.request(host)
                .get("/api/tasks")
                .query({
                    name: "5",
                });
            res.should.have.status(200);
            res.body.should.have.property('items');
            res.body.items.should.have.length(3);
        });

        it('GET /api/tasks?assignees_name', async function () {
            const res = await chai.request(host)
                .get("/api/tasks")
                .query({
                    page: 0,
                    size: 20,
                    assignees_name: "tom006",
                });
            res.should.have.status(200);
            res.body.should.have.property('items');
            res.body.items.should.have.length(6);
        });

        it('GET /api/tasks?assigner_name', async function () {
            const res = await chai.request(host)
                .get("/api/tasks")
                .query({
                    page: 0,
                    size: 20,
                    assigner_name: "tom006",
                });
            res.should.have.status(200);
            res.body.should.have.property('items');
            res.body.items.should.have.length(3);
        });

        it('GET /api/tasks?assignees_ids', async function () {
            const res = await chai.request(host)
                .get("/api/tasks")
                .query({
                    page: 0,
                    size: 20,
                    assignees_ids: [2, 4, 6, 8],
                });
            res.should.have.status(200);
            res.body.should.have.property('items');
            res.body.items.should.have.length(8);
        });

        it('GET /api/tasks?status', async function () {
            const res = await chai.request(host)
                .get("/api/tasks")
                .query({
                    page: 0,
                    size: 20,
                    status: ['active'],
                });
            res.should.have.status(200);
            res.body.should.have.property('items');
            res.body.items.should.have.length(15);
        });

        it('GET /api/tasks?score', async function () {
            const res = await chai.request(host)
                .get("/api/tasks")
                .query({
                    page: 0,
                    size: 20,
                    score_least: 4,
                });
            res.should.have.status(200);
            res.body.should.have.property('items');
            res.body.items.should.have.length(15);
        });
    });

    describe('Project', function () {
        it('POST /api/projects', async function () {
            let results = [];
            for (let i = 1; i <= numProject; i++) {
                results.push(await chai.request(host)
                    .post('/api/projects')
                    .set('Content-Type', 'application/json')
                    .send({
                        name: "project" + i.toString().padStart(3, "0"),
                        body: "this is project No." + i.toString().padStart(3, "0") + "...",
                        status: i % 2 == 0 ? "active" : "inactive",
                        user_id: Math.trunc((i - 1) / (numProject / numUser)) + 1,
                    }));
            }
            for (let i = 0; i < numProject; i++) {
                results[i].should.have.status(200);
            }
        });

        it('PUT /api/projects', async function () {
            let promises = [];
            for (let i = 1; i <= numTask; i++) {
                const task_id = i, project_id = Math.trunc((i - 1) / (numTask / numProject) + 1);
                promises.push(chai.request(host)
                    .put('/api/projects')
                    .set('Content-Type', 'application/json')
                    .send({
                        project_id,
                        task_id,
                    }));
            }
            const results = await Promise.all(promises);
            for (let i = 0; i < promises.length; i++) {
                results[i].should.have.status(200);
            }
        });

        it('GET /api/projects', async function () {
            const res = await chai.request(host).get("/api/projects");
            res.should.have.status(200);
        });

        it('GET /api/projects?score', async function () {
            const res = await chai.request(host)
                .get("/api/projects")
                .query({
                    page: 0,
                    size: 20,
                    score_least: 4,
                });
            res.should.have.status(200);
            res.body.should.have.property('items');
            res.body.items.should.have.length(5);
        });
    });
});