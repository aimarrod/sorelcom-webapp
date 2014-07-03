angular.module('sorelcomApp')
  .controller('NotificationCtrl', function ($scope, $rootScope, $timeout) {
  	$scope.notifications = []

  	$rootScope.$on('onNotification', function(event, type, message){
  		var notification = {
  			type: type,
  			message: message,
  			promise: $timeout(function(){
  				$scope.notifications.splice($scope.notifications.indexOf(notification), 1);
  			}, 5000)
  		}
  		$scope.notifications.push(notification);
  	});

  	$scope.remove = function(notification){
  		$scope.notifications.splice($scope.notifications.indexOf(notification), 1);
  		$timeout.cancel(notification.promise);
  	}	
  });


