
var app = angular.module('sorelcomApp');



angular.module('sorelcomApp').controller("HomeController", function ($scope, Menu, Geo, leafletData) {
	$scope.slides = [
		{name: "Ruta 1", text: "Texto del slide 1", active: true}, 
		{name: "Ruta 2", text: "Texto del slide 2", active: false}, 
		{name: "Ruta 3", text: "Texto", active: false}, 
		{name: "Ruta 4", text: "BLERGH", active: false}
	];

	$scope.defaults = {
		zoomControl: false,
		attributionControl: false,
		dragging: false,
		touchZoom: false,
		scrollWheelZoom: false,
		doubleClickZoom: false,
		boxZoom: false,
		tap: false,
		keyboard: false
	}


	for(var i = 0, len = $scope.slides.length; i < len; i++){

		$scope.$watchCollection('slides['+i+']', function(newVal, oldVal){
			var index = $scope.slides.indexOf(newVal);
			if($scope.slides[index].active && !$scope.slides[index].shown){
				$scope.slides[index].shown = true;
				leafletData.getMap('slideMap'+index).then(function(map){
					console.log("HUE");
					map.invalidateSize();
				});
			}		
		});

		angular.extend($scope.slides[i], {
      layers: {
        baselayers: {
          googleHybrid: {
	          name: 'Google Hybrid',
	          layerType: 'HYBRID',
	          type: 'google'
	        }
        }
      }
    });
	}
});