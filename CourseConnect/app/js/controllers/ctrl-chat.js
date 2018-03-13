'use strict';

var chatCtrls = angular.module('CtrlChat', []);

chatCtrls.directive('onErrorSrc', function ($http) {
    return {
        link: function (scope, element, attrs) {
            element.bind('error', function () {
                if (attrs.src != attrs.onErrorSrc) {
                    attrs.$set('src', attrs.onErrorSrc);
                }
            });
        }
    };
});

chatCtrls.service('ChatService', ['$http', '$routeParams', function ($http, $routeParams) {
    // get classroom info with current user and its permissions
    this.getClassWithUserPermission = function (classid) {
        var req = {
            method: "GET",
            url: "/api/getClass/" + classid,
        };

        return $http(req);
    };

    // Gets list of classmates in current chatroom.
    this.getAllClassMates = function (callbackFcn) {
        $http.post('/api/allClassmatesInClass', { classid: $routeParams.classid }).then(function (res) {
            callbackFcn(res.data);
        });
    };

    // pull messages for this classroom
    this.getMessages = function (classid) {
        var req = {
            method: "GET",
            url: "/api/messages/" + classid
        };

        return $http(req);
    };

    // send out a message
    this.sendMessage = function (pId, message) {
        var req = {
            method: "POST",
            url: "api/sendMsg",
            data: {
                pId: pId,
                message: message
            }
        };

        return $http(req);
    };

    // Allows user to send anonymously WITHOUT the need to reveal any info.
    this.sendAnonymously = function(pId, message) {
        var req = {
            method: "POST",
            url: "api/sendMsg",
            data: {
                pId: pId,
                anon: 1,
                message: message
            }
        };

        return $http(req);
    };

    // join class as Student
    this.joinClass = function (classid) {
        var req = {
            method: "GET",
            url: "/api/joinclass/" + classid
        };

        return $http(req);
    };

    this.sendFriendReq = function(friendRq){
        $http.post('api/sendFriendRequest', friendRq)
        .success(function (res){
            alert(res.msg);
        })
        .error(function (res){
            alert('Error: An unexpected error occured. Please try later.')
        })
    }

}]);

chatCtrls.service('PostService', ['$http', function ($http) {
    // Service to create post
    this.sendPost = function (postMsg, callback) {
        $http.post('/api/sendPost', postMsg)
            .success(function () {
                callback();
            })
            .error(function (res) {
                alert('Error: An unexpected error occured.');
            });
    };

    this.sendPostAnonymously = function(postMsg, callback) {
        $http.post('/api/sendPostAnon', postMsg)
            .success(function() {
                callback();
            })
            .error(function(res) {
                alert('Error: An unexpected error occured.');
            });
    };

    // Service to retrieve all posts for given class
    this.getPosts = function (roomID, callback) {
        $http.post('/api/getPosts', { roomID }).success(function (res) {
            callback(res.postList);
        })
            .error(function (res) {
                alert('Error: An unexpected error occured. Try refreshing the page.');
            });
    };

    // Service to retrieve all followups for given post
    this.displayFollowupList = function (postID, callback) {
        $http.post('/api/getFollowups', { postID })
            .success(function (res) {
                callback(res.followupList);
            })
            .error(function (res) {
                alert('Error: An unexpected error occured. Try refreshing the page.');
            });
    };

    this.displayPostTags = function (callback) {
        $http.get('/api/getPostTags')
            .success(function (res) {
                callback(res.postTagList);
            })
            .error(function (res) {
                alert('Error: An unexpected error occured for fetch post tags.');
            })
    }

}]);


