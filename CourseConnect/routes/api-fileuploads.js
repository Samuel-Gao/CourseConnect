// Route handler of App server.
"use strict;"

var db = require('./db_connection');  // db manager
var chatRoom;

exports.setRoom = function(req, res) {
    if (req.body.chatroom != 'default') {
        chatRoom = req.body.chatroom;
    }
};

exports.findFile = function(req, res){
    var query = "Select r_id, fileLocation from Resources AS r INNER JOIN Participant AS p ON r.ParticipantID=p.p_id INNER " +
        "JOIN Class AS c ON c.c_id=p.ClassID WHERE c.c_id='" + req.params.classid + "';";
    db.executeQuery(query, function (err, result){
        if(err){
            console.log("ERROR: Failed to retrieve fileLocation. Error: " + err);
            res.status(404);
        }
        res.status(200).send(result);
    });
};

exports.uploadFile = function(req, res){
    var fs = require('fs');
    var mkdirp = require('mkdirp');
    console.log(req.files.file.name);
    console.log("The chatRoom is " + chatRoom);


    var fileLocation = __dirname + "/../app/file/" + chatRoom + "/" + req.files.file.name;
    mkdirp(__dirname + "/../app/file/" + chatRoom, function(err){
        if (err){
            console.log(err);
        }
        fs.writeFile(fileLocation, req.files.file.data, function(err){
            if (err){
                console.log(err);
            }

            console.log("The file is saved!")
        });
    });
};

exports.deleteFile = function(req, res) {
    var classid = req.body.classid;
    var userId = req.session.userid;
    var p_id;
    var r_id;

    var query3 = "Select p_id from Participant Where UserID='" + userId + "' and ClassID='" + classid + "';";
    db.executeQuery(query3, function (err, result) {
        if (err) {
            console.log("ERROR: Failed to retrive p_id. Error: " + err);
            res.status(404);
        }
        //var resourceTime = new Date();
        p_id = result[0].p_id;
        var query4 = "Select r_id from Resources Where fileLocation='" + req.body.fileName + "' and ParticipantID='" + p_id + "';";
        db.executeQuery(query4, function(err, result){
            if(err){
                console.log("ERROR: Failed to retrieve r_id. Error:" + err);
                res.status(404);
            }
            r_id = result[0].r_id;
            var queryDel = "DELETE FROM Resources Where r_id='" + r_id + "';";
            db.executeQuery(queryDel, function(err, result){
                if(err){
                    console.log("ERROR: Failed to delete the file. Error: " + err);
                    res.status(404);
                }
                res.status(200).send(true);
            });
        });
    });

};

exports.storeFile = function(req, res){
    var classid = req.body.classid;
    var userId = req.session.userid;
    var p_id;

    var query3 = "Select p_id from Participant Where UserID='" + userId + "' and ClassID='" + classid + "';";
    db.executeQuery(query3, function(err, result){
        if(err){
            console.log("ERROR: Failed to retrive p_id. Error: " + err);
            res.status(404);
        }
        var resourceTime = new Date();
        p_id = result[0].p_id;
        var query4 = "Insert INTO Resources(resourceTime, fileLocation, ParticipantID) Select * FROM (Select '" + resourceTime +
            "', 'file/" + chatRoom + "/" + req.body.file + "', '" + p_id + "') AS tmp WHERE NOT EXISTS (SELECT fileLocation, ParticipantID" +
            " FROM Resources WHERE fileLocation='file/" + chatRoom + "/" + req.body.file + "' and ParticipantID='" + p_id + "') LIMIT 1;";
        db.executeQuery(query4, function(err, result){
            if(err){
                console.log("ERROR: Failed to insert filelocation to Resources. Error:" + err);
                res.status(404);
            }
            var query5 = "Select fileLocation from Resources Where fileLocation='" + "file/" + chatRoom + "/" + req.body.file + "';";
            db.executeQuery(query5, function(err, result){
                if(err){
                    console.log("ERROR: Failed to retrieve fileLocation from Reousrces. Error: " + err);
                    res.status(404);
                }
                res.status(200).send(result);
            });


        });
    });
    /*var query3 = "SELECT fileLocation FROM Users WHERE u_id=" + result[0].user_id + ";";
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
     })
     })*/

};

