angular.module('sorelcomApp')
    .controller('LoadModalCtrl', function ($scope,  $modalInstance, $modal, Track) {
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

        $scope.save = function(){
            Track.save($scope.selected)
                .$promise.then(
                    function success(data){
                        $scope.$emit('onNotification', 'success', 'Track saved successfully');
                        $modalInstance.close($scope.selected);
                        $modal.open({
                            templateUrl: 'partials/modals/upload.html',
                            controller: 'UploadModalCtrl',
                            resolve: { target: function () { return data.id; } } 
                        });
                    },
                    function error(error){
                        $scope.$emit('onNotification', 'error', error);
                    }
                );
        }

        function extractLayers(text, format) {
            var geojson;

            if ($.inArray(format, ['gpx', 'GPX']) > -1)
                geojson = toGeoJSON.gpx($.parseXML(text));
            /**
            else if ($.inArray(format, ['kml', 'KML']) > -1)
                geojson = toGeoJSON.kml($.parseXML(text));
            else if ($.inArray(format, ['json', 'JSON', 'geojson', 'GEOJSON']) > -1)
                geojson = JSON.parse(text);
            */
            if(!geojson){ 
                $scope.$emit('onNotification', 'error', 'Could not load any track for the file');                
                return null;
            }

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
    });

