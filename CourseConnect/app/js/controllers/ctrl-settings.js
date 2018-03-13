'use strict';

var userChangeDispName = angular.module('CtrlSettings', []);

userChangeDispName.controller('SettingsCtrl', ['$scope', '$http', '$cookies', function ($scope, $http, $cookies) {
	$http.get('/api/userinfo').then(function (res) {
		if (res.data[0].DisplayName != null) $scope.dispname = res.data[0].DisplayName;
		if (res.data[0].Description != null) $scope.desc = res.data[0].Description;
	})
	$scope.changeDispName = function () {
		$http.post('/api/updatedispname', {dispName: $scope.newDisplayName}).then(function (res) {
			$scope.dispname = res.data[0].DisplayName;
            document.getElementById("dispname_toggle").click();
		});
	};

	$scope.changeDesc = function () {
		$http.post('/api/updateddesc', {desc: $scope.newDesc}).then(function (res) {
			$scope.desc = res.data[0].Description;
            document.getElementById("desc_toggle").click();
		});
	};
}]);