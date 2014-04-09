
var app = angular.module('sorelcomApp');



angular.module('sorelcomApp').controller("MapController", function ($scope, Menu, leafletData) {

    $scope.menu = Menu.menu();

    $scope.isActive = Menu.isActive;

    $scope.load = function(position){
      Menu.activate(position);
      $scope.list = Menu.list();
    }

    $scope.loadResource = function(id){
      leafletData.getMap().then(function (map){

        map.spin(true);
        Menu.getResource().get({id: id}).$promise.then(
          function success(data){
            map.spin(false);
            $scope.geojson = { data: data.geometry };
            map.fitBounds(L.geoJson(data.geometry).getBounds());
          },
          function error(err){
            map.spin(false);
          }
        );
      });
    }

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

    var sidebar = L.control.sidebar('sidebar', {
      closeButton: false,
      position: 'left',
      autoPan: false
    });

    $scope.toggle=function(){
      sidebar.toggle();
    };
  
    leafletData.getMap().then(function (map){
      sidebar.addTo(map);

      setTimeout(function (){
        sidebar.show();
      }, 500);

      var myButton = new L.Control.Button({'onClick': $scope.toggle } ).addTo(map);

    });

    $scope.load(0);
});