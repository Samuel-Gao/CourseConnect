var serviceModule = angular.module('Services', []);

serviceModule.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl, chatRoom = 'default'){

            $http.post('/api/setChatRoom', {chatroom : chatRoom});

        var fd = new FormData();
        fd.append('file', file);
        //fd.append('loc', chatRoom);
        //console.log("file name is " + fd.get('file').name);


        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })

            .success(function(){
            })

            .error(function(){
            });
    };
}]);
