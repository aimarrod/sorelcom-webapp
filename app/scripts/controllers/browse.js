angular.module('sorelcomApp')
	.controller('BrowseCtrl', function ($scope, $state) {
		$scope.state = $state;
		$scope.menu = [{
			'title':'Tracks',
			'state':'browse.tracks',
      'icon':'user'
		}, {
			'title':'Users',
			'state':'browse.users',
      'icon':'road'
		}, {
      'title':'Points of interest',
      'state':'browse.pois',
      'icon':'map-marker'
    }];
	});

angular.module('sorelcomApp')
  .controller('TrackListCtrl', function ($scope, $state, Track) {
  	$scope.tracks = Track.query();
  });

angular.module('sorelcomApp')
  .controller('TrackDetailCtrl', function ($scope, $stateParams, Track, leafletData) {
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

angular.module('sorelcomApp')
  .controller('UserDetailCtrl', function ($scope, $stateParams, User) {
  	$scope.user = User.get({id: $stateParams.id});
  });

angular.module('sorelcomApp')
  .controller('POIListCtrl', function ($scope, $stateParams, User) {
    $scope.user = User.get({id: $stateParams.id});
  });