angular.module('sorelcomApp')
  .controller('ProfileCtrl', function ($scope, Auth) {
  	$scope.user = Auth.currentUser();
  });