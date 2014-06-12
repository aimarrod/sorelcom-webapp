angular.module('sorelcomApp').controller('SelectTrackCtrl', function ($scope, $modalInstance, API) {

  API.all('tracks').getList().then(
    function success(tracks){
      $scope.tracks = tracks;
    },
    function error(){
      console.log(err);
      $modalInstance.dismiss();
    }
  );

  $scope.select = function(track){
    $scope.selected = track;
  };

  $scope.continue = function(){
    API.all('tracks').one($scope.selected.id).get().then(
      function success(geojson){
        $modalInstance.close(geojson);
      }
    );
  };

});
