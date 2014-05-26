angular.module('sorelcomApp').controller('MapCtrl', function ($scope, $stateParams, $timeout, $modal, Map, Auth){
    Map.initMap('map-wrapper');
    $scope.SharedMap = Map;
    $scope.sidebar = false;

    $scope.closeSidebar = function(){
        $scope.sidebar = false;
        $timeout(function(){ SharedMap.map.invalidateSize()}, 400);
    };

    $scope.openSidebar = function(){
        $scope.sidebar = true;
    };


    $scope.drawPOI = function(){
        Auth.requireLogin(_drawPOI);
    };

    $scope.drawTrack = function(){
        Auth.requireLogin(_drawTrack);
    };

    $scope.finishDraw = function(){
        var result = Map.finishDraw();
        if(result)
        $modal.open({
            templateUrl: 'partials/modals/create.html',
            controller: 'CreateModalCtrl',
            resolve: { geojson: function () { return result.toGeoJSON(); } }
        });
    }

    $scope.stopDraw = function(){
        SharedMap.stopAction();
        $scope.openSidebar();
    };

    function _drawTrack(){
        $scope.closeSidebar();
        SharedMap.initDraw();
    }

    function _drawPOI(){
        $scope.closeSidebar();
        SharedMap.markPOI(function (latlng){
            $scope.$apply(function (){
                this.tooltip = '';
                SharedMap.resetEvents();
                $modal.open({
                    templateUrl: 'partials/modals/create.html',
                    controller: 'CreateModalCtrl',
                    resolve: { geojson: function () { return L.marker(latlng).toGeoJSON(); } }
                });
            });
        });
    }


    $timeout($scope.openSidebar);
});



angular.module('sorelcomApp').controller('ExploreCtrl', function ($scope, API, Explorer) {
    $scope.Explorer = Explorer;
    Explorer.init();
    $scope.$on('$destroy', Explorer.destroy)
});



function isValid(properties){
	return properties.name && properties.description;
}
