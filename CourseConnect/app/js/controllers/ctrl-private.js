'use strict';

var privateCtrls = angular.module('CtrlPrivate', []);

privateCtrls.directive('onErrorSrc', function($http) {
    return {
        link: function(scope, element, attrs) {
            element.bind('error', function() {
                if (attrs.src != attrs.onErrorSrc) {
                    attrs.$set('src', attrs.onErrorSrc);
                }
            });
        }
    };
});

privateCtrls.service('PrivateService', ['$http', '$routeParams', function ($http, $routeParams) {
    // check if current user and user with userid are friends
    this.checkIsFriend = function (userid) {
        var req = {
            method: "GET",
            url: "/api/isFriend/" + userid
        };

        return $http(req);
    };

    // pull messages between this two users
    this.getMessages = function (userid) {
        var req = {
            method: "GET",
            url: "/api/privatemessages/" + userid
        };

        return $http(req);
    };

    // send out a message
    this.sendMessage = function (toUserId, message) {
        var req = {
            method: "POST",
            url: "api/sendPrivateMsg",
            data: {
                toUserId: toUserId,
                message: message
            }
        };

        return $http(req);
    };

    this.getUsersInfo = function (userId) {
        var req = {
            method: "GET",
            url: '/api/friendInfo/' + userId
        };

        return $http(req);
    };

}]);


privateCtrls.controller('PrivateCtrl', ['$scope', '$http', 'fileUpload', '$cookies', '$location', '$routeParams', '$interval', 'CommonService', 'PrivateService', '$timeout',
    function ($scope, $http, fileUpload, $cookies, $location, $routeParams, $interval,  CommonService, PrivateService, $timeout) {
        console.log('PrivateCtrl is running');

        $scope.var_userValid = false;

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
            PrivateService.getMessages($routeParams.userid)
                .then(function (result) {
                    console.log(result);
                    if (result.status == 200) {
                        if (result.data.length > $scope.var_messages.length) {
                            $scope.var_messages = result.data;
                        }
                    }
                });
        };

        var submitmsgTimer;
        $scope.sendMsg = function () {
            PrivateService.sendMessage($routeParams.userid, CommonService.sqlEscapeString($scope.var_chat_message))
                .then(function () {
                    $scope.var_chat_message = "";

                    // do not execute previous callback if this request is submitted multiple times within a short time
                    if (submitmsgTimer) {
                        clearTimeout(submitmsgTimer);
                    }

                    submitmsgTimer = setTimeout(function() {
                        // fetch messages inmmediatly after posting succeed
                        $scope.fetchMessages();
                        // restart interval
                        $scope.msgInterval = $interval($scope.fetchMessages, 2500);
                    }, 200);
                });
            $interval.cancel($scope.msgInterval);
        };

        $scope.init = function () {
            $scope.var_userValid = true;

            $scope.var_messages = [];

            // pull messages
            $scope.fetchMessages();
            // poll for new messages every 2.5 seconds
            if ($scope.msgInterval) {
                $interval.cancel($scope.msgInterval);
            }
            $scope.msgInterval = $interval($scope.fetchMessages, 2500);

            PrivateService.getUsersInfo($routeParams.userid)
                .then(function (result) {
                    $scope.var_user_list = result.data;
                });
        };

        // only show chat room when user is logged in
        if (!CommonService.isLoggedIn()) {
            $location.path("/login");
        } else {
            // // only allow to chat when goal user and current user are friends
            // PrivateService.checkIsFriend($routeParams.userid)
            //     .then(function (result) {
            //         if (result.data.isFriend) {
            //             $scope.init();
            //         } else {
            //             $location.path("/"); // back to home page
            //         }
            //     });
            $scope.init();
        }

        $scope.$on("$destroy", function(){
            console.log("Leave private chatroom");
            $interval.cancel($scope.msgInterval);
        });
    }
]);

