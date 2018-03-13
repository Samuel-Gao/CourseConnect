"use strict";

/* App server of Course Connect */

/*
 * ==== Set up ========
 */
var http = require('http'),                 // Http interface
    express = require('express'),           // Express web framework
    compression = require('compression'),   // Compression middleware
    morgan = require('morgan'),             // HTTP request logger middleware
    errorhandler = require('errorhandler'), // Dev-only error handler middleware
    bodyParser = require('body-parser'),    // Parse data body in post request
    fs = require('fs'),                     // File system
    config = require('./config.js'),        // App's local config - port#, etc
    portal = require('./routes/routes.js'), // Routes handlers
    session = require('express-session'),   // Session
    expressUpload = require('express-fileupload'),//upload files
    uuid = require("uuid/v4");              // Generate random uuid
   
/*
 * ==== Create Express app server ========
 */
var app = express();

// Configurations

if (process.env.PORT) {
	// port for heroku deploy
	app.set('port', process.env.PORT);
} else {
	// use port value in local config file
	app.set('port', config.port);
}

// change param value to control level of logging
app.use(morgan('dev'));   // 'default', 'short', 'tiny', 'dev'

// use compression (gzip) to reduce size of HTTP responses
app.use(compression());

// return error details to client - use only during development
app.use(errorhandler({dumpExceptions: true, showStack: true}));

// parse application/json 
app.use(bodyParser.json());

// Set up to use a session
app.use(session({
    secret: 'super_secret',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false},
    genid: function (req){
        return uuid();
    }
}));

// Set up upload
app.use(expressUpload());

/*
 * App routes (API) - route-handlers implemented in routes/*
 */
app.use('/api', portal);

// location of app's static content
app.use(express.static(__dirname + "/app"));

// ==== Start HTTP server ========
http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port %d in %s mode",
        app.get('port'), config.env
    );
});