var chai = require('chai');
var mongoose = require("mongoose");
var chaiHttp = require('chai-http');
var server = require('../app');
var User = require('../server/models/user');
var Collection = require('../server/models/collection');
var should = chai.should();

const signup_url = "/signup";
const login_url = "/login";
const add_interest_url = "/user/addInterest";
const get_interest_url = "/user/downloadInterest";
const add_collection_url = "/user/addCollection";
const get_collection_url = "/user/downloadCollection";


// Using chai
chai.use(chaiHttp);

describe("\n\nIn the controllers/user.js", () => {

    let validUser = {
        email: 'jose@gmail.com',
        password: '123',
        age: 50
    }

    let invalidUser = {
        email: 'nonexistent@gmail.com',
        password: '123',
        age: 50
    }

    // Remove if user exists
    User.findOne({ email: validUser.email }).then(function(user, err) {
        if (user) {
            user.remove()
        }
    });

    // Remove if collection exists on user
    Collection.findOne({ email: validUser.email }).then(function(collection, err) {
        if (collection) {
            collection.remove()
        }
    });

    // Sign up TEST
    describe("POST /signup", () => {

        it("non-existent user should return success true", (done) => {
            chai.request(server)
                .post(signup_url)
                .send(validUser)
                .end((error, response) => {
                    response.should.have.status(200);
                    response.body.should.have.property('success').eql(true);
                    response.body.should.have.property('id');
                    done();
            });
        });

        it("existent user should return error", (done) => {
            chai.request(server)
                .post(signup_url)
                .send(validUser)
                .end((error, response) => {
                    response.should.have.status(200);
                    response.body.should.have.property('success').eql(false);
                    response.body.should.have.property('error');
                    done();
            });
        });
    });

    // Login TEST
    describe("POST /login", () => {

        it("should return status code 200", (done) => {
            chai.request(server)
                .post(login_url)
                .send(validUser)
                .end((error, response) => {
                    response.should.have.status(200);
                done();
            });
        });

        it("existent user should return a valid token", (done) => {
            chai.request(server)
                .post(login_url)
                .send(validUser)
                .end((error, response) => {
                    response.body.success.should.be.eql(true);
                    response.body.should.have.property('id');
                    response.body.should.have.property('token');
                done();
            });
        });

        it("inexistent user should return a user not found", (done) => {
            chai.request(server)
                .post(login_url)
                .send(invalidUser)
                .end((error, response) => {
                    response.body.success.should.be.eql(false);
                    response.body.message.should.be.a('String');
                    done();
                });
        });
    });

    // Add an interest to user TEST
    describe("PUT /user/addInterest", () => {

        it("should return interests added successfully", (done) => {
            chai.request(server)
                .post(login_url)
                .send(validUser)
                .end((error, response) => {
                    let token = response.body.token;
                    let interest = {
                        token: token,
                        interests: ['surf', 'fishing']
                    };

                    // PUT /addInterest
                    chai.request(server)
                        .put(add_interest_url)
                        .send(interest)
                        .end((error, response) => {
                            response.should.have.status(200);
                            response.body.should.have.property('success').eql(true);
                    });

                    done();
                });
        });
    });

    // Get interests from user
    describe("GET /user/downloadInterest", () => {

        it("should return interests successfully", (done) => {
            chai.request(server)
                .post(login_url)
                .send(validUser)
                .end((error, response) => {
                    let token = response.body.token;

                    // GET /user/downloadInterest
                    chai.request(server)
                        .get(get_interest_url)
                        .set('x-access-token', token) // Set header
                        .end((error, response) => {
                            response.should.have.status(200);
                            response.body.should.have.property('success').eql(true);
                            response.body.should.have.property('interests').eql(['surf,fishing']);
                        });

                    done();
                });
        });
    });

    // Add a collection of photos to user TEST
    describe("POST /user/addCollection", () => {

        it("should return collection added successfully", (done) => {
            chai.request(server)
                .post(login_url)
                .send(validUser)
                .end((error, response) => {
                    let token = response.body.token;

                    let collection = {
                        token: token,
                        email: validUser.email,
                        name: "collection guay",
                        images: [
                            "imgID1",
                            "imgID2"
                        ],
                        description: "Super guay"
                    };

                    // GET /user/downloadInterest
                    chai.request(server)
                        .post(add_collection_url)
                        .send(collection)
                        .end((error, response) => {
                            response.should.have.status(200);
                            response.body.should.have.property('success').eql(true);
                            response.body.should.have.property('id');
                        });

                    done();
                });
        });
    });

    // Get collections from user
    describe("GET /user/downloadCollections", () => {

        it("should return interests successfully", (done) => {
            chai.request(server)
                .post(login_url)
                .send(validUser)
                .end((error, response) => {
                    let token = response.body.token;

                    let collections = [{
                        token: token,
                        email: validUser.email,
                        name: "collection guay",
                        images: [
                            "imgID1",
                            "imgID2"
                        ],
                        description: "Super guay"
                    }];

                    // GET /user/downloadInterest
                    chai.request(server)
                        .get(get_collection_url)
                        .set('x-access-token', token) // Set header
                        .end((error, response) => {
                            response.should.have.status(200);
                            response.body.eql(collections);
                        });

                    done();
                });
        });
    });
});