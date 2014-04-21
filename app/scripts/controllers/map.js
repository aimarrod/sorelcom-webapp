angular.module('sorelcomApp').service('SharedMap', function SharedMap(Track, Note, POI){
    this.initMap = function initMap(id){

        var baseLayers = {
            'OpenStreetMap': L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                noWrap: true
            }),
            'OpenCycleMap': L.tileLayer('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                noWrap: true
            })
        };

        this.map = L.map(id, {
            layers: [baseLayers.OpenStreetMap],
            minZoom: 3,
            zoomControl: false,
            worldCopyJump: true
        });

        L.control.layers(baseLayers).addTo(this.map);

        this.map.locate({ setView: true, maxZoom: 15 });
    };
    this.setLayer = function(layer, geojson){
        this.cleanMap();
        this.layerData = this._getLayerData(geojson, false);
        this.layer = layer;
        this.map.addLayer(layer);
        //Center map view
        if(layer instanceof L.Marker) this.map.setView(layer.getLatLng(), 13); 
        else this.map.fitBounds(layer.getBounds()); 
    }

    this.addOverlays = function(layer, geojson){
        if(this.overlays){
            this.map.removeLayer(this.overlays);
            this.overlays = null;
        }

        this.overlaysData = this._getLayerData(geojson, true);
        this.overlays = layer;
        this.map.addLayer(this.overlays);
    }

    this.transitionEditor = function(){
        
    }

    this.transitionExplore = function(){

    }

    /** Helper to remove overlays from the map */
    this.cleanOverlays = function(){
        if(this.overlays){
            this.map.removeLayer(this.overlays);
            this.overlays = null;
        }
        this.overlaysData = null;
    }

    /** Helper to remove the current layer from the map */
    this.cleanLayer = function(){
        if(this.layer){
            if(this.layer instanceof L.Polyline && this.layer._markers)
                this.layer.removeFrom(this.map);
            else
                this.map.removeLayer(this.layer);
        
            this.layer = null;
        }
        this.layerData = null;
    }

    this.cleanMap = function(){
        this.cleanLayer();
        this.cleanOverlays();     
    }

    this._getLayerData = function(geojson, array){
        if(geojson.type === "FeatureCollection"){
            var layerData = [];
            for(var i = 0, len = geojson.features.length; i < len; i++)
                layerData.push(geojson.features[i].properties);
            return layerData;
        } else {
            if(array)
                return [geojson.properties];
            else
                return geojson.properties;
        }
    }

});

angular.module('sorelcomApp').controller('MapCtrl', function ($scope, leafletData, SharedMap){
    SharedMap.initMap('map-wrapper');
    $scope.sidebar = true;
});


/* Editor controller */
angular.module('sorelcomApp')
    .controller('EditorCtrl', function ($scope, $modal, SharedMap) {
        $scope.sidebar = true;
        $scope.SharedMap = SharedMap;



        $scope.edit = function(){
            $modal.open({
                templateUrl: 'partials/map/editmodal.html',
                controller: 'EditModalCtrl',
                resolve: { track: function () { return angular.copy(SharedMap.layerData); } } 
            })
            .result.then(function (data) {
                SharedMap.layerData = data;
            });
        }

        $scope.loadLayer = function(){
        	$modal.open({
           		templateUrl: 'partials/menumodal.html',
           		controller: 'MenuModalCtrl',
         	})
            .result.then(function (geojson) {
                var layer = geoJsonToLayer(geojson);
                SharedMap.setLayer(layer, geojson);
          	});
        };

        $scope.addLayer = function(){
            $modal.open({
                templateUrl: 'partials/modals/load.html',
                controller: 'LoadModalCtrl',
            })
            .result.then(function (layer, data) {
                SharedMap.setLayer(layer, data);
            });
        }

        $scope.clearLayers = function(){
            SharedMap.cleanMap();

        }

        	/** Save layers */
        $scope.saveLayers = function(){
            saveLayer($scope.editing)
        };

        	function saveLayer(layer){
        		var resource, geojson;

        		if((layer.data instanceof L.Polyline) && !(layer.data instanceof L.Polygon) && !(layer.data instanceof L.Rectangle)) resource = Track;
        		else if(layer.isNote) resource = Note;
        		else resource = POI;
        		
        		geojson = layer.data.toGeoJSON();
        		geojson.properties = layer.properties;
        		if(layer.isNew){
        			resource.save(geojson);
        		} else {
        			resource.update(geojson);
        		}

        		return true;
        	}
    });

angular.module('sorelcomApp')
    .controller('ExploreCtrl', function ($scope, SharedMap, Menu, Geo) {
        $scope.SharedMap = SharedMap;
        $scope.menu = Menu.menu();
        $scope.isActive = Menu.isActive;

        $scope.load = function(position){
            Menu.activate(position);
            $scope.list = Menu.list();
        }

        $scope.loadResource = function(id){
            SharedMap.map.spin(true);
            Menu.getResource().get({id: id}).$promise.then(
                function success(data){
                    SharedMap.map.spin(false);
                    SharedMap.setLayer(L.geoJson(data), data);
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

        $scope.load(0);
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
 		var poly = L.Polyline.PolylineEditor(L.GeoJSON.coordsToLatLngs(geojson.geometry.coordinates), 
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
 		return poly;	
 	} else {
 		return L.GeoJSON.geometryToLayer(geom);
 	}

 	return null;	
}

angular.module('sorelcomApp')
    .controller('MenuModalCtrl', function ($scope,  $modalInstance, Menu) {
    	$scope.menu = Menu.menu();

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

angular.module('sorelcomApp')
    .controller('LoadModalCtrl', function ($scope,  $modalInstance) {

        $scope.defaults = {
            dragging: false,
            keyboard: false,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            tap: false,
            attributionControl: false,
            zoomControl: false
        }

        $scope.load = function ($text, $format) {
            $scope.error = null;
            var geojson = extractLayers($text, $format);
            if(!geojson){
                $scope.error = "Unable to parse file";
            } else if(geojson.length === 1){
                $scope.selected = geojson[0];
                $scope.geojson = geojson;
            } else {
                $scope.geojson = geojson;
            }
        };

        $scope.makeMap = function(element, index){
            var map = L.map(element.get(0), $scope.defaults);
            var layer = L.geoJson($scope.geojson[index]);
            map.addLayer(L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'));            
            map.addLayer(layer);
            map.fitBounds(layer.getBounds());
        }

        $scope.select = function(feature){
            $scope.selected = feature;
            $scope.geojson = [feature];
        }

        $scope.submit = function(feature){
            $modalInstance.close(feature, $scope.name);
        }
    });



function extractLayers(text, format) {
            var geojson;

            if ($.inArray(format, ['gpx', 'GPX']) > -1)
                geojson = toGeoJSON.gpx($.parseXML(text));

            else if ($.inArray(format, ['kml', 'KML']) > -1)
                geojson = toGeoJSON.kml($.parseXML(text));

            else if ($.inArray(format, ['json', 'JSON', 'geojson', 'GEOJSON']) > -1)
                geojson = JSON.parse(text);

            if(!geojson) return null;

            if(geojson.type === "FeatureCollection"){
                var json = [];
                for(var i = 0, len = geojson.features.length; i < len; i++){
                    json.push(geojson.features[i]);
                }
                return json;
            } else {
                return [geojson];
            }

    }