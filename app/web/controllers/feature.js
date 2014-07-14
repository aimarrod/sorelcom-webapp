angular.module('sorelcomApp')
  .controller('FeatureCtrl', function ($scope, $stateParams, leafletData, API, MapUtil, resource, Auth) {
    $scope.Math = window.Math;

    var feature = API.all(resource).one($stateParams.id);

    $scope.resource = feature;
    $scope.review = {}
    $scope.defaults = {
      maxZoom: 14
    }

    $scope.upvote = function(){
      $scope.review.value = 1;
    };

    $scope.downvote = function(){
      $scope.review.value = -1;
    };

    $scope.loadRating = function(){
      feature.getList('rating').then(
        function success(data){
          if(data[0].rating !== undefined)
            $scope.rating = data[0].rating;
        }
      );
    }

    $scope.loadPosts = function(){
      feature.getList('post').then(
        function success(data){
          $scope.posts = data;
          $scope.loadRating();
        },
        function error(err){
          $scope.review.error = err;
        }
      );
    };

    $scope.post = function(){
      Auth.requireLogin(function(){
        if(!$scope.review.text || !$scope.review.value)
          return;
        feature.all('post').post({ review: $scope.review }).then(
          function success(data){
            $scope.review = {};
            $scope.error = null;
            $scope.loadPosts();
          },
          function error(err){
            $scope.err = err;
          }
        );
      })
    };

    $scope.nearby = function(){
      leafletData.getMap('viewMap').then(function (map) {
        map.addLayer($scope.nearbyData);
        map.fitBounds($scope.nearbyData.getBounds());
      });
    };

    feature.get().then(
      function success(data){
        $scope.feature = data;
        if(data.properties.category)
          data.properties.type = 'Point of Interest';
        else
          data.properties.type = 'Trail';

        $scope.main = L.geoJson(data);
        leafletData.getMap('viewMap').then(function (map){
          map.fitBounds($scope.main.getBounds());
          $scope.main.addTo(map);

          API.get('within', { bbox: map.getBounds().toBBoxString() }).then(
            function success(data){
              $scope.nearbyData = MapUtil.loadPois(data);
            }
          );
        });
      }
    );


    $scope.loadPosts();
  });
