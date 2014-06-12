angular.module('sorelcomApp')
    .controller('CreateModalCtrl', function ($scope, $modalInstance, $modal, Restangular, API, geojson) {
      var remote;
      $scope.geojson = geojson;

      if(geojson.geometry.type === 'LineString'){
        remote = Restangular.all('api/trails');
      } else {
        remote = Restangular.all('api/pois');
        $scope.isPOI = true;
        API.get('amenities').then(
          function success(data){
            $scope.categoryGroups = data.categoryGroups;
          },
          function error(err){
          }
        );
      }

      $scope.submit = function(){
        remote.post($scope.geojson).then(
          function success(data){
            $scope.$emit('onNotification', 'success', 'Trail saved successfully');
            $modalInstance.close($scope.geojson);
            $modal.open({
              templateUrl: 'partials/modals/upload.html',
              controller: 'UploadModalCtrl',
              resolve: { target: function () { return [($scope.geojson.geometry.type==='LineString'?'trails':'pois'), $scope.geojson.properties.name.split(' ').join('_')]; } }
            });
          },
          function error(error){
            $scope.$emit('onNotification', 'error', 'Could not save');
          }
        );
      };
    });
