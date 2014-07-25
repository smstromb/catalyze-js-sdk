# SDK Docs

## Callbacks and Wrappers
Because there are three wrappers for this SDK (jQuery, Angular, node), objects and callbacks vary ever-so-slightly. For each wrapper, there's an accessible Catalyze object - they're implemented as follows:

* jQuery - `$.catalyze` (plays nicely with `$.noConflict()`)
* Angular - `catalyze` service on the `catalyze` module
* node - `catalyze` available as import (`require("catalyze")`)

For the purpose of brevity, these docs refer to the object as `catalyze` - all of the functions on it are the same.

The async callback convention for jQuery and Angular is to use two separate functions for success and error, in that order - so many functions in this SDK take the following form:

`catalyze.someFunction(something, success, error)`

Node's callback convention is to take a single callback function of the form `function(error, success)`, and that convention must be adhered to in order to play nicely with libraries like `q`. Therefore, the node wrapper expects only a single callback in that form (instead of `success` and `error`). For brevity's sake and to avoid confusion, these docs list those parameters as <i>`callbacks`</i>.

## Errors
Errors returned from the Catalyze API are an array of objects, each of which consists of a `message` and a `code`. Typically, there is only one item in the array, but occasionally there can be more than one.

```json
[
    {
        "code": 404,
        "message": "No user found."
    }
]
```

## Non-Session Methods
These methods exist on the `catalyze` object itself.

### catalyze.config(options)
This must be called in order for any other SDK functions to work. The `options` object should have the following properties:

* `apiKey` - The Catalyze v2 API key, acquired from the dashboard
* `appId` - The ID of your application, acquired from the dashboard

### catalyze.signUp(userObject, _callbacks_)
Register a new user for the application and send a verification email to their primary address. For `userObject` structure, see the [User Model docs](https://docs.catalyze.io/#users).

### catalyze.signIn(username, password, _callbacks_)
Sign a new user by username and password into the application, passing the created session object to the callback (more on sessions below).

### catalyze.sessionFromToken(usersId, token, _callbacks_)
Recreate a session object from stored `usersId` and `token` values, passing the session object to the callback.

### catalyze.requestPasswordReset(username, _callbacks_)
Send a email starting the process for a password reset to the specified user's primary email (by `username`).

## Session Objects
Session objects contain everything representing an authenticated user to your application.

Properties:

* `session.usersId` - The ID of the user.
* `session.token` - The authenticated session token.
* `session.sessionUser` - The full user's object. This can be used for things like greeting the user by name when they log in (`session.sessionUser.name.firstName`).

## Session Methods
### session.signOut(_callbacks_)
Expires the user's credentials for the API.

### session.retrieveUser(usersId, _callbacks_)
Retrieves the user with the ID `usersId`.

### session.updateUser(usersId, userObject, _callbacks_)
Updates the user with the ID `usersId`. For `userObject` structure, see the [User Model docs](https://docs.catalyze.io/#users).

### session.deleteUser(usersId, _callbacks_)
Deletes the user with the ID `usersId`.

### session.createClassEntry(className, entryObject, _callbacks_)
Creates a new entry in the custom class `className` belonging to the session user. Custom classes can be created from the dashboard - see the [Custom Class docs](https://docs.catalyze.io/#custom-classes).

### session.createClassEntryForOther(className, usersId, entryObject, _callbacks_)
Creates a new entry in the custom class `className` belonging to the user with ID `usersId`.

### session.retrieveClassEntry(className, entryId, _callbacks_)
Retrieves a single entry in the custom class `className` with ID `entryId`.

### session.queryClassEntries(className, paramObject, _callbacks_)
Queries the custom class entries in the class `className` belonging to the session user. The available params are listed in the [Custom Class docs](https://docs.catalyze.io/#query-class-entries-by-user) - passing an empty object can be used to just get a full set of paginated results.

An array of entry objects will be passed to the success callback - each object contains the entryId as the property `entryId` and the entry itself as the property `content`.

### session.updateClassEntry(className, entryId, entryObject, _callbacks_)
Updates the entry in custom class `className` with ID `entryId`.

### session.deleteClassEntry(className, entryId, _callbacks_)
Deletes the entry in the custom class `className` with ID `entryId`.

## Raw HTTP methods
The session object also exposes the four HTTP methods that the Catalyze v2 API uses. These will automatically set the proper headers, authorized for the session user. This means that these can be used to accommodate any API route that doesn't have a convenience wrapper in this SDK.

Each of these four functions takes two or three of these parameters:

* `route` - The route relative to `/v2/` at the API endpoint. For example, the user creation route would pass `"users"` as the route.
* `body` - Request body. This parameter is omitted for `get` and `delete`.
* `params` - Object representing query params. Leave empty if not needed.

### session.post(route, body, params, _callbacks_)
### session.get(route, params, _callbacks_)
### session.put(route, body, params, _callbacks_)
### session.delete(route, params, _callbacks_)

## Reporting Issues

Please report all API issues to our support site - [https://catalyzeio.zendesk.com/](https://catalyzeio.zendesk.com/).

If there's an issue with this SDK itself, please create an issue on this repo - we'll address it ASAP.
