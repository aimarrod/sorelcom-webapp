angular.module('sorelcomApp')
    .controller('UploadModalCtrl', function ($scope, $modalInstance, target) {
        $scope.url = '/api/' + target[0] + '/' + target[1] + '/images';
        $scope.flowConfig = { target: $scope.url, testChunks: false }

    });

angular.module('sorelcomApp')
    .controller('UploadCtrl', function($scope){
        $scope.remove = function(index, $flow){
            $flow.files.splice(index, 1);
        }

        $scope.errors = 0;

        $scope.$on('flow::fileAdded', function (event, $flow, file) {
            if(!file.name.match(/\.(jpg|jpeg|png|gif)$/)){
                event.preventDefault();
                $scope.$emit('onNotification', 'error', 'File ' + file.name + ' could not be loaded');
            }
        });

        $scope.$on('flow::fileSuccess', function (even, $flow, file, message){
            $flow.files.splice($flow.files.indexOf(file), 1);
            if($flow.files.length == 0){
                check();
            }
        });

        $scope.$on('flow::fileError', function (even, $flow, file, message){
            $scope.$emit('onNotification', 'error', 'Could not upload file ' + file.name);
        });

        function check(){
            if($scope.errors == 0){
                $scope.$emit('onNotification', 'success', 'Upload successful');
            }
        }

    });
