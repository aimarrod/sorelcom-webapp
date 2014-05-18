angular.module('sorelcomApp')
	.controller('SearchCtrl', function ($scope, $q, $http, initData) {
    
    $scope.searchResults = initData;
    console.log(initData);


    $scope.POIClass = function(amenity){
      if(amenity === "Cultural")
        return "green";
      else if(amenity === "Bike")
        return "yellow";
      else if(amenity === "Cafe")
        return "orange";
      else
        return "red";
    }

    $scope.POIImage = function(amenity){
      if(amenity === "Cultural")
        return "cultural.png";
      else if(amenity === "Bike")
        return "bike.png";
      else if(amenity === "Cafe")
        return "cafe.png"
      else
        return "android.png";      
    }

    $scope.search = function(){
      if($scope.canceller)
        $scope.canceller.resolve();
      
      $scope.canceller = $q.defer();

      $http({method: 'GET', url: '/api/search', params: {query: $scope.query}, timeout: $scope.canceller.promise})
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


angular.module('sorelcomApp')
  .controller('TrackCtrl', function ($scope, $stateParams, Restangular, Track, leafletData) {
    var track = Restangular.one('api/tracks', $stateParams.id);
  
    $scope.loadPosts = function(){
      track.getList('post').then(
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
      track.all('post').post({ content: $scope.comment }).then(
        function success(data){
          $scope.loadPosts();
          $scope.comment = '';
        },
        function error(err){
          console.log(err);
        }
      );
    };

    track.get().then(
      function success(data){
        $scope.track = data;
        leafletData.getMap('viewMap').then(function (map){
          var layer = L.geoJson(data).addTo(map);
          map.fitBounds(layer.getBounds());
          //track.customGET('within', {bbox: map.getBounds().toBBoxString()});
        });
      }
    );

    track.getList('media').then(
      function success(data){
        console.log(data);
        $scope.images = data;
      },
      function error(err){
        console.log("Error retrieving media");
      }
    );

    $scope.loadPosts();
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