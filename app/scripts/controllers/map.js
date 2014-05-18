angular.module('sorelcomApp').controller('MapCtrl', function ($scope, $stateParams, $timeout, SharedMap){
    SharedMap.initMap('map-wrapper');
    $scope.sidebar = false;

    $scope.$on('CloseSidebar', function(){
        $scope.sidebar = false;
    });

    $scope.openSidebar = function(){
        $scope.sidebar = true;
    }

    $timeout($scope.openSidebar);
});


/* Editor controller */
angular.module('sorelcomApp')
    .controller('EditorCtrl', function ($scope, $stateParams, $modal, SharedMap, Auth, Track, POI) {
        $scope.title = "Editor";
        $scope.sidebar = true;
        $scope.SharedMap = SharedMap;

        $scope.SharedMap.transitionEditor();

        $scope.close = function(){
            $scope.$emit('CloseSidebar');
        }

        $scope.edit = function(){
            $modal.open({
                templateUrl: 'partials/modals/upload.html',
                controller: 'UploadModalCtrl',
                resolve: { target: function () { return SharedMap.layerData.id; } } 
            })
            .result.then(function (data) {
                SharedMap.layerData = data;
            });
        }

        $scope.loadLayer = function(){
        	$modal.open({
           		templateUrl: 'partials/modals/menu.html',
           		controller: 'MenuModalCtrl',
         	})
            .result.then(function (geojson) {
                SharedMap.setLayer(geoJsonToLayer(geojson), geojson);
                console.log(SharedMap.layerData);
          	});
        }

        $scope.addLayer = function(){
            $modal.open({
                templateUrl: 'partials/modals/load.html',
                controller: 'LoadModalCtrl',
            })
            .result.then(function (geojson) {
                SharedMap.setLayer(geoJsonToLayer(geojson), geojson);
            });
        }

        $scope.clearLayers = function(){
            SharedMap.cleanMap();
        }

        	/** Save layers */
        $scope.saveLayer = function(){
            requireLogin(function(){
                var resource, geojson;
                var layer = $scope.SharedMap.layer;

                if((layer instanceof L.Polyline) && !(layer instanceof L.Polygon) && !(layer instanceof L.Rectangle)) resource = Track;
                else resource = POI;
                
                geojson = layer.toGeoJSON();
                geojson.properties = $scope.SharedMap.layerData;

                if(geojson.properties.id){
                    resource.update(geojson);
                } else {
                    resource.save(geojson);
                }
            });
        };

        function requireLogin(callback){
            if(!Auth.isLoggedIn()){
                var modalInstance = $modal.open({
                templateUrl: 'partials/login.html',
                controller: 'LoginCtrl',
                }).result.then(
                    function success() {
                        callback()  
                    }, function cancel() {
                //Wat to do
                    }
                );
            } else { 
                callback();
            }
        }

        if($stateParams.upload)
            $scope.addLayer();
    });

angular.module('sorelcomApp')
    .controller('ExploreCtrl', function ($scope, $stateParams, SharedMap, Geo, Track, POI, Note) {
        console.log($stateParams);
        $scope.title = "Explore";
        $scope.SharedMap = SharedMap;
        $scope.tabs = ['Tracks', 'Points of Interest', 'Notes']
        $scope.resources = [Track, POI, Note];
        $scope.tab = 0;

        $scope.showing = $scope.SharedMap.transitionExplore();

        $scope.close = function(){
            $scope.emit('CloseSidebar');
        }

        $scope.next = function(){
            $scope.tab = ($scope.tab + 1) % 3;
            load();
        }

        $scope.prev = function(){
            $scope.tab--;
            if($scope.tab < 0)
                $scope.tab = $scope.tabs.length-1;
            load()
        }

        function load(){
            $scope.list = $scope.resources[$scope.tab].query();
        }

        $scope.back = function(){
            $scope.SharedMap.cleanMap();
            $scope.showing = false;
        }

        $scope.show = function(id){
            SharedMap.map.spin(true);
            $scope.resources[$scope.tab].get({id: id}).$promise.then(
                function success(data){
                    SharedMap.map.spin(false);
                    SharedMap.setLayer(L.geoJson(data), data);
                    $scope.showing = true;
                },
                function error(err){
                    SharedMap.map.spin(false);
                }
            );

            Geo.nearby(id, function(geojson){
                var layer = L.geoJson(geojson, {
                    pointToLayer: function(featureData, latlng){
                        return L.marker(latlng);
                    }
                });

                SharedMap.addOverlays(layer, geojson);
            });
        };
        load();
    });


function isValid(properties){
	return properties.name && properties.description;
}

/** Get a regular layer or editable in case of linestrings */
function geoJsonToLayer(geojson){
    var coordinates, 
        geom;

    if(!geojson)
        return null;
	else if(geojson.type = 'Feature')
		coordinates = geojson.geometry.coordinates,
		geom = geojson.geometry;
	else if(geojson.type = 'FeatureCollection')
		coordinates = geojson.features[0].geometry.coordinates,
		geom = geojson.features[0].geometry;
	else 
		coordinates = geojson.coordinates,
		geom = geojson;

	/** If linestring, need to use special editable polyline */
	if(geom.type==='LineString'){
 		return makePolylineEditor(L.GeoJSON.coordsToLatLngs(geojson.geometry.coordinates));	
 	} else {
 		return L.GeoJSON.geometryToLayer(geom);
 	}

 	return null;	
}

function makePolylineEditor(coords){
        return L.Polyline.PolylineEditor(coords, 
            {
                maxMarkers: 100, 
                pointIcon: L.icon(
                    { 
                        iconUrl: '/images/editmarker.png', 
                        iconAnchor: L.point(5,5) 
                    }), 
                newPointIcon: L.icon(
                    { 
                        iconUrl: '/images/newpointmarker.png', 
                        iconAnchor: L.point(5,5)
                    }) 
            });

}

angular.module('sorelcomApp')
    .controller('MenuModalCtrl', function ($scope,  $modalInstance, Menu) {
    	$scope.menu = Menu;

    	$scope.isActive = Menu.isActive;

 		$scope.select = function(item){
 			$scope.selected = item;
 		};

    	$scope.load = function(position){
      		Menu.activate(position);
      		$scope.list = Menu.list();
    	};

    	$scope.submit = function(){
    		Menu.getResource().get({id: $scope.selected.id}).$promise.then(
    			function success(geojson){
    				$modalInstance.close(geojson);
    			}
    		);
    	};

    	$scope.load(0);
    });

angular.module('sorelcomApp')
    .controller('EditModalCtrl', function ($scope,  $modalInstance, track) {
        
        $scope.track = track;

        $scope.submit = function(){
            $modalInstance.close($scope.track);
        };

        $scope.cancel = function(){
            $modalInstance.dismiss();
        }
    });
