/*jslint node: true */

var should = require('should');
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var bunyan = require('bunyan');
var config = require('../config');

describe('Routing', function () {
    'use strict';
    var url = config.URL;
    // within before() you can run all the operations that are needed to setup your tests. In this case
    // I want to create a connection with the database, and when I'm done, I call done().
    before(function (done) {
        // In our tests we use the test db
        // mongoose.connect(config.db.TEST_DB_ADDRESS);
        done();
    });

    // Testing creation of game with a wrong token
    describe('POST Requests', function () {
        it('should return error due to an incorrect body', function (done) {
            var body = {
                token: "DD",
                team_id: "T2AUQNLER",
                team_domain: "harchuteam",
                channel_id: "C2AUJ75C0",
                channel_name: "general",
                user_id: "U2AUU219D",
                user_name: "harchu",
                command: "/ttt",
                text: "start @prachiwadekar",
                response_url: "https://hooks.slack.com/commands/T2AUQNLER/80878879622/uiy3w9xP64SUSPIZrDGesHEE"
            };

            // Send the request and check the response.
            request(url)
                .post('/')
                .send(body)
                // end handles the response
                .end(
                    function (err, res) {
                        if (err) {
                            throw err;
                        }
                        // this is should.js syntax, very clear
                        res.status.should.be.equal(400);
                        done();
                    }
                );
        });

        // this should successfully create a game for the test team
        it('should correctly create a game', function (done) {
            var body = {
                token: config.slack.TTT_COMMAND_TOKEN,
                team_id: "T2AUQNLER",
                team_domain: "harchuteam",
                channel_id: "C2AUJ75C0",
                channel_name: "general",
                user_id: "U2AUU219D",
                user_name: "harchu",
                command: "/ttt",
                text: "start @prachiwadekar",
                response_url: "https://hooks.slack.com/commands/T2AUQNLER/80878879622/uiy3w9xP64SUSPIZrDGesHEE"
            };

            // Send the request and check the response.
            request(url)
                .post('/')
                .send(body)
                // .expect('Content-Type', /json/)
                .expect(200) //Status code
                .end(
                    function (err, res) {
                        if (err) {
                            throw err;
                        }

                        // Should.js fluent syntax applied
                        res.body.should.have.property("text");
                        res.body.should.have.property("attachments");
                        res.body.should.have.property("response_type");
                        res.body.attachments[0].color.should.equal("#36a64f");
                        done();
                    }
                );
        });

        it('should correctly end a game', function (done) {
            var body = {
                token: config.slack.TTT_COMMAND_TOKEN,
                team_id: "T2AUQNLER",
                team_domain: "harchuteam",
                channel_id: "C2AUJ75C0",
                channel_name: "general",
                user_id: "U2AUU219D",
                user_name: "harchu",
                command: "/ttt",
                text: "end",
                response_url: "https://hooks.slack.com/commands/T2AUQNLER/80878879622/uiy3w9xP64SUSPIZrDGesHEE"
            };
            request(url)
                .post('/')
                .send(body)
                // .expect('Content-Type', /json/)
                .expect(200) //Status code
                .end(
                    function (err, res) {
                        if (err) {
                            throw err;
                        }
                        console.log(res.body);
                        // // Should.js fluent syntax applied
                        res.body.should.have.property("text");
                        res.body.text.should.endWith("ended!");
                        done();
                    }
                );
        });
    });
});