'use strict';

/* App Modules of TD-Portal */

var tdPortal = angular.module('courseConnect', [
    'ngAnimate',
    'ui.bootstrap',
    'ngScrollGlue',
    'ngRoute',
    'Directives',
    'Services',
    'Filters',
    'CtrlIndex',
    'CtrlChat',
    'CtrlPrivate',
    'CtrlUserLogin',
    'CtrlUserSignup',
    'CtrlUserProfile',
    'CtrlSettings',
    'CtrlCourseEnroll',
	'CtrlFriends',
    'ngCookies'
]);

/* App route */
tdPortal.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: '/templates/HomePage.html'
    })
    .when('/userprofile', {
        templateUrl: '/templates/userprofile.html',
        controller: 'UserProfileCtrl'
    })
    .when('/courseenroll', {
        templateUrl: '/templates/courseenrol.html',
        controller: 'CourseEnrollCtrl'
    })
    .when('/settings', {
        templateUrl: '/templates/settings.html',
        controller: 'SettingsCtrl'
    })
	.when('/friends', {
        templateUrl: '/templates/friends.html',
        controller: 'FriendsCtrl'
    })
    .when('/class/:classid', {
        templateUrl: '/templates/ChatRoom.html',
        controller: 'ChatCtrl'
    })
    .when('/private/:userid', {
        templateUrl: '/templates/PrivateChat.html',
        controller: 'PrivateCtrl'
    })
    .when('/signup', {
        templateUrl: '/templates/signUp.html',
        controller: 'SignUpCtrl'
    })
    .when('/login', {
        templateUrl: '/templates/login.html',
        controller: 'LoginCtrl'
    })
    .when('/logout', {
        templateUrl: '/templates/HomePage.html',
        controller: 'LogOutCtrl'
    })
    .when('/loggedin', {
        templateUrl: '/templates/loggedin.html'
    })
    .otherwise({
        templateUrl: '/templates/PageNotFound.html'
    });
}]);

tdPortal.factory('myInterceptor', ['$q', '$cookies', function($q, $cookies) {
    return {
        responseError: function(rejection) {
            if(rejection.status <= 0) {
                $cookies.remove('currUser');
                return;
            }
            return $q.reject(rejection);
        }
    };
}]);

tdPortal.config(['$httpProvider', function($httpProvider) {
    // watch server status and clear cookie when server down
    $httpProvider.interceptors.push('myInterceptor');
}]);

/* Global functions and constants */
tdPortal.service('CommonService', CommonService);
CommonService.$inject = ['$http', '$cookies'];
function CommonService($http, $cookies) {
    console.log("CommoneService is running");

    // User info
    var curr_user;
    if ($cookies.getObject("currUser")) {
        curr_user = $cookies.getObject("currUser");
    } else {
        curr_user = {
            initialized: 0,
            loggedIn: 0
        };
    }

    // setUser when logged in and when update profile
    // TODO: call setUser when profile is updated
    var setUser = function () {
        var req = {
            method: "GET",
            url: "/api/getUser",
        };

        $http(req)
            .then(function (result) {
                if (result.status == 200) {
                    curr_user.initialized = 1;
                    curr_user.loggedIn = 1;
                    curr_user.userId = result.data.userId;
                    curr_user.lastName = result.data.lastName;
                    curr_user.firstName = result.data.firstName;
                    curr_user.email = result.data.email;
                    curr_user.displayName = result.data.displayName;
                    curr_user.description = result.data.description;
                    curr_user.utorId = result.data.utorId;
                    curr_user.profilePic = result.data.profilePic;
                    notifyUserLoginLogout();
                    $cookies.putObject('currUser', curr_user);
                } else {
                    curr_user.initialized = 1;
                    curr_user.loggedIn = 0;
                    $cookies.putObject('currUser', curr_user);
                }
            });
    };

    // on init and on refresh, check user login status
    setUser();

    var userReady = function () {
        return curr_user.initialized;
    };

    var logout = function () {
        $http.get('/api/logout').then(function (res) {
            curr_user = {
                loggedIn: 0
            };
            notifyUserLoginLogout();
            $cookies.remove('currUser');
            window.location.href = '#/';
        });
    };

    var isLoggedIn = function () {
        if (curr_user.loggedIn) {
            return true;
        }
        return false;
    };

    var getUserId = function () {
        return curr_user.userId;
    };

    var onUserLoginLogoutCallbacks = [];
    var onUserLoginLogout = function (cb) {
        onUserLoginLogoutCallbacks.push(cb);
    };

    var notifyUserLoginLogout = function () {
        for (var cb in onUserLoginLogoutCallbacks) {
            onUserLoginLogoutCallbacks[cb]();
        }
    };

    // check if a user is enrolled in a classroom
    var checkIfInClass = function (classid) {
        var req = {
            method: "GET",
            url: "/api/inclass/" + classid
        };

        return $http(req);
    };

    // trim and capitalize input for DB transactions (compare and insert)
    var standardizeInput = function (input) {
        return input.trim().toUpperCase();
    };

    // escape string
    var sqlEscapeString = function (str) {
        return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
            switch (char) {
                case "\0":
                    return "\\0";
                case "\x08":
                    return "\\b";
                case "\x09":
                    return "\\t";
                case "\x1a":
                    return "\\z";
                case "\n":
                    return "\\n";
                case "\r":
                    return "\\r";
                case "\"":
                case "'":
                case "\\":
                case "%":
                    return "\\"+char; // prepends a backslash to backslash, percent,
                                      // and double/single quotes
            }
        });
    };

    // convert semester code to semester
    var getSemesterName = function (semester) {
        if (semester == "F") {
            return "Fall";
        } else if (semester == "W") {
            return "Winter";
        } else {
            return "Summer";
        }
    };

    return {
        setUser: setUser,
        logout: logout,
        isLoggedIn: isLoggedIn,
        onUserLoginLogout: onUserLoginLogout,
        getUserId: getUserId,
        checkIfInClass: checkIfInClass,
        standardizeInput: standardizeInput,
        sqlEscapeString: sqlEscapeString,
        getSemesterName: getSemesterName
    };
}

