angular.module('sorelcomApp').controller('EditorCtrl', function ($scope, Modal, Editor, Map, Tooltip, API, Auth){

  $scope.markPOI = function(){
    Auth.requireLogin(Editor.markPOI);
  };

  $scope.startDraw = function(){
    Auth.requireLogin(Editor.startDraw);
  };

  $scope.startEdit = function(){
    Modal.chooseImportMode().then(
      function success(geojson){
        Editor.startEdit(geojson);

        if(geojson.properties && geojson.properties.id) /** Assign ID, to know if the track already existed */
          $scope.editingId = geojson.properties.id;
      }
    );
  };

  $scope.$on('$destroy', function(){
    Editor.stopTask();
  });

});
