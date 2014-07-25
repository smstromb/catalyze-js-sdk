var assert = require("assert");

// test user for test app
var USERNAME = "test";
var PASSWORD = "test";

// globals for browser
var jsdom = require("jsdom").jsdom;
document = jsdom("<html><body></body></html>");
window = document.createWindow();
jQuery = $ = require("jquery");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
$.support.cors = true;
$.ajaxSettings.xhr = function () {
    return new XMLHttpRequest();
}
require("../dist/jquery-catalyze");

describe("jquery-catalyze", function() {
    before(function() {
        $.catalyze.config({
            appId: "7749a0c8-d1b0-42f7-aeb0-0608221f755a",
            apiKey: "server test 09903cc0-3827-483e-91ac-c25e50e79d9b"
        });
    });

    describe("signIn", function() {
        var session = null;

        before(function(done) {
            $.catalyze.signIn(USERNAME, PASSWORD, function(result) {
                session = result;
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
