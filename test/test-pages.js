let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();

chai.use(chaiHttp);
const host = 'http://localhost:9067';
const numUser = 10;
const numTask = 20;

describe('Basic function', function () {
    describe('User', function () {
        it('POST /api/users', async function () {
            let promises = [];
            for (let i = 0; i < numUser; i++) {
                const id = i + 1;
                promises.push(chai.request(host)
                .post('/api/users')
                .set('Content-Type', 'application/json')
                .send({
                    email: "tom" + id.toString().padStart(3, "0") + "@cats.com",
                    name: "tom" + id.toString().padStart(3, "0"),
                    surname: "cat"
                }));
            }
            const results = await Promise.all(promises);
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
            let promises = [];
            for (let i = 1; i <= numTask; i++) {
                promises.push(chai.request(host)
                .post('/api/tasks')
                .set('Content-Type', 'application/json')
                .send({
                    name: "task" + i.toString().padStart(3, "0"),
                    description: "do sth No." + i.toString().padStart(3, "0") + "...",
                    score: Math.trunc(i / 4),
                    status: i % 2 == 0 ? "active" : "inactive",
                    user_id: Math.trunc((i-1) / (numTask/numUser)) + 1,
                }));
            }
            const results = await Promise.all(promises);
            for (let i = 0; i < numTask; i++) {
                // console.log(results[i].body);
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
            // .set('Content-Type', 'application/json')
            .query({
                name: "5",
            });
            // console.log(res.body);
            res.should.have.status(200);
            res.body.should.have.property('items');
            res.body.items.should.have.length(2);
        });

        it('GET /api/tasks?assignees_name', async function () {
            const res = await chai.request(host)
            .get("/api/tasks")
            // .set('Content-Type', 'application/json')
            .query({
                page: 0,
                size: 15,
                assignees_name: "tom004",
            });
            // console.log(res.body);
            res.should.have.status(200);
            console.log(res.body);
            res.body.should.have.property('items');
            res.body.items.should.have.length(4);
        });

        it('GET /api/tasks?assigner_name', async function () {
            const res = await chai.request(host)
            .get("/api/tasks")
            // .set('Content-Type', 'application/json')
            .query({
                page: 0,
                size: 15,
                assigner_name: "tom006",
            });
            // console.log(res.body);
            res.should.have.status(200);
            res.body.should.have.property('items');
            res.body.items.should.have.length(2);
        });

        it('GET /api/tasks?assignees_ids', async function () {
            const res = await chai.request(host)
            .get("/api/tasks")
            // .set('Content-Type', 'application/json')
            .query({
                page: 0,
                size: 15,
                assignees_ids: [2,4,6,8],
            });
            // console.log(res.body);
            res.should.have.status(200);
            res.body.should.have.property('items');
            res.body.items.should.have.length(8);
        });

        it('GET /api/tasks?status', async function () {
            const res = await chai.request(host)
            .get("/api/tasks")
            // .set('Content-Type', 'application/json')
            .query({
                page: 0,
                size: 15,
                status: ['active'],
            });
            // console.log(res.body);
            res.should.have.status(200);
            res.body.should.have.property('items');
            res.body.items.should.have.length(10);
        });

        it('GET /api/tasks?score', async function () {
            const res = await chai.request(host)
            .get("/api/tasks")
            // .set('Content-Type', 'application/json')
            .query({
                page: 0,
                size: 15,
                score_least: 4,
            });
            // console.log(res.body);
            res.should.have.status(200);
            res.body.should.have.property('items');
            res.body.items.should.have.length(5);
        });
    });
});