angular.module('sorelcomApp')
    .controller('CreateModalCtrl', function ($scope, $modalInstance, $modal, Auth, Restangular, API, geojson) {
      var remote;
      $scope.geojson = geojson;

      if(geojson.geometry.type === 'LineString'){
        remote = API.all('trails');
      } else {
        if(geojson.properties.public !== undefined){
          remote = API.all('notes');
          $scope.isNote = true;
          API.all('users').one(Auth.loggedUser().name).getList('buddies').then(
            function success(list){
              $scope.friends = list;
              $scope.geojson.properties.targets = [];
            }
          );
        } else {
          remote = API.all('pois');
          $scope.isPOI = true;
          API.get('amenities').then(
            function success(data){
              $scope.categoryGroups = data.categoryGroups;
              geojson.properties.targets = [];
            },
            function error(err){

            }
          );
        }
      }

      $scope.submit = function(){
        remote.post($scope.geojson).then(
          function success(data){
            $scope.$emit('onNotification', 'success', 'Feature saved successfully');
            $modalInstance.close($scope.geojson);
            $modal.open({
              templateUrl: 'partials/modals/upload.html',
              controller: 'UploadModalCtrl',
              resolve: { target: function () { return [($scope.geojson.geometry.type==='LineString'?'trails':'pois'), $scope.geojson.properties.name.split(' ').join('_')]; } }
            });
          },
          function error(error){
            $scope.err = error;
          }
        );
      };

    $scope.checkAll = function() {
      $scope.geojson.properties.targets = [];
      for(var i = 0, l = $scope.friends.length; i < l; i++){
        $scope.geojson.properties.targets.push($scope.friends[i].name);
      }
    };

    $scope.uncheckAll = function() {
      console.log($scope.geojson.properties);
      $scope.geojson.properties.targets = [];
    };

    $scope.selected = function(friend){
      return $scope.geojson.properties.targets.indexOf(friend.name) !== -1;
    };

    $scope.toggleTarget = function(friend){
      var index = $scope.geojson.properties.targets.indexOf(friend.name);
      if(index === -1)
        $scope.geojson.properties.targets.push(friend.name);
      else
        $scope.geojson.properties.targets.splice(index, 1);
    }
  });
