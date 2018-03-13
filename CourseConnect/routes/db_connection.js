// Route handler of App server.
"use strict;"

/*
 * ================ Set up ================
 */
var mysql = require('mysql'),      // Nodejs driver for MySQL
    config = require('./../config.js');  // App's local config - port#, etc


/*
 * ================ Create Pool for SQL DB ================
 */
var pool = mysql.createPool({
    host: config.dbhost,
    database: config.dbname,
    user: config.dbuser,
    password: config.dbpwd,
    connectionLimit: 10
});

var db = this;
db.pool = pool;

/**
 * Get one connection from DB pool
 */
db.requestDbConnection = function (callback) {

    // Connect to DB
    pool.getConnection(function (connErr, connection) {
        if (connErr) {
            // connection.release();
            console.log("ERROR: Failed to connect to database. " + connErr);
            // resBody["error"] = "Failed to connect to database."
            // res.status(502).send(resBody);
        } else {
            console.log("SUCCESS: Connected to database.");
            callback(connection);
        }
    });
};

/**
 * Use this to execute query
 */
db.executeQuery = function(query,callback){

    db.requestDbConnection(function (connection) {
        connection.query(query,function(err,rows){
            connection.release(); // release connection after query is executed
            callback(err, rows); // send back query results
        });
    });
};

module.exports = db; // exports db with it's functions as a module

