angular.module('sorelcomApp')
	.controller('BrowseCtrl', function ($scope, $state) {
		$scope.state = $state;
		$scope.menu = 
    [
      { title:'Tracks', state:'web.search.tracks', icon:'user' },
      { title: 'Users', state:'web.search.users', icon: 'road'	},
      { title: 'Points of interest', state: 'web.search.pois', icon: 'map-marker' }
    ];
	});



angular.module('sorelcomApp')
  .controller('TrackListCtrl', function ($scope, $state, Track) {
  	$scope.tracks = Track.query();
  });



angular.module('sorelcomApp')
  .controller('TrackCtrl', function ($scope, $stateParams, Track, leafletData) {
  	Track.get({id: $stateParams.id})
      .$promise
  		.then(
  			function success(data){
  				$scope.track = data;
  				$scope.geojson = { data: data.geometry };
          leafletData.getMap().then(function (map){
            map.fitBounds(L.geoJson(data.geometry).getBounds());
          });
  			}
  		);
  });



angular.module('sorelcomApp')
  .controller('UserListCtrl', function ($scope, User) {
  	$scope.users = User.query();
  });


//Finished (en principio)
angular.module('sorelcomApp')
  .controller('UserCtrl', function ($scope, $stateParams, $filter, User) {
  	$scope.user = User.get({id: $stateParams.id});

    $scope.user.$promise.then(
      function success(user){
        $scope.filters = 
        [ 
          { name: 'Track', data: $filter('filter')(user.created, {type: 'Track'}) },
          { name: 'Points of Interest', data: $filter('filter')(user.created, {type: 'POI'}) },
          { name: 'Notes', data: $filter('filter')(user.created, {type: 'Note'})  },
          { name: 'Posts', data: $filter('filter')(user.created, {type: 'Post'}) }
        ];
        
        $scope.currentFilter = $scope.filters[0];

        $scope.setFilter = function(filter){
          $scope.currentFilter = filter;
        }
      }
    );
  });



angular.module('sorelcomApp')
  .controller('POIListCtrl', function ($scope, $stateParams, POI) {
    $scope.pois = POI.query();
  });



angular.module('sorelcomApp')
  .controller('POICtrl', function ($scope, $stateParams, leafletData, POI) {
    POI.get({id: $stateParams.id})
      .$promise
      .then(
        function success(data){
          $scope.track = data;
          $scope.geojson = { data: data.geometry };
          leafletData.getMap().then(function (map){
            map.fitBounds(L.geoJson(data.geometry).getBounds());
          });
        }
      );  
  });