var assert = require("assert");

// globals for angular
var jsdom = require("jsdom").jsdom;
document = jsdom("<html><body></body></html>");
window = document.createWindow();
navigator = require("navigator");

require("angular");

angular = window.angular;

require("../dist/angular-catalyze");
var inject = angular.injector(["ng", "catalyze"]).invoke;

// test user for test app
var USERNAME = "test";
var PASSWORD = "test";

describe("angular-catalyze", function() {
    inject(function(catalyze) {
        before(function() {
            catalyze.config({
                appId: "7749a0c8-d1b0-42f7-aeb0-0608221f755a",
                apiKey: "server test 09903cc0-3827-483e-91ac-c25e50e79d9b"
            });
        });

        describe("signIn", function() {
            var session = null;

            before(function(done) {
                catalyze.signIn(USERNAME, PASSWORD, function(success) {
                    session = success;
                    assert(session);
                    done();
                }, function(errors) {
                    assert(errors);
                    assert.fail(0, errors.length, errors);
                });
            });

            it("should allow the user to retrieve themself", function(done) {
                session.retrieveUser(session.usersId, function(success) {
                    assert.equal(success.usersId, session.usersId);
                    done();
                }, function(errors) {
                    assert(errors);
                    assert.fail(0, errors.length, errors);
                });
            });
        });
    });
});

