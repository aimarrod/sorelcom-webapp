angular.module('sorelcomApp')
  .controller('FeatureCtrl', function ($scope, $stateParams, leafletData, API, resource) {
    $scope.Math = window.Math;

    var feature = API.all(resource).one($stateParams.id);

    $scope.resource = feature;
    $scope.review = {}

    $scope.upvote = function(){
      $scope.review.value = 1;
    };

    $scope.downvote = function(){
      $scope.review.value = -1;
    };

    $scope.loadPosts = function(){
      feature.getList('post').then(
        function success(data){
          $scope.posts = data;
        },
        function error(err){
          $scope.review.error = err;
        }
      );
    };

    $scope.post = function(){
      if(!$scope.review.text || !$scope.review.value)
        return
      feature.all('post').post({ review: $scope.review }).then(
        function success(data){
          $scope.loadPosts();
          $scope.review = {};
        },
        function error(err){
          $scope.review.error = err;
        }
      );
    };

    feature.get().then(
      function success(data){
        $scope.feature = data;
        if(data.properties.category)
          data.properties.type = 'Point of Interest';
        else
          data.properties.type = 'Trail';

        leafletData.getMap('viewMap').then(function (map){
          var layer = L.geoJson(data).addTo(map);
          map.fitBounds(layer.getBounds());
        });
      }
    );

    $scope.loadPosts();
  });