chatCtrls.controller('ChatCtrl', ['$scope', '$http', 'fileUpload', '$cookies', '$location', '$routeParams', '$interval', 'CommonService', 'ChatService', 'PostService', '$timeout', '$window',
    function ($scope, $http, fileUpload, $cookies, $location, $routeParams, $interval, CommonService, ChatService, PostService, $timeout, $window) {
        console.log('ChatCtrl is running');

        $scope.var_userValid = false;

        $scope.var_messages = [];
        $scope.var_resources = [];//To store the file for display
        $scope.postList = [];
        $scope.followupList = [];
        $scope.selectedPost = {};
        $scope.postTagList = [];
        $scope.selectedtTag = {};
        $scope.filterTag = { tag_name: "All Tag" };

        // get name of classroom
        $scope.getRoomName = function () {
            return $scope.room_data.courseCode + " " + CommonService.getSemesterName($scope.room_data.semester) + " " + $scope.room_data.year;
        };

        $scope.uploadFile = function (file) {
            var file = $scope.userFile;
            var storedFileloc;
            var uploadUrl = "/api/file-upload";
            fileUpload.uploadFileToUrl(file, uploadUrl, $scope.getRoomName());
            $http.post('/api/file-store', { classid: $routeParams.classid, file: file.name })
                .then(function (res) {
                    storedFileloc = res.data;
                    console.log("The file has been stored at " +
                        storedFileloc[0].fileLocation);
                    $scope.displayResource();
                });
        };

        /*$scope.search = function(){
            $http.post('/api/findFile', {fileName : $scope.var_search_info, chatRoom : $scope.getRoomName()})
                .then(function(res){
                console.log(123);

            });

        };*/

        $scope.deleteResource = function ($event) {
            var fileName = $event.currentTarget.value;

            $http.post('/api/deleteFile', { chatRoom: $scope.getRoomName(), classid: $routeParams.classid, fileName: fileName })
                .then(function (res) {
                    if (res.data == true) {
                        console.log("Deletion is successful");
                        $scope.displayResource();
                    }
                });
        };

        $scope.displayResource = function () {
            $http.get('/api/files/' + $routeParams.classid).then(function (res) {
                if (typeof $scope.var_search_info == 'undefined') {
                    $scope.var_search_info = '';
                }
                $scope.var_resources = [];
                //console.log(res.data[1].fileLocation);
                //console.log(res.data[2].fileLocation);
                for (var i in res.data) {
                    console.log("The file name is " + res.data[i].fileLocation.split("/")[2]);
                    if (res.data[i].fileLocation.split("/")[2].toUpperCase().indexOf
                        ($scope.var_search_info.toUpperCase()) != -1) {
                        //display the info in html and set up the link for downloading
                        $scope.var_resources.push({
                            "items": res.data[i].fileLocation.split("/")[2],
                            "address": res.data[i].fileLocation,
                            "display": true
                        });
                    }
                }
            });
            //TODO : implement it when the users need to see all the files
        };

        $scope.isCurrentUser = function (userId) {
            if (userId == CommonService.getUserId()) {
                return true;
            } else {
                return false;
            }
        };

        $scope.onChatMessageKeyPress = function ($event) {
            if ($event.which === 13) {
                $scope.sendMsg();

            }
        };

        $scope.fetchMessages = function () {
            ChatService.getMessages($routeParams.classid, $scope.lastMessageId, 100)
                .then(function (result) {
                    if (result.status == 200) {
                        if (result.data.length > $scope.var_messages.length) {
                            $scope.var_messages = result.data;
                            var lastUId = $scope.var_messages[$scope.var_messages.length - 1].userId;
                            if ($scope.classmateWatcher.indexOf("" + lastUId) < 0) {
                                $scope.classmateWatcher += " " + lastUId;
                                ChatService.getAllClassMates(function (data) { $scope.var_user_list = data; });
                            }

                        }
                    }
                });
        };

        var submitmsgTimer;
        $scope.sendMsg = function () {
            ChatService.sendMessage($scope.room_data.participantId, CommonService.sqlEscapeString($scope.var_chat_message))
                .then(function () {
                    $scope.var_chat_message = "";

                    // do not execute previous callback if this request is submitted multiple times within a short time
                    if (submitmsgTimer) {
                        clearTimeout(submitmsgTimer);
                    }

                    submitmsgTimer = setTimeout(function () {
                        // fetch messages inmmediatly after posting succeed
                        $scope.fetchMessages();
                        // restart interval
                        $scope.msgInterval = $interval($scope.fetchMessages, 2500);
                    }, 200);
                });
            $interval.cancel($scope.msgInterval);
        };

        // Sending message anonymously.
        $scope.sendMsgAnon = function() {
            ChatService.sendAnonymously($scope.room_data.participantId, CommonService.sqlEscapeString($scope.var_chat_message))
                .then(function() {
                    $scope.var_chat_message = "";
                    if(submitmsgTimer) {
                        clearTimeout(submitmsgTimer);
                    }

                    submitmsgTimer = setTimeout(function() {
                        $scope.fetchMessages();
                        $scope.msgInterval = $interval($scope.fetchMessages,2500);
                    }, 200);
                });
            $interval.cancel($scope.msgInterval);
        };

        $scope.checkIfAnonymous = function(user) {
            if(user.u_id !== 50) {
                return user;
            }
        }

        // Grabbing course ID for direct unenrollment and going back to courseenrollment.html page.
        $scope.var_course_id = $routeParams.classid;
        $scope.directUnenrollment = function(course_id) {
            console.log(course_id);
            $http.post('/api/crsunenroll', {classid : course_id}).then(function(res) {
                console.log("Unenrolled from course!");
                window.location.replace('#/courseenroll');
            });
        };

        // ---------------POST FOURM FUNCTION--------------------------

        $scope.loadPosts = function () {
            PostService.getPosts($scope.room_data.courseId, function (postList) {
                $scope.postList = postList;
            });
        };

        $scope.loadPostFourm = function () {
            $scope.loadPosts();

            PostService.displayPostTags(function (postTagList) {
                $scope.postTagList = postTagList;
                $scope.tagSelected = postTagList[0];
            });
        };

        $scope.searchPost = function (keyWord, authorName, tag) {
            PostService.getPosts($scope.room_data.courseId, function (postList) { //make sure the iteration is not on
                //an empty list

                //var keyWord = $scope.keyWord;
                if (typeof keyWord == 'undefined' || !keyWord) {
                    keyWord = '';
                }

                if (typeof authorName == 'undefined' || !authorName) {
                    authorName = '';
                }


                //var posts = $scope.postList;
                var display = [];
                for (var i in postList) {
                    var checkName = postList[i].FirstName + " " + postList[i].LastName;
                    if ((postList[i].description.toUpperCase() + postList[i].Title.toUpperCase()).
                        indexOf(keyWord.toUpperCase()) != -1 && checkName.toUpperCase().
                            indexOf(authorName.toUpperCase()) != -1) {

                        if ($scope.filterTag.tag_name == "All Tag" || postList[i].tag_ID == $scope.filterTag.tag_ID) {
                            display.push(postList[i]);
                        }
                    }
                }
                $scope.postList = [];
                $scope.postList = display;
            });
        };

        $scope.postQuestion = function (summary, detail, anonymously) {
            // TODO: Get userID and RoomID
            var time = new Date().getFullYear() + "-" + new Date().getMonth() + "-" + new Date().getDate();
            var post = {
                title: summary,
                description: detail,
                solve: "unsolved",
                timestamp: time,
                parentPostID: -1,
                roomID: $scope.room_data.courseId,
                snipet: detail,
                tagID: $scope.tagSelected.tag_ID
            };

            if (anonymously) {
                PostService.sendPostAnonymously(post, $scope.loadPosts);
            } else {
                PostService.sendPost(post, $scope.loadPosts);
            }
            $(post_ques_summary).val('');
            $(post_ques_detail).val('');
        };

        $scope.displaySelectedPost = function (post) {
            $scope.selectedPost = post;
            $scope.displaySolution(post);
            $scope.displayFollowupList(post);
        };


        $scope.postFollowup = function (detail, anonymously) {
            //TODO: Allow user to post followup
            var time = new Date().getFullYear() + "-" + new Date().getMonth() + "-" + new Date().getDate();
            var followupPost = {
                title: null,
                description: detail,
                timestamp: time,
                parentPostID: $scope.selectedPost.po_id,
                roomID: $scope.room_data.courseId,
                snipet: null, accepted: false
            };

            if (anonymously) {
                PostService.sendPostAnonymously(followupPost, function() {
                    $scope.displayFollowupList($scope.selectedPost);
                });
            } else {
                PostService.sendPost(followupPost, function () {
                    $scope.displayFollowupList($scope.selectedPost);
                });
            }

            $(followupTextInput).val('');

        };

        $scope.displayFollowupList = function (post) {
            $http.post('/api/checkIdentity', { id: post.po_id }).success(function (res) {
                $scope.adoptButton = res.equal;
            });
            PostService.displayFollowupList(post.po_id, function (followupList) {
                $scope.followupList = followupList;
                //$scope.adoptButton = true; // subject to change
            });

        }

        $scope.selectTag = function (tag) {
            $scope.tagSelected = tag;

        }

        $scope.selectFilterTag = function (tag) {
            $scope.filterTag = tag;
        }

        $scope.adoptFollowup = function (post, parent, $event) {

            var adoptSol = $event.currentTarget.value
            //Choose the follow-up to accept as solution
            //Access to database and store its id under the parent post
            $http.post("/api/adoptAFollowup", { post: post, parent: parent, adopt: adoptSol }).success(function (res) {

                console.log("Successfully adopted answer");
                //post.accepted = true;
                //$scope.displaySelectedPost(parent);
                //$scope.backToPage();
                //$scope.loadPosts();
                //$scope.init();
                $scope.var_forum = 'posts';
                //$scope.loadPosts();
                $scope.selectedPost = res.select[0];
                console.log(res.select[0].solution)
                console.log(post.po_id);
                console.log("Is it adopted: " + res.select[0].solution == post.po_id);
                $scope.loadPosts();
                $scope.displaySelectedPost(res.select[0]);
                $scope.displaySolution(res.select[0]);
                //$scope.displayFollowupList(res.select[0]);
                //PostService.displayFollowupList(select, function (followupList) {
                //  $scope.followupList = followupList;
                //});

                //$window.setTimeout(function() {  $scope.displaySelectedPost(parent);
                //}, 2000);

                //console.log($scope.selectedPost.po_id);
            });
        };

        $scope.unAdoptFollowup = function (post, parent) {
            console.log("We are here to unadopt the answer");
            $http.post("/api/adoptAFollowup", { post: post, parent: parent, adopt: "unadopt" }).success(function (res) {

                console.log("Successfully unadopted answer");
                $scope.var_forum = 'posts';
                //$scope.loadPosts();
                $scope.selectedPost = res.select[0];
                console.log(res.select[0].solution)
                //console.log(post.po_id);
                //console.log("Is it adopted: " + res.select[0].solution == post.po_id);
                $scope.displaySolution(res.select[0]);
                $scope.loadPosts();
                $scope.displaySelectedPost(res.select[0]);
                //$scope.displayFollowupList(res.select[0]);
                //PostService.displayFollowupList(select, function (followupList) {
                //  $scope.followupList = followupList;
                //});

                //$window.setTimeout(function() {  $scope.displaySelectedPost(parent);
                //}, 2000);

                //console.log($scope.selectedPost.po_id);
            });

        };

        // $scope.displaySolution = function(post){
        //   console.log("Now loading the answer to the question");
        //   $http.post('/api/checkIdentity', {id: post.po_id}).success(function(res){
        //         $scope.adoptButton = res.equal;
        //   });
        //   $http.post("/api/displaySol", {solution: post.solution}).success(function(res){
        //       //TODO: Display the info in the modal
        //       $scope.solutionPost = res.solInfo[0];
        //       console.log("Name is")


        //   });
        // };
        $scope.submitReport = function (post) {
            $http.post('/api/reportComplaint', { title: $scope.subject[post.po_id], quote: post, description: $scope.description[post.po_id] }).then(function (res) {
                if (res.data.reported == true) {
                    alert("Report successfully filed.");
                } else {
                    alert("Report failed. Please try again or contacy system administrator.");
                }
            })

        }

        $scope.adoptFollowup = function (post, parent, $event) {

            var adoptSol = $event.currentTarget.value
            $scope.solutionPost = post;
            //Choose the follow-up to accept as solution
            //Access to database and store its id under the parent post
            $http.post("/api/adoptAFollowup", { post: post, parent: parent, adopt: adoptSol }).success(function (res) {

                console.log("Successfully adopted answer");
                //post.accepted = true;
                //$scope.displaySelectedPost(parent);
                //$scope.backToPage();
                //$scope.loadPosts();
                //$scope.init();
                $scope.var_forum = 'posts';
                //$scope.loadPosts();
                $scope.selectedPost = res.select[0];
                console.log(res.select[0].solution)
                console.log(post.po_id);
                console.log("Is it adopted: " + res.select[0].solution == post.po_id);
                $scope.loadPosts();
                $scope.displaySelectedPost(res.select[0]);
                $scope.displaySolution(res.select[0]);
                //$scope.displayFollowupList(res.select[0]);
                //PostService.displayFollowupList(select, function (followupList) {
                //  $scope.followupList = followupList;
                //});

                //$window.setTimeout(function() {  $scope.displaySelectedPost(parent);
                //}, 2000);

                //console.log($scope.selectedPost.po_id);
            });
        };

        $scope.unAdoptFollowup = function (post, parent) {
            console.log("We are here to unadopt the answer");
            $http.post("/api/adoptAFollowup", { post: post, parent: parent, adopt: "unadopt" }).success(function (res) {

                console.log("Successfully unadopted answer");
                $scope.var_forum = 'posts';
                //$scope.loadPosts();
                $scope.selectedPost = res.select[0];
                console.log(res.select[0].solution)
                //console.log(post.po_id);
                //console.log("Is it adopted: " + res.select[0].solution == post.po_id);
                $scope.displaySolution(res.select[0]);
                $scope.loadPosts();
                $scope.displaySelectedPost(res.select[0]);
                //$scope.displayFollowupList(res.select[0]);
                //PostService.displayFollowupList(select, function (followupList) {
                //  $scope.followupList = followupList;
                //});

                //$window.setTimeout(function() {  $scope.displaySelectedPost(parent);
                //}, 2000);

                //console.log($scope.selectedPost.po_id);
            });

        };

        $scope.displaySolution = function (post) {
            console.log("Now loading the answer to the question");
            $http.post('/api/checkIdentity', { id: post.po_id }).success(function (res) {
                $scope.adoptButton = res.equal;
            });
            $http.post("/api/displaySol", { solution: post.solution }).success(function (res) {
                //TODO: Display the info in the modal
                $scope.solutionPost = res.solInfo[0];
                console.log("Name is")


            });
        };

        $scope.backToPage = function () {
            $scope.selectedPost = {};
            $scope.loadPosts();

        }

        $scope.sendFriendReq = function(user){
            var friendRq = {
                sender: CommonService.getUserId(),
                receiver: user.u_id
            }
            ChatService.sendFriendReq(friendRq);
        }

        // ^^^^^^^^^^^^^^POST FOURM FUNCTION^^^^^^^^^^^^^^^^^^^^^^^^^^^^

        $scope.init = function () {
            $scope.var_userValid = true;

            // get room data with current user's permission on it
            ChatService.getClassWithUserPermission($routeParams.classid)
                .then(function (result) {
                    $scope.room_data = result.data;
                    // set room name
                    $scope.var_room_name = $scope.getRoomName();
                    $scope.loadPostFourm();
                });
            // set Chat Room as default forum
            $scope.var_forum = "chatroom";
            $scope.classmateWatcher = "";

            $scope.displayResource();

            // pull messages
            $scope.fetchMessages();
            // poll for new messages every 2.5 seconds
            if ($scope.msgInterval) {
                $interval.cancel($scope.msgInterval);
            }
            $scope.msgInterval = $interval($scope.fetchMessages, 2500);

            ChatService.getAllClassMates(function (data) { $scope.var_user_list = data; });

            $scope.friendReqPopover = {
                content: 'Hello, World!',
                templateUrl:'/../templates/FriendRequest.html' ,
                title: 'Wanna be friend?'
            };

            $scope.friendChatPopover = {
                templateUrl:'/../templates/FriendChatPopover.html'
            };

            $scope.goTo = function (url) {
                $location.path(url);
            };
        };

        // only show chat room when user is logged in
        if (!CommonService.isLoggedIn()) {
            $location.path("/login");
        } else {
            // only show chat room when user is enrolled in it
            CommonService.checkIfInClass($routeParams.classid)
                .then(function (result) {
                    if (result.data.inClass) {
                        $scope.init();
                    } else {
                        var joinClass = confirm("You are not enrolled in this class. Do you want to join as Student?");
                        if (joinClass) {
                            ChatService.joinClass($routeParams.classid)
                                .then(function (result) {
                                    $scope.init();
                                })
                                .catch(function (e) {
                                    $location.path("/");
                                });
                        } else {
                            $location.path("/"); // back to home page
                        }
                    }
                });
        }

        $scope.$watch("var_forum", function () {
            if ($scope.var_forum == "resources") {
                $scope.displayResource();
            }
        });

        $scope.$on("$destroy", function () {
            console.log("destroy");
            $interval.cancel($scope.msgInterval);
        });
    }
]);