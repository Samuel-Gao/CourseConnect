// Route handler of App server.
"use strict;"

var db = require('./db_connection');  // db manager

// Query DB to inject post.
exports.sendPost = function(req, res){
    //var isSolved = (req.body.solve == 'solved');
    if (req.session.userid) {
        var injectPostQuery;
        if (req.body.anon) {
            injectPostQuery =
                "INSERT INTO cscc01.Posts (Title, postTime, description, ParticipantID, Parent_PO_id, room_id, snipet, tag_ID, solved, Anonymously) " +
                "VALUES (" +
                '"' + req.body.title + '",' +
                '"' + req.body.timestamp + '",' +
                '"' + req.body.description + '",' +
                '"' + req.session.userid + '",' +
                '"' + req.body.parentPostID + '",' +
                '"' + req.body.roomID + '",' +
                '"' + req.body.snipet + '",' +
                '"' + req.body.tagID + '",' +
                '"' + req.body.solve + '"' +
                ", 1)";
        } else {
            injectPostQuery =
                "INSERT INTO cscc01.Posts (Title, postTime, description, ParticipantID, Parent_PO_id, room_id, snipet, tag_ID, solved) " +
                "VALUES (" +
                '"' + req.body.title + '",' +
                '"' + req.body.timestamp + '",' +
                '"' + req.body.description + '",' +
                '"' + req.session.userid + '",' +
                '"' + req.body.parentPostID + '",' +
                '"' + req.body.roomID + '",' +
                '"' + req.body.snipet + '",' +
                '"' + req.body.tagID + '",' +
                '"' + req.body.solve + '"' +
                ")";
        }

        db.executeQuery(injectPostQuery, function(err){
            if (err){
                console.error("ERROR: Failed to inject post into DB. Query: " + injectPostQuery + err);
                res.status(500).json({
                    error: "An unexpected error occurred when querying the database",
                    success:false
                });
            }else{
                console.log("SUCCESS: Post injected to DB successfully");
                res.status(200).json({
                    message: "Post injected to DB successfully.",
                    success:true
                });
            }
        })
    } else {
        res.status(401).json({
            error: "User not logged in"
        });
    }
}

exports.sendPostAnon = function(req, res) {
    req.body.anon = 1;
    exports.sendPost(req, res);
    // var createAnonymousID = "INSERT INTO Participant(UserID, ClassID, RoleID) VALUES(50," + req.body.roomID + ",4) ON DUPLICATE KEY UPDATE UserID=50 AND ClassID="+ req.body.roomID + ";";
    //
    // db.executeQuery(createAnonymousID, function(baderr) {
    //         if(baderr) {
    //             console.error(baderr);
    //             res.status(500).json({
    //                 error: "Unable to post as anonymous user in chatroom."
    //             });
    //         } else {
    //             var injectPostQuery =
    //                 "INSERT INTO Posts (Title, postTime, description, ParticipantID, Parent_PO_id, room_id, snipet) " +
    //                 "VALUES(" +
    //                     '"' + req.body.title + '",' +
    //                     '"' + req.body.timestamp + '",' +
    //                     '"' + req.body.description + '",' +
    //                     '"50",' +
    //                     '"' + req.body.parentPostID + '",' +
    //                     '"' + req.body.roomID + '",' +
    //                     '"' + req.body.snipet + '"' +
    //                 ");";
    //
    //             db.executeQuery(injectPostQuery, function(err) {
    //                 if(err) {
    //                     console.error("ERROR: Failed to inject post into DB. Query: " + injectPostQuery + err);
    //                     res.status(500).json({
    //                         error: "An unexpected error occurred when querying the database",
    //                         success:false
    //                     });
    //                 } else {
    //                     console.log("SUCCESS: Anonymous post injected to DB successfully");
    //                     res.status(200).json({
    //                         message: "Anonymous post injected to DB successfully.",
    //                         success: true
    //                     });
    //                 }
    //             });
    //         }
    // });
}

// Query DB to retrieve posts for given chatroom. 
exports.getPosts = function(req, res){

    var getPostQuery =
        "SELECT *, " +
        "DATE_FORMAT(postTime,'%d/%m/%Y') as postTime, " +
        "CASE WHEN Anonymously = 1 THEN 'Anonymous' " +
        "WHEN Anonymously = 0 AND (Users.DisplayName IS NULL OR Users.DisplayName = '') THEN CONCAT(Users.FirstName, ' ', Users.LastName) ELSE Users.DisplayName END AS name " +
        "FROM " +
        "cscc01.Posts " +
        "INNER JOIN cscc01.Users ON Posts.participantID=Users.u_id " +
         "INNER JOIN cscc01.PostTag on Posts.tag_ID = PostTag.tag_ID " +
        "WHERE room_id=" + req.body.roomID + " " +
        "AND parent_po_id=-1 " + 
        "ORDER BY po_id DESC";

    db.executeQuery(getPostQuery, function(err, result){
        if (err){
            console.error("ERROR: Failed to get posts from DB. Query: " + getPostQuery + err);
            res.status(500).json({
                error: "An unexpected error occurred when querying the database",
                success:false
            });
        }else{
            console.log("SUCCESS: Retrieved list of post.");
             res.status(200).json({
                postList: result,
                success:true
            });
        }
        
    })    
}

