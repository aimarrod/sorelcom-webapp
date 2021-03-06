angular.module('sorelcomApp')
  .controller('ProfileCtrl', function ($scope, $rootScope, $filter, API) {
  	var resource = API.all('users');

    resource.one('me').getList().then(
      function success(data){
        $scope.user = data[0];
        $scope.user.route = '';
        loadRecommendations();
        loadTrails();
        loadPois();
        loadBuddies();
        loadFollowers();
      }
    );

    $scope.saveChanges = function(){
      $scope.user.put().then(
        function success(){
          $scope.$emit('onNotification', 'success', 'Changes saved');
        },
        function error(err){
          $scope.err = err;
        }
      );
    };

    function loadRecommendations(){
      resource.one('me').getList('recommended').then(
        function success(data){
          $scope.recommendations = data;
        }
      );
    }

    function loadTrails() {
      resource.one($scope.user.name).getList('trails').then(
        function success(data){
          $scope.trails = data;
        }
      );
    }

    function loadPois() {
      resource.one($scope.user.name).getList('pois').then(
        function success(data){
          $scope.pois = data;
        }
      );
    }

    function loadFollowers() {
      resource.one($scope.user.name).getList('followers').then(
        function success(data){
          $scope.followers = data;
        }
      );
    }

    function loadBuddies() {
      resource.one($scope.user.name).getList('buddies').then(
        function success(data){
          $scope.buddies = data;
        }
      )
    }
	});
