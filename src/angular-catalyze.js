/* Angular wrapper */

angular.module("catalyze", []).service("catalyze", function($http) {
    var apiKey = null;
    this.appId = null;
    this.config = function(obj) {
        apiKey = obj.apiKey;
        this.appId = obj.appId;
    };

    var httpConfig = function(params) {
        return {
            headers: {
                "X-Api-Key": apiKey
            },
            params: params
        };
    };

    var authedHttpConfig = function(token, params) {
        return {
            headers: {
                "X-Api-Key": apiKey,
                "Authorization": "Bearer " + token
            },
            params: params
        };
    };

    var extractErrors = function(func) {
        return function(response) {
            func(response.errors);
        };
    };

    var httpAdapter = {
        post: function(route, obj, params, success, error) {
                $http.post(HOST + route, obj, httpConfig(params))
                    .success(success).error(extractErrors(error));
            },
        get: function(route, params, success, error) {
                $http.get(HOST + route, httpConfig(params))
                    .success(success).error(extractErrors(error));
            },
        authed_post: function(token, route, obj, params, success, error) {
                $http.post(HOST + route, obj, authedHttpConfig(token, params))
                    .success(success).error(extractErrors(error));
            },
        authed_get: function(token, route, params, success, error) {
                $http.get(HOST + route, authedHttpConfig(token, params))
                    .success(success).error(extractErrors(error));
            },
        authed_put: function(token, route, obj, params, success, error) {
                $http.put(HOST + route, obj, authedHttpConfig(token, params))
                    .success(success).error(extractErrors(error));
            },
        authed_delete: function(token, route, params, success, error) {
                $http.delete(HOST + route, authedHttpConfig(token, params))
                    .success(success).error(extractErrors(error));
            }
    };

    integrateCatalyzeCore(this, httpAdapter);
});
