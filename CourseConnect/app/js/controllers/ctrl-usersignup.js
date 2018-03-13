'use strict';

var userSignupCtrls = angular.module('CtrlUserSignup', []);

userSignupCtrls.controller('SignUpCtrl', ['$scope', '$http', function ($scope, $http) {
    $('#FailedAlert').hide();
    $('#MatchingPwd').hide();
    /*Leave this to check*/
    $(function () {
        $("[data-hide]").on("click", function () {
            $(this).closest("." + $(this).attr("data-hide")).hide();
        });
    });
    $scope.signup = function () {
        $http.post('/api/signupCheck', {
            username: $scope.username,
            fn: $scope.firstName,
            ln: $scope.lastName,
            uid: $scope.utorid,
            pwd: $scope.password,
            repwd: $scope.repassword
        }).then(function (res) {
            if ($scope.password != $scope.repassword) {
                $('#MatchingPwd').show();
            }
            console.log(res.data);
            if (res.data == false) {
                $('#FailedAlert').show();
            } else if (res.data == true) {
                window.location.href = '/';
            }
        });
    };
}]);