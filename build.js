var fs = require("fs");

var SRC = "src";
var DIST = "dist";
var CORE = "core.js";
var CORE_DATA = fs.readFileSync([SRC, CORE].join("/"));

fs.readdirSync(SRC).forEach(function(file) {
    if (file != CORE) {
        fs.writeFileSync([DIST, file].join("/"),
            [CORE_DATA, fs.readFileSync([SRC, file].join("/"))].join("\n"));
        console.log("> " + [DIST, file].join("/"));
    }
});
