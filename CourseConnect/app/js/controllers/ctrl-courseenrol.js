var CtrlCourseEnroll = angular.module('CtrlCourseEnroll', []);

CtrlCourseEnroll.controller('CourseEnrollCtrl', ['$window', '$scope', '$http', '$cookies', '$routeParams', function ($window, $scope, $http, $cookies, $routeParams) {
    $http.get('/api/getcrsenrolled').then(function (res) {
        console.log(res);
        $scope.courses = res.data;
    });

	$scope.unenrollCourse = function(course_id) {
		$http.post('/api/crsunenroll', {classid : course_id}).then(function(res) {
			console.log("Unenrolled from course!");
			$window.location.reload();
			//console.log($routeParams.classid);
			//document.getElementById("unenroll").click();
		});
		/*$http.post('/api/crsunenroll', {classid : $routeParams.classid}).then(function(res) {
			console.log("Unenrolled from course!");
			document.getElementById("unenroll").click();
		})*/

    	/*$http.get('/api/getcrsenrolled').then(function (res) {
    		console.log("New list of courses.");
        	console.log(res);
        	$scope.courses = res.data;
    	});*/
	};
}])
