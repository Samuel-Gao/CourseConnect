// Route handler of App server.
"use strict;"

var db = require('./db_connection');  // db manager

exports.logout = function (req, res) {
    // destroy session when logout
    req.session.destroy(function () {
        res.status(200).send(true);
    });
};

exports.authenticate = function (req, res) {
    if (req.session.userid) { // this shouldn't happen
        res.status(400).json({
            error: "user already logged in"
        });
    }

    var query = "SELECT * FROM Users WHERE `Email`='" + req.body.email + "';";
    db.executeQuery(query, function (err, result) {
        if (err) {
            console.log("ERROR: Failed to execute authenticate query. Query: " + query);
            res.status(404).send("Auth query failed");
        }
        console.log("SUCCESS: Authenticate query executed. Result: " + result);
        if (result.length == 0) {
            console.log("ERROR: Login email wasn't found in the database. Result: " + result);
            res.status(200).send({ isvalid: false });
        } else if (result[0]["Password"] != req.body.pwd) {
            console.log("ERROR: Password entered doesn't match password on database. Result: " + result);
            res.status(200).send({ isvalid: false });
        } else {
            console.log("SUCCESS: User logged in.");
            // record user id in session
            req.session.userid = result[0].u_id;
            res.status(200).send({ isvalid: true });
        }
    });
};

exports.signupCheck = function (req, res) {
    var query = "INSERT INTO Users (Email, LastName, FirstName, Password, UTorID) VALUES ('" + req.body.username + "', '" + req.body.ln + "', '" + req.body.fn + "', '" + req.body.pwd + "', '" + 
        req.body.uid + "');";
    db.executeQuery(query, function (err, result) {
        if (err) {
            if (err.code != "ER_DUP_ENTRY") {
                console.log("ERROR: Query failed to execute. Query: " + query);
                res.status(404).send("Auth query failed");
            } else if (err.code == "ER_DUP_ENTRY") {
                console.log("ERROR: Failed to execute signupCheck. Query: " + query + "\nMessage: " + err);
                res.status(200).send(false);
            }
        } else {
            console.log("SUCCESS: Signup user created. Query: " + query);
            res.status(200).send(true);
        }
    });
};

exports.getUserInfo = function (req, res) {
    if (req.session.userid) {
        var query2 = "SELECT * FROM Users WHERE u_id=" + req.session.userid + ";";
        db.executeQuery(query2, function (err, result) {
            if (err) {
                console.log("ERROR: Failed to retrieve user data. Error: " + err);
                res.status(404).send("failed to retrieve user data");
            }
            res.status(200).send(result);
        });
    } else {
        res.status(403).json({
            error: "User not logged in"
        });
    }
};

exports.uploadProfPic = function (req, res) {
    var fs = require('fs');
    var path = __dirname + "/../app/img/" + req.files.file.name;
    fs.writeFile(path, req.files.file.data, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("SUCCESS: The file was saved!");
    }); 
};


exports.refreshProfPic = function (req, res) {
    if (req.session.userid) {
        var query2 = "UPDATE Users SET fileLocation='" + "img/" + req.body.file + "' WHERE u_id=" + req.session.userid + ";";
        var query3 = "SELECT fileLocation FROM Users WHERE u_id=" + req.session.userid + ";";
        db.executeQuery(query2, function(err, result) {
            if (err) {
                console.log("ERROR: Failed to set file location. Error: " + err);
                res.status(404).send("cannot set file location");
            }
            db.executeQuery(query3, function(err, result) {
                if (err) {
                    console.log("ERROR: Failed to retrieve file location. Error: " + err);
                    res.status(404).send("cannot refresh profile pic");
                }
                res.status(200).send(result);
            });
        });
    } else {
        res.status(403).json({
            error: "User not logged in"
        });
    }
};

exports.updateDispName = function (req, res) {
    if (req.session.userid) {
        var query2 = "UPDATE Users SET DisplayName='" + req.body.dispName + "' WHERE u_id=" + req.session.userid + ";";
        var query3 = "SELECT DisplayName FROM Users WHERE u_id=" + req.session.userid + ";";
        db.executeQuery(query2, function(err, result) {
            if (err) {
                console.log("ERROR: Failed to update DisplayName in db. Error: " + err);
                res.status(404).send("failed to update dispName");
            }
            db.executeQuery(query3, function(err, result) {
                if (err) {
                    console.log("ERROR: Failed to retrieve display name. Error: " + err);
                    res.status(404).send("cannot retreive display name");
                }
                res.status(200).send(result);
            });
        });
    } else {
        res.status(403).json({
            error: "User not logged in"
        });
    }
};

