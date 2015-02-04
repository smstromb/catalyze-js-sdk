/*
 *  Catalyze v2 API JavaScript SDK
 *
 *  https://catalyze.io/
 */

var HOST = "https://api.catalyze.io/v2/";

/*
    Wraps around a generalized http client to provide Catalyze access methods.
*/
var integrateCatalyzeCore = function(self, http) {
    // Sign in with username and password
    self.signIn = function(username, password, success, error) {
        http.post("auth/signin", {username: username, password: password}, {}, function(user, second) {
            /*
                node's callback convention is a single callback. therefore, if no error is passed,
                we assume this is being called from node, and use the "second" variable accordingly.
            */
            if (error != null) { // non-node
                success(new Session(user.usersId, user.sessionToken, user));
            } else { // node
                if (user) { // this is really the error parameter, now
                    success(user);
                } else { // true success route
                    success(false, new Session(second.usersId, second.sessionToken, second));
                }
            }
        }, error);
    };

    // Register a new account for the current application
    self.signUp = function(userObj, success, error) {
        http.post("users", userObj, {}, success, error);
    };

    // Request a password reset for a given username
    self.requestPasswordReset = function(username, success, error) {
        http.get(self.appId + "/reset/user/" + encodeURIComponent(username), {}, success, error);
    };

    // Verify that a token is still valid
    self.verifyToken = function(token, success, error) {
        http.authed_get(token, "auth/verify/", {}, success, error);
    }

    // Create a session object from a usersId and token
    self.sessionFromToken = function(usersId, token, success, error) {
        var session = new Session(usersId, token);
        if (session.sessionUser) {
            if (error) {
                success(session);
            } else {
                success(null, session);
            }
        } else {
            session.retrieveUser(session.usersId, function(value, second) {
                if (error != null) { // non-node
                    session.sessionUser = value;
                    success(session);
                } else { // node
                    if (value) {
                        success(value);
                    } else {
                        session.sessionUser = second;
                        success(false, session);
                    }
                }
            }, error);
        }
    };

    // contains a session token and methods that are only usable with one
    var Session = function(usersId, token, userObj) {
        // http method exposing
        this.post = function(route, body, params, success, error) {
            http.authed_post(token, route, body, params, success, error);
        };
        this.get = function(route, params, success, error) {
            http.authed_get(token, route, params, success, error);
        };
        this.put = function(route, body, params, success, error) {
            http.authed_put(token, route, body, params, success, error);
        };
        this.delete = function(route, params, success, error) {
            http.authed_delete(token, route, params, success, error);
        };

        // users
        this.retrieveUser = function(usersId, success, error) {
            this.get("users/" + usersId, {}, success, error);
        };
        this.updateUser = function(usersId, user, success, error) {
            this.put("users/" + usersId, user, {}, success, error);
        };
        this.deleteUser = function(usersId, success, error) {
            this.delete("users/" + usersId, {}, success, error);
        };

        // custom class entries
        this.createClassEntry = function(className, data, success, error) {
            this.post("classes/" + className + "/entry", {content: data}, {}, success, error);
        };
        this.createClassEntryForOther = function(className, usersId, data, success, error) {
            this.post("classes/" + className + "/entry/" + usersId, {content: data}, {}, success, error);
        };
        this.retrieveClassEntry = function(className, entryId, success, error) {
            this.get("classes/" + className + "/entry/" + entryId, {}, success, error);
        };
        this.queryClassEntries = function(className, params, success, error) {
            this.get("classes/" + className + "/query/" + this.usersId, params, success, error);
        };
        this.updateClassEntry = function(className, entryId, data, success, error) {
            this.put("classes/" + className + "/entry/" + entryId, data, {}, success, error);
        };
        this.deleteClassEntry = function(className, entryId, success, error) {
            this.delete("classes/" + className + "/entry/" + entryId, {}, success, error);
        };

        // sign out
        this.signOut = function(success, error) {
            this.get("auth/signout", {}, success, error);
        };

        this.sessionUser = userObj;
        this.token = token;
        this.usersId = usersId;

        return this;
    };
};

/* jQuery wrapper */

jQuery.catalyze = new (function ($) {
    var apiKey = null;
    this.appId = null;
    this.config = function(obj) {
        apiKey = obj.apiKey;
        this.appId = obj.appId;
    };

    var httpConfig = function(type, params, data) {
        var obj = {
            type: type,
            crossDomain: true,
            headers: {
                "X-Api-Key": apiKey
            },
            params: params
        };
        if (data) {
            obj.data = JSON.stringify(data);
        }
        return obj;
    };

    var authedHttpConfig = function(type, token, params, data) {
        var obj = {
            type: type,
            crossDomain: true,
            headers: {
                "X-Api-Key": apiKey,
                "Authorization": "Bearer " + token
            },
            params: params
        };
        if (data) {
            obj.data = JSON.stringify(data);
        }
        return obj;
    };

    var extractErrors = function(func) {
        return function(response) {
            func(response.responseJSON.errors);
        };
    };

    var httpAdapter = {
        post: function(route, obj, params, success, error) {
                $.ajax(HOST + route, httpConfig("post", params, obj))
                    .done(success).fail(extractErrors(error));
            },
        get: function(route, params, success, error) {
                $.ajax(HOST + route, httpConfig("get", params, null))
                    .done(success).fail(extractErrors(error));
            },
        authed_post: function(token, route, obj, params, success, error) {
                $.ajax(HOST + route, authedHttpConfig("post", token, params, obj))
                    .done(success).fail(extractErrors(error));
            },
        authed_get: function(token, route, params, success, error) {
                $.ajax(HOST + route, authedHttpConfig("get", token, params, null))
                    .done(success).fail(extractErrors(error));
            },
        authed_put: function(token, route, obj, params, success, error) {
                $.ajax(HOST + route, authedHttpConfig("put", token, params, obj))
                    .done(success).fail(extractErrors(error));
            },
        authed_delete: function(token, route, params, success, error) {
                $.ajax(HOST + route, authedHttpConfig("delete", token, params, null))
                    .done(success).fail(extractErrors(error));
            }
    };

    integrateCatalyzeCore(this, httpAdapter);

    return this;
})(jQuery);
