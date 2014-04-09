angular.module('sorelcomApp')
    .controller('EditorCtrl', function ($scope, leafletData, $modal, Track, POI, $compile) {
        $scope.layers = {
            baselayers: {
                osm: {
                    name: 'OpenStreetMap',
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    type: 'xyz'
                },
                ocm: {
                    name: 'OpenCycleMap',
                    url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
                    type: 'xyz'
                },
                cloudmade2: {
                    name: 'Cloudmade Tourist',
                    type: 'xyz',
                    url: 'http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png',
                    layerParams: {
                        key: '007b9471b4c74da4a6ec7ff43552b16f',
                        styleId: 7
                    }
                }
            }
        };

        $scope.startEdit = function(name){
        	if(!$scope.current) return;

        	if(!$scope.current.$edit)
        		$scope.current.$edit = {};
        	$scope.current.$edit = name;
        }

        $scope.finishEdit = function($event){
        	console.log($scope.current.$edit)
        	if($event.keyCode !== 13 || !$scope.current) return;

        	$scope.current.$edit = false;

        }

        var html = '<div>' +
        	'<div ng-show="!current">' +
        		'<h5>No content yet.</h5>' +
        		'<p>Create something or edit existing resources with <i class="icon fa fa-cloud-download"></i><p>' +
        	'</div>' +
        		'<div ng-show="current">' +
        			'<input ng-keyup="finishEdit($event)" ng-show="current.$edit === \'name\'" type="text" class="form-control" placeholder="Name" ng-model="current.properties.name"/>' +
        			'<h5 ng-click="startEdit(\'name\', current)" class="text-danger" ng-hide="current.properties.name || current.$edit===\'name\'">No name yet</h5>' +
        			'<h5 ng-click="startEdit(\'name\', current)" ng-hide="current.$edit === \'name\'">{{current.properties.name}}</h5>' +
        			'<input ng-keyup="finishEdit($event)" ng-show="current.$edit === \'description\'" type="text" class="form-control" placeholder="description" ng-model="current.properties.description"/>' +
        			'<p ng-click="startEdit(\'description\', current)" class="text-danger" ng-hide="current.properties.description || current.$edit===\'description\'">No description yet</p>' +
        			'<p ng-click="startEdit(\'description\', current)" ng-hide="current.$edit === \'description\'">{{current.properties.description}}</p>' +
        			'<small class="text-info"><i class="icon fa fa-info-circle"></i> Click on a field to edit it, press <kbd>enter</kbd> while editing a field to stop.</small>' +
        		'</div>' +
        	'</div>';

		leafletData.getMap().then(function(map) {

			var drawLayer = L.featureGroup();
			var layers = [];
			

            map.on('draw:created', function (e) {
            	var layer = {data: e.layer, properties: {}, isNew:true };
                drawLayer.addLayer(layer.data);
                layers.push(layer);
                $scope.current = layer;
            });

            /** Load a layer into the map in order to save it. */
            $scope.loadLayer = function(){
        		
        		var modalInstance = $modal.open({
            		templateUrl: 'partials/menumodal.html',
            		controller: 'MenuModalCtrl',
          		});

          		modalInstance.result.then(function (geojson) {
          			var layer = {
          				data:geojsonToLayer(geojson), 
          				properties: geojson.properties, 
          				isNew:false 
          			};
          			if(layer.data !== null){
 						drawLayer.addLayer(layer.data);
 						layers.push(layer);
 						center(layer, map);
 						$scope.current = layer;
 					}
          		});
        	};

        	/** Save layers */
        	$scope.saveLayers = function(){
        		for(var i = 0; i < layers.length; i++){
        			var layer = layers[i];
        			var bool = saveLayer(layer);
        			if(bool){
        				drawLayer.removeLayer(layer.data);
        				layers.splice(i, 1);
        				i--;
        			}
        		}
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

        	drawLayer.addTo(map);

        	new L.Control.Draw.Load({
        		'load': $scope.loadLayer, 
        		'save': $scope.saveLayers, 
        		'loadIcon':'cloud-download', 
        		'saveIcon':'save' 
        	}).addTo(map);

        	new L.Control.Editor.Selector({
        		panelContent: $compile(html)($scope),
        		next: function(){
        			if(!$scope.current) return;

        			index = layers.indexOf($scope.current);
        			index++;
        			if(index >= layers.length)
        				index = 0;
        			$scope.current = layers[index];
        			center($scope.current, map);
        		},
        		prev: function(){
        			if(!$scope.current) return;

        			index = layers.indexOf($scope.current);
        			index--;
        			if(index < 0)
        				index = layers.length -1;
        			$scope.current = layers[index];
        			center($scope.current, map);
          		},
          		edit: function(){
        			var modalInstance = $modal.open({
            			templateUrl: 'partials/editor/properties.html',
            			controller: 'EditModalCtrl',
            			resolve: {

            			} 
          			});          		
        		}
        	}).addTo(map);
        	
			new L.Control.Draw({
				draw: {
					polyline: false
				},
    			edit: {
        			featureGroup: drawLayer,
    			}
			}).addTo(map);

        });
    });


function isValid(properties){
	return properties.name && properties.description;
}

function geojsonToLayer(geojson){
	var coordinates, type, geom;
	if(geojson.type = 'Feature')
		coordinates = geojson.geometry.coordinates,
		type = geojson.geometry.type,
		geom = geojson.geometry;
	else if(geojson.type = 'FeatureCollection')
		coordinates = geojson.features[0].geometry.coordinates,
		type = geojson.features[0].geometry.type,
		geom = geojson.features[0].geometry;
	else 
		coordinates = geojson.coordinates,
		type = geojson.type,
		geom = geojson;

	/** If linestring, need to use special editable polyline */
	if(type==='LineString'){
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

function center(l, map){
 	if(l.data instanceof L.Marker)
 		map.setView(l.data.getLatLng(), 13);
 	else
 		map.fitBounds(l.data.getBounds());
}

function removeFrom(layer, editLayer, map){
	if(layer instanceof L.Polyline){
		layer.removeEditable(editLayer, map);
	}
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