exports.updateDescription = function (req, res) {
    if (req.session.userid) {
        var query2 = "UPDATE Users SET Description='" + req.body.desc + "' WHERE u_id=" + req.session.userid + ";";
        var query3 = "SELECT Description FROM Users WHERE u_id=" + req.session.userid + ";";
        db.executeQuery(query2, function(err, result) {
            if (err) {
                console.log("ERROR: Failed to update description. Error: " + err);
                res.status(404).send("failed to update description");
            }
            db.executeQuery(query3, function(err, result) {
                if (err) {
                    console.log("ERROR: Failed to retrieve description for user. Error: " + err);
                    res.status(404).send("failed to retrieve description for user");
                }
                res.status(200).send(result);
            });
        });
    } else {
        res.status(403).json({
            error: "User not logged in"
        });
    }
};

exports.getCoursesEnrolled = function (req, res) {
    if (req.session.userid) {
        var query2 = "SELECT c_id, CourseCode, Semester, Year FROM Participant inner join Class WHERE UserID=" + req.session.userid + 
        " AND ClassID=c_id AND Droped=0;";
        db.executeQuery(query2, function(err, result) {
            if (err) {
                console.log("ERROR: Failed to retrieve courses user has enrolled. Error: " + err);
                res.status(404).send("failed to retrieve enrolled course");
            }
            res.status(200).send(result);
        });
    } else {
        res.status(403).json({
            error: "User not logged in"
        });
    }
}

exports.courseUnenroll = function(req, res) {
    if(req.session.userid) {
        //console.log(req.body.classid);
        // var replaceAcct = "UPDATE Participant SET UserID=50 WHERE UserID=" + req.session.userid + " AND ClassID=" + req.body.classid + ";";
        var replaceAcct = "UPDATE Message SET Anonymously=1 WHERE ParticipantID= " + 
            "(SELECT p_id FROM Participant WHERE UserID=" + req.session.userid + " AND ClassID=" + req.body.classid + ")";
        
        db.executeQuery(replaceAcct, function(baderr) {
            if(baderr) {
                console.log("ERROR: Cannot replace user account in Chatroom. Please try again later. Error: " + baderr);
                res.status(404).send("Failed to leave chatroom.");
            }
            var query = "UPDATE Participant SET Droped=1 WHERE UserID=" + req.session.userid + " AND ClassID=" + req.body.classid + ";";
            db.executeQuery(query, function(err, result) {
                if(err) {
                    console.log("ERROR: Failed to unenroll from course. Error: " + err);
                    res.status(404).send("Failed to un-enroll from this course.");
                }
                res.status(200).send(result);
            })
        })
        /*var query = "DELETE FROM Participant WHERE UserID=" + req.session.userid + " AND ClassID=" + req.body.classid + ";";
        db.executeQuery(query, function(err, result) {
            if(err) {
                console.log("ERROR: Failed to unenroll from course. Error: " + err);
                res.status(404).send("failed to un-enroll from this course.");
            }
            res.status(200).send(result);
        })*/
    } else { res.status(403).json({ error: "User not logged in." }); }
}

exports.getUser = function (req, res) {
    console.log(req.session)
    if (req.session.userid) {
        var query = "SELECT * FROM Users WHERE u_id = '" + req.session.userid + "'";
        db.executeQuery(query, function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).json({
                    error: "An unexpected error occurred when querying the database"
                });
            } else {
                res.status(200).json({
                    userId: result[0].u_id,
                    lastName: result[0].LastName,
                    firstName: result[0].FirstName,
                    email: result[0].email,
                    displayName: result[0].DisplayName,
                    description: result[0].Description,
                    utorId: result[0].UTorId,
                    profilePic: result[0].fileLocation
                });
            }
        });
    } else {
        res.status(204).json({
            message: "User not login"
        });
    }

};
