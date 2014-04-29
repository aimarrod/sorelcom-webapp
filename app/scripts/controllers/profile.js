angular.module('sorelcomApp')
  .controller('ProfileCtrl', function ($scope, $rootScope, $filter, Auth) {
  	$scope.user = Auth.currentUser();
  	$scope.flowOptions = {
  		singleFile: true,
  		target: '/api/files/User',
  		testChunks: false
		};

		$scope.user.$promise.then(
			function success(user){
				$scope.filters = 
				[ 
					{	name: 'Track', data: $filter('filter')(user.created, {type: 'Track'}) },
					{	name: 'Points of Interest',	data: $filter('filter')(user.created, {type: 'POI'}) },
					{	name: 'Notes', data: $filter('filter')(user.created, {type: 'Note'})	},
					{ name: 'Posts', data: $filter('filter')(user.created, {type: 'Post'}) }
				];
				
				$scope.currentFilter = $scope.filters[0];

				$scope.setFilter = function(filter){
					$scope.currentFilter = filter;
				}
			}
		);
	});