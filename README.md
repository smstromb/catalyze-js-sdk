## JS SDK for the Catalyze v2 API
Supports node, jQuery, and angular.

* jQuery >= 1.5
* Angular >= 1.0.8
* node >= 0.8.0

### Installing

#### jQuery/Angular
```
bower install catalyze
```

#### node
```
npm install catalyze
```

### Building and Testing
Tests are powered by [mocha](http://visionmedia.github.io/mocha/) and intended to be run from node. This covers basic testing (not exhaustive, just enough to make sure each function works) of the node wrapper and smoke testing of the angular and jQuery wrappers.

After cloning + `npm install`ing, to build:

```
npm build
```

To run tests (this will build before running the tests):

```
npm test
```

### Invoking
#### jQuery

```html
<script src="bower_components/catalyze/dist/jquery-catalyze.js"></script>
<script>
    $.catalyze.config({
        apiKey: "...",
        appId: "..."
    });
    
    $.catalyze.signIn(...)
</script>
```

#### Angular
```html
<script src="bower_components/catalyze/dist/angular-catalyze.js"></script>
<script>
    angular.module("MyApp", ["catalyze"])
    .controller("MyController", function($scope, catalyze) {
        catalyze.config({
            apiKey: "...",
            appId: "..."
        });
        
        catalyze.signIn(...);
    });
</script>
```

#### node

```javascript
var catalyze = require("catalyze");

catalyze.config({
    apiKey: "...",
    appId: "..."
});

catalyze.signIn(...);
```

### SDK Docs

[Full SDK Docs](https://github.com/catalyzeio/catalyze-js-sdk/blob/master/docs.md)
