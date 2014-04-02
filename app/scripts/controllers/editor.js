angular.module('sorelcomApp')
    .controller('EditorCtrl', function ($scope, leafletData, Track, POI) {
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

        var drawLayer = L.featureGroup();

		leafletData.getMap().then(function(map) {

			drawLayer.addTo(map);
			var drawControl = new L.Control.Draw({
    			edit: {
        			featureGroup: drawLayer
    			}
			});
			map.addControl(drawControl);

            map.on('draw:created', function (e) {
                drawLayer.addLayer(e.layer);
            });
        });
    });

angular.module('sorelcomApp')
    .controller('FeatureSelectCtrl', function ($scope,  $modalInstance, Track, Note, POI) {

    });