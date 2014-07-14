angular.module('sorelcomApp').controller('SelectTrackCtrl', function ($scope, $modalInstance, API) {

  API.all('trails').getList().then(
    function success(tracks){
      $scope.tracks = tracks;
    },
    function error(err){
      $scope.err = err;
    }
  );

  $scope.select = function(track){
    $scope.selected = track;
  };

  $scope.continue = function(){
    API.all('trails').one($scope.selected.id).get().then(
      function success(geojson){
        $modalInstance.close(geojson);
      }
    );
  };
});
