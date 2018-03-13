// Route handler of App server.
"use strict;"

var db = require('./db_connection');  // db manager


/**Get Friends */
exports.getFriends = function (req, res) {
    if (req.session.userid) {
        var friendQuery = "SELECT User2, fileLocation, LastName, FirstName, DisplayName FROM UsersFriends INNER JOIN Users WHERE User1=" + req.session.userid + " AND User2=u_id;";
        db.executeQuery(friendQuery, function (err, result) {
            if (err) {
                console.error("ERROR: Failed to execute token query." + err);
                res.status(404).send("query failed to execute");
            }
            console.log(result);
            res.status(200).send(result);
        });
    }
};

exports.unfriendUser = function (req, res) {
    if (req.session.userid) {
        var query1 = "DELETE FROM UsersFriends WHERE User1=" + req.session.userid + " AND User2=" + req.body.user + ";";
        var query2 = "DELETE FROM UsersFriends WHERE User2=" + req.session.userid + " AND User1=" + req.body.user + ";";
        var query3 = "DELETE FROM Friends WHERE (User1=" + req.session.userid + " AND User2=" + req.body.user + ") OR (User2=" + req.session.userid + " AND User1=" + req.body.user + ");";
        db.executeQuery(query1, function (err, result) {
            if (err) {
                console.error("ERROR: Failed to execute delete query. Error: " + err);
                res.status(403).json({
                    result: err,
                    deletion: false
                });
            }
            db.executeQuery(query2, function (err, result) {
                if (err) {
                    console.error("ERROR: Failed to execute delete query. Error: " + err);
                    res.status(403).json({
                        result: err,
                        deletion: false
                    });
                }
                db.executeQuery(query3, function(err, result) {
                    if (err) {
                        console.error("ERROR: Failed to execute delete query. Error: " + err);
                        res.status(403).json({
                            result: err,
                            deletion: false
                        })
                    }
                    res.status(200).json({
                        result: result,
                        deletion: true
                    })
                })
            })
        })
    }
};

exports.sendFriendRequest = function(req, res){
    var checkIfReqExist = 
        "SELECT COUNT(f_id) AS Record FROM cscc01.Friends " +
        "WHERE User1=" + req.body.sender + " " +
        "AND User2=" + req.body.receiver; 

    var friendReqSQL = 
        "INSERT INTO cscc01.Friends " +
        "(User1, User2, hasAccepted) " +
        "VALUES (" + req.body.sender + "," + req.body.receiver + "," + "0" + ")";

    db.executeQuery(checkIfReqExist, function(err, reqResult){
        if (err){
            console.error("ERROR: Failed to check if friend request already exist. Query:" + checkIfReqExist + err);
            res.status(400).send({msg:"An unexpected error occured. Please try again."});
        }else if (reqResult[0].Record == 0){
            db.executeQuery(friendReqSQL, function(err, result){
                if (err){
                    console.error("ERROR: Failed to execute query " + friendReqSQL + err);
                    res.status(403).send({msg:"An unexpected error occured. Please try again."});
                }else{
                    console.info("INFO: Successfully injected friend request to DB.");
                    res.status(200).send({msg:"Friend request sent."})
                }
            })
        } else{
            res.status(200).send({msg: "Friend request already sent."})
        }
    })
}


exports.acceptFriendRequest = function (req, res){
    var acceptFriendSQL = 
        "INSERT INTO cscc01.UsersFriends " +
        "VALUES (" + req.session.userid + "," + req.body.userTwo + ")," +
         " (" + req.body.userTwo + "," + req.session.userid + ")";
    
    db.executeQuery(acceptFriendSQL, function(err, result){
        if (err){
            console.error("ERROR: Failed to execute query " + acceptFriendSQL + err);
            res.status(403).send({msg:"An unexpected error occured. Please try again.", accepted: false});
        }else{
            console.info("INFO: Successfully added friend to DB.");
            var queryAccepted = "UPDATE Friends SET hasAccepted='1' WHERE User1=" + req.body.userTwo + " AND User2=" + req.session.userid + ";";
            db.executeQuery(queryAccepted, function(err, result) {
                if (err) {
                    console.error("ERROR: Failed to execute query. Error: " + err);
                    res.status(403).json({msg: err, accepted: false});
                }
                res.status(200).json({msg: result, accepted: true});
            })
        }
    })
}

exports.rejectFriendRequest = function (req, res){
    var deleteReqSQL = 
        "DELETE FROM cscc01.Friends " +
        "WHERE User1=" + req.body.userOne + " AND User2=" + req.session.userid + ";";
    
    db.executeQuery(deleteReqSQL, function(err, result){
        if (err){
            console.error("ERROR: Failed to execute query " + deleteReqSQL + err);
            res.status(403).send({msg:"An unexpected error occured. Please try again.", rejected: false});
        }else{
            console.info("INFO: Successfully removed friend request from DB.");
            res.status(200).send({msg:"Rejected friend request.", rejected: true})
        }
    })
}

exports.getFriendRequests = function (req, res) {
    if (req.session.userid) {
        var query = "SELECT User1, fileLocation, LastName, FirstName, DisplayName FROM Friends INNER JOIN Users WHERE User2=" + req.session.userid + " AND User1=u_id AND hasAccepted=0;";
        db.executeQuery(query, function(err, result) {
            if (err) {
                console.error("ERROR: Failed to execute query. Error: " + err);
                res.status(403).send("failed to execute query");
            }
            res.status(200).send(result);
        })
    }
}


exports.getFriendInfo = function (req, res) {
    if (req.session.userid) {
        var query = "SELECT fileLocation AS profilePic, " +
            "CASE WHEN DisplayName IS NULL OR DisplayName = '' THEN CONCAT(FirstName, ' ', LastName) ELSE DisplayName END AS name " +
            "FROM Users WHERE u_id IN ("+req.session.userid+", "+req.params.userid+")";
        db.executeQuery(query, function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).json({
                    error: "An unexpected error occurred when querying the database"
                });
            } else if (result.length) {
                res.status(200).json(result);
            } else {
                res.sendStatus(404);
            }
        });
    } else {
        res.status(401).json({
            error: "User not logged in"
        });
    }
};

exports.checkIsFriend = function (req, res) {
    if (req.session.userid) {
        var query = "SELECT * FROM Friends WHERE User1 IN ("+req.session.userid+", "+req.params.userid+") AND " +
            "User2 IN ("+req.session.userid+", "+req.params.userid+") AND User1 != User2 AND hasAccepted = 1";
        console.log(query);
        db.executeQuery(query, function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).json({
                    error: "An unexpected error occurred when querying the database"
                });
            } else if (result.length) {
                res.status(200).json({
                    isFriend: 1
                });
            } else {
                res.status(200).json({
                    isFriend: 0
                });
            }
        });
    } else {
        res.status(401).json({
            error: "User not logged in"
        });
    }
};