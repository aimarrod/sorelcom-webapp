angular.module('sorelcomApp')
    .controller('GPXLoadCtrl', function ($scope, Modal, $modalInstance, Loader) {
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

        $scope.load = function($text, $format) {
          loaded = Loader.load($text, $format);
          if(loaded instanceof Array){
            $scope.geojson = array;
          } else {
            $scope.selected = loaded;
            $scope.geojson = [loaded];
          }
        }

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
        };

        $scope.continue = function(){
            $modalInstance.dismiss();
            Modal.create($scope.selected);
        };

        $scope.import = function(){
          $modalInstance.close($scope.selected);
        };

    });
