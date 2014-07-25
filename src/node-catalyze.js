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
