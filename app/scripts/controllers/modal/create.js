angular.module('sorelcomApp')
    .controller('CreateModalCtrl', function ($scope, $modalInstance, $modal, Restangular, API, geojson) {
      var remote;
      $scope.geojson = geojson;
      console.log(geojson);

      if(geojson.geometry.type === 'LineString'){
        remote = Restangular.all('api/tracks');
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
            $scope.$emit('onNotification', 'success', 'Track saved successfully');
            $modalInstance.close($scope.geojson);
            $modal.open({
              templateUrl: 'partials/modals/upload.html',
              controller: 'UploadModalCtrl',
              resolve: { target: function () { return data.id; } } 
            });
          },
          function error(error){
            $scope.$emit('onNotification', 'error', error);
          }
        );
      };
    });