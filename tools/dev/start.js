var path = require("path");
var handler = require('serve-handler');
var http = require('http');
var chalk = require("chalk");
var open = require("open");


var port = 5001;
var address = `http://localhost:${port}`;


var server = http.createServer(function(request, response) {
    return handler(request, response, {
        headers: [
            {
                "source" : "**/*",
                "headers" : [{
                    "key" : "Cache-Control",
                    "value" : "no-cache"
                }]
            },
        ],
        unlisted: [
            "clienti", "docs", "server", "tools",
            "node_modules", 
            "package.json", "package-lock.json", ".gitignore",
        ]
    });
});


server.listen(port, () => {
    console.log(`${chalk.cyan("INFO")} ${chalk.gray("Running at")} ${chalk.green(`${address}`)}`);
    open(address);
});
