let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();

chai.use(chaiHttp);
var host = 'http://localhost:9067';

describe('Basic function', function () {
    describe('User', function () {
        it('POST /api/users', function (done) {
            chai.request(host)
                .post('/api/users')
                .set('Content-Type', 'application/json')
                .send({
                    email: "23324@266.com",
                    name: "freyr",
                    surname: "wings"
                })
                .end(function (err, res) {
                    console.log(res.body);
                    res.should.have.status(200);
                    done();
                });
        });

        it('GET /api/users', function (done) {
            chai.request(host)
                .get("/api/users")
                .end(function (err, res) {
                    console.log(res.body);
                    res.should.have.status(200);
                    done();
                });
        });

    });
    describe('Task', function () {
        it('POST /api/tasks', function (done) {
            chai.request(host)
                .post('/api/tasks')
                .set('Content-Type', 'application/json')
                .send({
                    name: "task1",
                    description: "do sth1...",
                    score: 5,
                    status: "active",
                    user_id: 1
                })
                .end(function (err, res) {
                    console.log(res.body);
                    res.should.have.status(200);

                    // expect(body).to.equal('Hello World');
                    done();
                });
        });
        it('GET /api/tasks', function (done) {
            chai.request(host)
                .get("/api/tasks")
                .end(function (err, res) {
                    console.log(res.body);
                    res.should.have.status(200);
                    done();
                });
        });
        it('PUT /api/tasks', function (done) {
            chai.request(host)
                .put("/api/tasks")
                .set('Content-Type', 'application/json')
                .send({
                    user_id: 1,
                    task_id: 1
                })
                .end(function (err, res) {
                    console.log(res.body);
                    res.should.have.status(200);
                    done();
                });
        });
    });
});