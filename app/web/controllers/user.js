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
        }
      );
    };

    $scope.removeBuddy = function(){
      $scope.imBuddy = false;
    }

    $scope.showing = 'trails';
  });
