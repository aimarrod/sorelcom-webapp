angular.module('sorelcomApp')
	.controller('SearchCtrl', function ($scope, $q, $http) {

		$scope.filter = {
			trails: true,
			pois: true,
			users: true,
			difficulty: {
				max: 100,
				min: 0
			}
		};

		$scope.makeRef = function(item){
			if(item.type === 'Person')
				return 'user({id: item.id})'
			if(item.type === 'Trail')
				return 'trail({id: item.id})'
			if(item.type === 'Point of Interest')
				return 'poi({id: item.id})'
			return 'home';
		};

		$scope.makeIconUrl = function(item){
			if(item.type === 'Person')
				return item.avatar;
			else if(item.type === 'Trail')
				return '/images/icons/track.png';
			else if(item.type === 'PointOfInterest')
				return '';
		}

    $scope.search = function(){
      if($scope.canceller)
        $scope.canceller.resolve();

      $scope.canceller = $q.defer();

			var queryParameters = {
				query: $scope.query,
				trails: $scope.filter.trails,
				users: $scope.filter.users,
				pois: $scope.filter.pois,
				maxDifficulty: $scope.filter.difficulty.max,
				minDifficulty: $scope.filter.difficulty.min
			}

      $http({method: 'GET', url: '/api/search', params: queryParameters, timeout: $scope.canceller.promise})
      .success(function(data){
        $scope.canceller = null;
        $scope.searchResults = data;
      })
      .error(function(err){
        $scope.canceller = null;
        $scope.$emit('onError', err);
      });
    };
  });