// Query DB to retrieve follow up posts for given post. 
exports.getFollowups = function(req, res){
    var getFollowupsQuery = 
        "SELECT *, " +
        "DATE_FORMAT(postTime,'%d/%m/%Y') as postTime, " +
        "CASE WHEN Anonymously = 1 THEN 'Anonymous' " +
        "WHEN Anonymously = 0 AND (Users.DisplayName IS NULL OR Users.DisplayName = '') THEN CONCAT(Users.FirstName, ' ', Users.LastName) ELSE Users.DisplayName END AS name " +
        "FROM " +
        "cscc01.Posts " +
        "INNER JOIN cscc01.Users ON Posts.participantID=Users.u_id " +
        "WHERE parent_po_id=" + req.body.postID;
    
    db.executeQuery(getFollowupsQuery, function(err, result){
        if (err){
            console.error("ERROR: Failed to get followup posts from DB. Query: " + getFollowupsQuery + err);
            res.status(500).json({
                error: "An unexpected error occurred when querying the database",
                success:false
            });
        }else{
            console.log("SUCCESS: Retrieved list of post.");
             res.status(200).json({
                followupList: result,
                success:true
            });
        }
        
    })    
};

exports.displaySol = function(req, res){
    var query = "Select *, " +
        "CASE WHEN Anonymously = 1 THEN 'Anonymous' " +
        "WHEN Anonymously = 0 AND (Users.DisplayName IS NULL OR Users.DisplayName = '') THEN CONCAT(Users.FirstName, ' ', Users.LastName) ELSE Users.DisplayName END AS name " +
        "from cscc01.Posts INNER JOIN cscc01.Users ON Posts.participantID=Users.u_id " +
        "Where po_id=" + req.body.solution + ";";
    db.executeQuery(query, function(err, result){
        if(err){
            console.error("ERROR: Failed to retrieve the solution from required post" + query + err);
            res.status(500).json({error: "An unexpected error occured when querying the database", success: false});
        }else{
            res.status(200).json({solInfo: result, success: true});
        }
    });

};


exports.checkIdentity = function(req, res){
    var grabAuthor = "Select * from cscc01.Posts Where po_id=" + req.body.id + ";";
    db.executeQuery(grabAuthor, function(err, result){
       if(err){

       } else{
            res.status(200).json({equal: (result[0].ParticipantID == req.session.userid), success: true});
       }
    });
}

//Todo: get all tag
exports.getPostTags = function(req, res){
    var getTagsQuery = 
        "SELECT * " + 
        "FROM cscc01.PostTag";
    
    db.executeQuery(getTagsQuery, function(err, result){
        if (err){
            console.error("ERROR: Failed to list of post tag. Query: " + getTagsQuery + err);
            res.status(500).json({
                error: "An unexpected error occurred when querying the database",
                success:false
            });
        }else{
            console.log("SUCCESS: Retrieved list of tags.");
             res.status(200).json({
                postTagList: result,
                success:true
            });
        }
    })
}

exports.adoptAFollowup = function(req, res){
           var parentID = req.body.parent.po_id;
            var addSolution;
            console.log("adopt is " + req.body.adopt);
           if(req.body.adopt == "adopt") {
               addSolution = "UPDATE cscc01.Posts SET Posts.solved='solved', Posts.solution=" + req.body.post.po_id + " " +
                   "Where po_id=" + parentID + ";";
           } else if(req.body.adopt == "unadopt"){
                console.log("Here to unadopt");
                addSolution = "UPDATE cscc01.Posts SET Posts.solved='unsolved', Posts.solution=NULL Where po_id="
               + parentID + ";";
           }

           db.executeQuery(addSolution, function(err, result){
                if(err){
                    console.error("ERROR: Failed to add the solution from DB. Query: " + addSolution + err);
                    res.status(500).json({error: "An unexpected error occured when querying the database",
                        success: false});
                }else{
                    console.log("The parent id is "+ parentID);
                    var retrieveParent = "Select * from cscc01.Posts INNER JOIN cscc01.Users" +
                        " ON Posts.participantID=Users.u_id " +
                        "Where po_id=" + parentID + ";";
                    db.executeQuery(retrieveParent, function(err, result){
                        if(err){
                            console.error("ERROR: Failed to retrieve the parent id from DB. Query: " + retrieveParent +
                                err);
                            res.status(500).json({error: "An unexpected error occured when querying the database",
                                success: false});
                        }else{
                            console.log("Hello");
                            console.log("The parent is " + result);
                            res.status(200).json({select: result, success: true});
                        }

                    });
                   //res.status(200).json({success: true})
                }
           })
       //}
    //});
};

exports.submitComplaint = function (req, res) {
    console.log(req.body.quote.po_id);
    var recordComplaint = "INSERT INTO Complaints (User, Summary, PostNum, Description) VALUES (" + req.session.userid + ", '" + req.body.title + "', " + req.body.quote.po_id + ", '" +
        req.body.description + "');";
    db.executeQuery(recordComplaint, function(err, result) {
        if (err) {
            coneole.error("ERRPR: failed to submit complaint. Error: " + err);
            res.status(500).json({
                error: "An unexpected error occurred when querying the database",
                reported: false
            });
        }
        res.status(200).json({
            result: result,
            reported: true
        });
    })
}
