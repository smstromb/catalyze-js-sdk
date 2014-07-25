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
                        success(value.errors);
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

/* node wrapper */

var request = require("request");

var apiKey = null;
module.exports.appId = null;

module.exports.config = function(obj) {
    apiKey = obj.apiKey;
    module.exports.appId = obj.appId;
};

var httpConfig = function(url, type, params, data) {
    return {
        uri: url,
        method: type,
        headers: {
            "X-Api-Key": apiKey
        },
        qs: params,
        json: data ? data : true
    };
};

var authedHttpConfig = function(url, type, token, params, data) {
    var obj = httpConfig(url, type, params, data);
    obj.headers.Authorization = "Bearer " + token;
    return obj;
};

var wrap = function(callback) {
    return function(error, response, body) {
        var wasError = response.statusCode != 200;
        callback(
            wasError ? body : null,
            wasError ? null : body);
    };
};

var httpAdapter = {
    post: function(route, obj, params, callback) {
            request(httpConfig(HOST + route, "post", params, obj), wrap(callback));
        },
    get: function(route, params, callback) {
            request(httpConfig(HOST + route, "get", params, null), wrap(callback));
        },
    authed_post: function(token, route, obj, params, callback) {
            request(authedHttpConfig(HOST + route, "post", token, params, obj), wrap(callback));
        },
    authed_get: function(token, route, params, callback) {
            request(authedHttpConfig(HOST + route, "get", token, params, null), wrap(callback));
        },
    authed_put: function(token, route, obj, params, callback) {
            request(authedHttpConfig(HOST + route, "put", token, params, obj), wrap(callback));
        },
    authed_delete: function(token, route, params, callback) {
            request(authedHttpConfig(HOST + route, "delete", token, params, null), wrap(callback));
        }
};

integrateCatalyzeCore(module.exports, httpAdapter);
