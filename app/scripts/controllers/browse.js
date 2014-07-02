angular.module('sorelcomApp')
	.controller('SearchCtrl', function ($scope, $q, $http, initData) {

    $scope.searchResults = initData;

		$scope.makeRef = function(item){
			if(item.type === 'Person')
				return 'user({id: item.id})'
			if(item.type === 'Trail')
				return 'trail({id: item.id})'
			if(item.type === 'PointOfInterest')
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

      $http({method: 'GET', url: '/api/search', params: {query: $scope.query}, timeout: $scope.canceller.promise})
      .success(function(data){
				console.log(data);
        $scope.canceller = null;
				if(data.length > 1 || data[0].type)
        	$scope.searchResults = data;
				else
					$scope.searchResults = [];
      })
      .error(function(err){
        $scope.canceller = null;
        $scope.$emit('onError', err);
      });
    };
  });


angular.module('sorelcomApp')
  .controller('FeatureCtrl', function ($scope, $stateParams, leafletData, API, resource) {
    $scope.Math = window.Math;
    var feature = API.all(resource).one($stateParams.id);

    $scope.resource = feature;

    $scope.loadPosts = function(){
      feature.getList('post').then(
        function success(data){
          $scope.posts = data;
        },
        function error(err){
          console.log(err);
        }
      );
    };

    $scope.post = function(){
      if(!$scope.comment)
        return
      feature.all('post').post({ text: $scope.comment }).then(
        function success(data){
          $scope.loadPosts();
          $scope.comment = '';
        },
        function error(err){
          console.log(err);
        }
      );
    };

    feature.get().then(
      function success(data){
        $scope.feature = data;
				console.log(data);
        leafletData.getMap('viewMap').then(function (map){
          var layer = L.geoJson(data).addTo(map);
          map.fitBounds(layer.getBounds());
        });
      }
    );

    $scope.loadPosts();
  });





//Finished (en principio)
angular.module('sorelcomApp')
  .controller('UserCtrl', function ($scope, $stateParams, Auth, API) {
  	var resource = API.all('users').one($stateParams.id);

		function loadTrails() {
			resource.getList('trails').then(
				function success(data){
					$scope.trails = data;
				}
			)
		}

		function loadPois() {
			resource.getList('pois').then(
				function success(data){
					$scope.pois = data;
				}
			)
		}

		function loadBuddies() {
			resource.getList('buddies').then(
				function success(data){
					$scope.buddies = data;
					if($scope.me!==undefined && $scope.me !== null){
						for(var i = 0, l = $scope.buddies.length; i < l; i++){
							if($scope.buddies[i].name === $scope.me.name){
								$scope.imBuddy = true;
								break;
							}
						}
					}
				}
			)
		}

		function loadFollowers(){
			resource.getList('followers').then(
				function success(data){
					$scope.followers = data;
					if($scope.me!==undefined && $scope.me !== null){
						for(var i = 0, l = $scope.followers.length; i < l; i++){
							if($scope.followers[i].name === $scope.me.name){
								$scope.imFollower = true;
								break;
							}
						}
					}
				}
			)
		}

		resource.get().then(
			function success(data){
				$scope.user = data[0];
				$scope.me = Auth.loggedUser();
				loadTrails();
				loadPois();
				loadBuddies();
				loadFollowers();
			}
		)

		$scope.show = function(name) {
			$scope.showing = name;
		};

		$scope.isMe = function(){
			return $scope.me===undefined || $scope.me===null || $scope.user.name === $scope.me.name;
		};

		$scope.follow = function(){
			resource.post('followers').then(
				function success(){
					$scope.imFollower = true;
				},
				function error(){
					console.log("EH");
				}
			);
		};

		$scope.unfollow = function(){
			$scope.imFollower = false;
		};

		$scope.addBuddy = function(){
			resource.post('buddies').then(
				function success(){
					$scope.imBuddy = true;
				},
				function error(){
					console.log("EH");
				}
			);
		};

		$scope.removeBuddy = function(){
			$scope.imBuddy = false;
		}

		$scope.showing = 'trails';
  });
