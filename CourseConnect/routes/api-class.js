// Route handler of App server.
"use strict;"

var db = require('./db_connection');  // db manager


exports.getClass = function (req, res) {
    // visitors should be able to search class too
    var query = "SELECT * FROM Class WHERE CourseCode = '" + req.params.coursecode +
        "' AND Semester = '" + req.params.semester + "' AND Year = '" + req.params.year + "'";
    db.executeQuery(query, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).json({
                error: "An unexpected error occurred when querying the database"
            });
        } else if (data.length) {
            res.status(200).json(
                {
                    found: 1,
                    courseId: data[0].c_id,
                    courseCode: data[0].CourseCode,
                    semester: data[0].Semester,
                    year: data[0].Year,
                    title: data[0].title,
                    description: data[0].description
                }
            );
        } else {
            res.status(200).json(
                {
                    found: 0
                }
            );
        }
    });
};

exports.getStudents = function(req, res) {
    /*var query = "SELECT user_id FROM session CROSS JOIN Users WHERE session='" + req.body.token + "';";
    db.executeQuery(query, function(err, data) {
        if(err) {
            console.log("ERROR: Failed to retrieve user ID. Error: " + err);
            res.status(404).send("failed to retrieve user ID");
        }
    });*/
    if(req.session.userid) {
        var mainQuery = "SELECT u_id,fileLocation,FirstName,LastName,DisplayName, " +
            "CASE WHEN User2 IS NULL THEN 0 ELSE 1 END AS friend " +
            "FROM Participant CROSS JOIN Class CROSS JOIN Users LEFT JOIN UsersFriends ON User1 = "+req.session.userid+" AND User2 = UserID WHERE ClassID=c_id and c_id='" + req.body.classid + "' and UserID=u_id AND UserID != " + req.session.userid + " ";
        console.log(req.body.classid);
        db.executeQuery(mainQuery, function(err, data) {
            if(err) {
                console.error(err);
                res.status(404).json({
                    error: "Class/Students are non-existant here: An expected error occurred when querying the database."
                });
            }
            res.status(200).send(data);
        });
    }
}

/*exports.getStudents = function(req, res) {
    var query = "SELECT FirstName,LastName FROM Participant CROSS JOIN Class CROSS JOIN Users WHERE ClassID=c_id and CourseCode=" + $routeParams.coursecode + " and UserID=u_id";
    db.executeQuery(query, function(err, data) {
        if(err) {
            console.error(err);
            res.status.json({
                error: "Class/Students are non-existant here: An expected error occurred when querying the database.";
            });
        } else {
            console.log(data);
            res.status(200).send(data);
        }
    });
}*/

exports.getClassWithUserPermission = function (req, res) {
    // check if user logged in
    if (req.session.userid) {
        var query = "SELECT * FROM Class, Participant, Roles WHERE Class.c_id = '" + req.params.classid +
            "' AND Participant.ClassID = '" + req.params.classid + "' AND Participant.UserID = '" + req.session.userid +
            "' AND Roles.r_id = Participant.RoleID";
        db.executeQuery(query, function (err, data) {
            console.log(data);
            if (err) {
                console.error(err);
                res.status(500).json({
                    error: "An unexpected error occurred when querying the database"
                });
            } else if (data.length) {
                res.status(200).json(
                    {
                        courseId: data[0].c_id,
                        courseCode: data[0].CourseCode,
                        semester: data[0].Semester,
                        year: data[0].Year,
                        title: data[0].title,
                        classDescription: data[0].description,
                        participantId: data[0].p_id,
                        roleName: data[0].Name,
                        roleDescription: data[0].Description,
                        canSendMessage: data[0].sendMessage,
                        canPost: data[0].post,
                        canUploadFile: data[0].uploadFile,
                        canDeleteOwnMessage: data[0].DeleteOwnMessage,
                        canDeleteOwnPost: data[0].DeleteOwnPost,
                        canDeleteOwnFile: data[0].DeleteOwnFile,
                        canDeleteOtherMessage: data[0].DeleteOtherMessage,
                        canDeleteOtherPost: data[0].DeleteOtherPost,
                        canDeleteOtherFile: data[0].DeleteOtherFile,
                        canDeleteRoom: data[0].DeleteRoom
                    }
                );
            } else {
                res.status(404).json(
                    {
                        error: "class not found or user not enrolled in this class"
                    }
                );
            }
        });

    } else {
        res.status(401).json({
            error: "User not logged in"
        });
    }

};

function joinClassRoom(userid, classid, roleid, res) {
    // var query = "IF " + 
    //     "NOT EXIST (Select * FROM Participant WHERE UserID=" + userid + " AND ClassID=c_id) " + 
    //         "INSERT INTO Participant (UserID, ClassID, RoleID) VALUES ('" + userid + "', '" + classid + "', '" + roleid + "')" +
    //     "ELSE " + 
    //         "UPDATE Participant SET Droped=0 WHERE WHERE UserID=" + userid + 
    //         " AND ClassID=c_id AND Droped=0;";
    
    var check = "Select * FROM Participant WHERE UserID=" + userid + " AND ClassID=" + classid;

    db.executeQuery(check, function(err, result){
        var query;

        if (result.length > 0){
           var query =  "UPDATE Participant SET Droped=0 WHERE UserID=" + userid + 
            " AND ClassID=" + classid + " AND Droped=1;";
        }else{
            var query = "INSERT INTO Participant (UserID, ClassID, RoleID) VALUES ('" + userid + "', '" + classid + "', '" + roleid + "')";
        }

        db.executeQuery(query, function (err, data) {
            if (err) {
                console.error(err);
                res.status(500).json({
                    error: "Failed joining class: An unexpected error occurred when querying the database"
                });
            } else {
                res.status(200).send({courseId:classid});
            }
        });
    })
}

exports.joinClass = function (req, res) {
    // default join as student
    joinClassRoom(req.session.userid, req.params.classid, 4, res);
};

exports.createClass = function (req, res) {
    // check for room existence again to ensure no duplicate rooms are created
    var query = "SELECT * FROM Class WHERE CourseCode = '" + req.body.coursecode +
        "' AND Semester = '" + req.body.semester + "' AND Year = '" + req.body.year + "'";
    db.executeQuery(query, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).json({
                error: "An unexpected error occurred when querying the database"
            });
        } else if (data.length) {
            res.status(403).json(
                {
                    message: "Room for this class already exists"
                }
            );
        } else {
            var query = "INSERT INTO Class (CourseCode, Semester, Year) VALUES ('" + req.body.coursecode + "', '" + req.body.semester + "', '" + req.body.year + "')";
            db.executeQuery(query, function (err, insertRes) {
                if (err) {
                    console.error(err);
                    res.status(500).json({
                        error: "Failed creating new class: An unexpected error occurred when querying the database"
                    });
                } else {
                    // join class room as creator
                    joinClassRoom(req.body.userid, insertRes.insertId, 1, res);
                }
            });
        }
    });
};

exports.checkIsInClass = function (req, res) {
    if (req.session.userid) {
        var query = "SELECT * FROM Participant WHERE UserID = " + req.session.userid + 
            " AND ClassID = " + req.params.classid + 
            " AND Droped=0";
        db.executeQuery(query, function (err, data) {
            if (err) {
                console.error(err);
                res.status(500).json({
                    error: "An unexpected error occurred when querying the database"
                });
            } else if (data.length) {
                res.status(200).json({
                    inClass: 1
                });
            } else {
                res.status(200).json({
                    inClass: 0
                });
            }
        });
    } else {
        res.status(401).json({
            error: "User not logged in"
        });
    }
};