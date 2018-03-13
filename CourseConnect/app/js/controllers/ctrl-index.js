'use strict';

var indexCtrl = angular.module('CtrlIndex', []);

indexCtrl.service('IndexService', ['$http', function ($http) {
    // get class room by courseid, semester and year
    this.getClassroom = function (coursecode, semester, year) {
        var req = {
            method: "GET",
            url: "/api/getclass/" + year + "/" + semester + "/" + coursecode
        };

        return $http(req);
    };

    // create a class room
    this.createClassroom = function (userid, coursecode, semester, year) {
        var req = {
            method: "POST",
            url: "/api/createclass",
            data: {
                userid: userid,
                coursecode: coursecode,
                semester: semester,
                year: year
            }
        };

        return $http(req);
    };
}]);

indexCtrl.controller('IndexCtrl', ['$scope', '$location', 'CommonService', 'IndexService', '$http', '$cookies',
    function ($scope, $location, CommonService, IndexService, $http, $cookies) {
        console.log('IndexCtrls is running');

        $scope.logout = function () {
            $scope.var_logged_in = false;
            CommonService.logout();
        };

        $scope.openYearPicker = function($event) {
            $scope.var_year_picker_opened = true;
        };

        $scope.dateOptions = {
            formatYear: 'yyyy',
            datepickerMode: 'year',
            minMode: 'year'
        };

        $scope.getCourseId = function () {
            return $scope.var_course_code + $scope.var_semester + $scope.var_year;
        };

        $scope.goToChatRoom = function () {
            var roomId = $scope.getCourseId();
            IndexService.getClassroom($scope.var_course_code, $scope.var_semester, $scope.var_year)
                .then(function (result) {
                    if (result.data.found) {
                        if (CommonService.isLoggedIn()) {
                            $location.path("/class/" + result.data.courseId);
                        } else {
                            var toLogin = confirm("Classroom found, please login to view the room.");
                            if (toLogin) {
                                $location.path("/login");
                            }
                        }
                    } else {
                        // check if user is logged in
                        if (CommonService.isLoggedIn()) { // if yes, ask him to create a class room
                            var createRoom = confirm("Sorry, room for this course does not exist.\nDo you want to create a room for it?");
                            if (createRoom) {
                                IndexService.createClassroom(CommonService.getUserId(), $scope.var_course_code, $scope.var_semester, $scope.var_year)
                                    .then(function (res) {
                                        $location.path("/class/" + res.data.courseId);
                                    });
                            } else {
                                document.getElementById("courseCodeInput").select();
                            }
                        } else { // if no, tell him that room doesn't not exist
                            alert("Sorry, room for this course does not exist");
                            document.getElementById("courseCodeInput").select();
                        }
                    }
                });
        };

        $scope.init = function () {
            $scope.var_date = new Date();
            $scope.var_year_picker_opened = false;

            // get current semester
            var monthIndex = parseInt($scope.var_date.getMonth());
            if (0 <= monthIndex && monthIndex <= 3) {
                $scope.var_semester = "W";
            } else if (4 <= monthIndex && monthIndex <= 7) {
                $scope.var_semester = "S";
            } else {
                $scope.var_semester = "F";
            }

            // show hide login/logout buttons
            $scope.var_logged_in = CommonService.isLoggedIn();
            // set listening on user login logout
            CommonService.onUserLoginLogout(function () {
                $scope.var_logged_in = CommonService.isLoggedIn();
            });
        };

        $scope.init();

        $scope.$watch("var_date", function () {
            $scope.var_year = $scope.var_date.getFullYear();
        });

        $scope.$watch("var_course_code", function () {
            if ($scope.var_course_code) {
                $scope.var_course_code = CommonService.standardizeInput($scope.var_course_code);
            }
        });
    }
]);
