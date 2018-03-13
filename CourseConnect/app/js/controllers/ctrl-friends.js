'use strict';

var CtrlFriends = angular.module('CtrlFriends', []);

CtrlFriends.controller('FriendsCtrl', ['$scope', '$http', function ($scope, $http) {
    console.log('FriendsCtrl is running');

	$scope.loadFriends = function() {
        $http.get('/api/getFriends').success(function (res) {
            $scope.var_friends = res;
        }).error(function (res) {
            console.log(res);
        })

        $http.get('/api/getFriendRequest').success(function (res) {
            $scope.var_reqfriends = res;
        }).error(function (res) {
            console.log(res);
        })
    }

    $http.get('/api/getFriends').success(function (res) {
        $scope.var_friends = res;
    }).error(function (res) {
        console.log(res);
    })

    $http.get('/api/getFriendRequest').success(function (res) {
        console.log(res);
        $scope.var_reqfriends = res;
    }).error(function (res) {
        console.log(res);
    })

    $scope.unfriend = function(userid) {
	    $http.post('/api/unfriendUser', {user: userid}).then(function (res) {
            console.log(res.data);
            if (res.data.deletion == true) {
                window.location.reload();
            }
        })
    }

    $scope.acceptRequest = function(userid) {
	    $http.post('/api/acceptFriendRequest', {userTwo: userid}).then(function (res) {
            if (res.data.accepted == true) {
                window.location.reload();
            }
        })
    }

    $scope.declineRequest = function(userid) {
        $http.post('/api/rejectFriendRequest', {userOne: userid}).then(function (res) {
            if (res.data.rejected == true) {
                window.location.reload();
            }
        })
    }
}]);