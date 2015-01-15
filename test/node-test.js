var assert = require("assert");
var catalyze = require("../dist/node-catalyze");

catalyze.config({
    appId: "7749a0c8-d1b0-42f7-aeb0-0608221f755a",
    apiKey: "server test 09903cc0-3827-483e-91ac-c25e50e79d9b"
});

// test user for test app
var USERNAME = "test";
var PASSWORD = "test";

describe("node-catalyze", function() {
    describe("signIn", function() {
        it("should allow signing in with valid credentials", function(done) {
            catalyze.signIn(USERNAME, PASSWORD, function(error, session) {
                assert(!error);
                assert.notEqual(session.usersId, null);
                done();
            });
        });

        it("should not allow signing in with invalid credentials", function(done) {
            catalyze.signIn("this shouldn't be a valid username",
                "I swear, if somebody registers this account",
                function(error, session) {
                    assert(error);
                    assert(error["errors"]);
                    done();
                });
        });
    });

    describe("signUp", function() {
        // we can't test valid email signup due to email requirement
        it("should not allow duplicate signups", function(done) {
            catalyze.signUp({
                username: USERNAME,
                password: "whatever",
                email: {
                    primary: "whatever@example.com"
                },
                name: {}
            }, function(error, success) {
                assert(error);
                done();
            });
        });
    });

    describe("session functions", function() {
        var session = null;
        before(function(done) {
            catalyze.signIn(USERNAME, PASSWORD, function(errors, success) {
                assert(!errors, JSON.stringify(errors));
                session = success;
                done();
            });
        });

        describe("sessionFromToken", function() {
            it("should allow sessions to be created from tokens", function(done) {
                catalyze.sessionFromToken(session.usersId, session.token, function(error, tokenSession) {
                    assert(!error, JSON.stringify(error));
                    assert.equal(tokenSession.usersId, session.usersId);
                    assert.equal(tokenSession.token, session.token);
                    assert.equal(tokenSession.sessionUser.usersId, session.sessionUser.usersId);
                    done();
                });
            })
        });

        describe("errors", function() {
            it("should have a properly-formatted error body for login errors", function(done) {
                catalyze.signIn("this shouldn't be a valid username",
                    "I swear, if somebody registers this account",
                    function(errors, session) {
                        assert(errors);
                        assert(errors.errors);
                        assert(errors.errors.length > 0);
                        done();
                });
            });

            it("should have a properly-formatted error body for non-login errors", function(done) {
                session.createClassEntry("this-class-does-not-exist", {
                        hi: "hello"
                    }, function(errors, success) {
                        assert(errors);
                        assert(errors.errors);
                        assert(errors.errors.length > 0);
                        done();
                });
            });

            it("should have a properly-formatted error body for session errors", function(done) {
                catalyze.sessionFromToken(session.usersId, "abc123notarealtoken", function(errors, tokenSession) {
                    assert(errors, JSON.stringify(errors));
                    assert(errors.errors, JSON.stringify(errors));
                    assert(errors.errors.length > 0);
                    done();
                });
            });
        });

        describe("customClassEntries", function() {
            var entry, entryId;

            before(function(done) {
                session.createClassEntry("test", {
                    num: 42,
                    str: "hello"
                }, function(errors, success) {
                    assert(!errors, JSON.stringify(errors));
                    entry = success.content;
                    entryId = success.entryId;
                    done();
                });
            });

            it("should allow entries to be created for another user", function(done) {
                // fudging it by creating an entry on the test user itself
                session.createClassEntryForOther("test", session.usersId, {
                    num: 13,
                    str: "asdfghjkl;"
                }, function(errors, success) {
                    assert(!errors, JSON.stringify(errors));
                    // just delete it right away
                    session.deleteClassEntry("test", success.entryId, function(errors, success) {
                        assert(!errors, JSON.stringify(errors));
                        done();
                    });
                });
            });

            it("should allow class entries to be retrieved", function(done) {
                session.retrieveClassEntry("test", entryId, function(errors, result) {
                    assert(!errors, JSON.stringify(errors));
                    assert.equal(result.content.num, entry.num);
                    assert.equal(result.content.str, entry.str);
                    done();
                });
            });

            it("should allow class entries to be queried", function(done) {
                // no-param search first
                session.queryClassEntries("test", {}, function(errors, results) {
                    assert(!errors, JSON.stringify(errors));
                    assert(results.length > 0, "Received no results from no-param query");
                    // search for something that doesn't exist
                    session.queryClassEntries("test", {
                        field: "str",
                        searchBy: "big bird"
                    }, function(errors, results) {
                        assert(!errors, JSON.stringify(errors));
                        assert.equal(results.length, 0);
                        done();
                    });
                });
            });

            it("should allow class entries to be updated", function(done) {
                entry.num = 6 * 9;
                session.updateClassEntry("test", entryId, entry, function(errors, result) {
                    assert(!errors, JSON.stringify(errors));
                    assert.equal(result.content.num, entry.num);
                    assert.equal(result.content.str, entry.str);
                    done();
                })
            });

            it("should allow class entries to be deleted", function(done) {
                session.deleteClassEntry("test", entryId, function(errors, result) {
                    assert(!errors, JSON.stringify(errors));
                    done();
                });
            });
        });

        after("should allow sessions to sign out", function(done) {
            session.signOut(function(errors, success) {
                assert(!errors, JSON.stringify(errors));
                done();
            });
        });
    });
});
