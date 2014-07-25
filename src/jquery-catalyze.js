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
