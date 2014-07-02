angular.module('sorelcomApp').controller("HomeCtrl", function ($scope, $http, Modal, info, slides, leafletData, $location, $anchorScroll) {

	$scope.defaults = {
		zoomControl: false,
		attributionControl: false
	}

	makeSlides(slides);
	$scope.info = info;

	function makeSlides(data){
		$scope.slides = [];
		for(var i = 0, len = data.length; i < len; i++){

			$scope.slides.push({
				name: data[i].properties.name,
				author: {
					id: data[i].properties.authorId,
					name: data[i].properties.author
				},
				type: ( (data[i].properties === 'POI') ? 'Point of Interest' : data[i].properties.type),
				geometry: data[i].geometry,
				layers: {
       		baselayers: {
         		osm: { name: 'Arcgis World Imagery',	url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',	type: 'xyz' }
       		}
     		},
     		active: (i===0)
			});

			$scope.$watchCollection('slides['+i+']', function(newVal, oldVal){
				var index = $scope.slides.indexOf(newVal);
				var slide = $scope.slides[index];
				if(slide.active && !slide.shown){
					slide.shown = true;
					leafletData.getMap('slideMap'+index).then(function(map){
						map.invalidateSize();
						var layer = L.geoJson(slide.geometry).addTo(map);
						map.fitBounds(layer.getBounds());

						map.dragging.disable();
						map.touchZoom.disable();
						map.doubleClickZoom.disable();
						map.scrollWheelZoom.disable();
						map.boxZoom.disable();
						if(map.keyboard)
							map.keyboard.disable();
						if(map.tap)
							map.tap.disable();
					});
				}
			});
		};
	}

	$scope.upload = function(){
		Modal.loadGPX();
	};

	$scope.goToMap = function(){
		$location.hash('map');
		$anchorScroll();
	};
});
