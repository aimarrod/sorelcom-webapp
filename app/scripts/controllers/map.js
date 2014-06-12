angular.module('sorelcomApp').controller('MapCtrl', function ($scope, $timeout, Modal, Map, Tooltip, Auth, Editor){
    Map.initMap('map-wrapper');
    $scope.state = Map.state;
    $scope.Tooltip = Tooltip;



    $scope.closeSidebar = function(){
      $scope.state.sidebarOpen = false;
      $timeout(function(){ Map.map.invalidateSize()}, 400);
    };

    $scope.openSidebar = function(){
      $scope.state.sidebarOpen = true;
    };

    $scope.finish = function(){
      var result = Editor.finishTask();
      if(result)
        if($scope.editingId)
          //Wat
          return;
        else
          Modal.create(result.toGeoJSON());
    };

    $scope.cancel = function(){
      Editor.stopTask();
    }

    $timeout($scope.openSidebar);
});



angular.module('sorelcomApp').controller('ExploreCtrl', function ($scope, $modal, API, Explorer) {
    $scope.Explorer = Explorer;
    Explorer.init();
    $scope.$on('$destroy', Explorer.destroy)
});

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

angular.module('sorelcomApp').controller('ChooseCtrl', function($scope, Modal, $modalInstance){

  $scope.fromServer = function(){
    Modal.selectTrack().then(
      function success(geojson){
        $modalInstance.close(geojson);
      }
    );
  };

  $scope.fromGPX = function(){
    Modal.importGPX().then(
      function success(geojson){
        $modalInstance.close(geojson);
      }
    );
  };

});


function isValid(properties){
	return properties.name && properties.description;
}
