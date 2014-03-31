
var app = angular.module('sorelcomApp');


app.factory('AuthenticationService', function($http){
	var user = undefined;
	//Load user

	return {
		login: function(credentials){
			var login = $http.post('login', credentials);
			login.success(function(data, status, headers, config){
				user = data.user;
			});
			login.error(function(data, status, headers, config){
				console.log('Login error');
				console.log(status);
			});
		},
		logout:function(){
			var logout = $http.post('logout');
			logout.success(function(data, status, headers, config){
				delete user;
			});
			logout.error(function(data, status, headers, config){
				console.log('Logout error');
			});
		},
		isAuthenticated: function(){
			return Boolean(user);
		}
	};
});

angular.module('sorelcomApp').controller('AuthenticationController', function ($scope, $modal) {
    $scope.authenticated = false;

    $scope.logout = function(){
    	$scope.authenticated = false;
    }

    $scope.open = function () {

    var modalInstance = $modal.open({
      templateUrl: '/views/loginModal.html',
      controller: ModalInstanceCtrl
    });

    modalInstance.result.then(function (selectedItem) {
    }, function () {
      $scope.authenticated = !$scope.authenticated;
       console.log('Modal dismissed at: ' + new Date());

    });
  };
});

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

var ModalInstanceCtrl = function ($scope, $modalInstance) {

  $scope.credentials = {};
  $scope.error = {
    hidden: true
  }

  $scope.login = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}

angular.module('sorelcomApp').controller("RouteController", [ '$scope', function($scope) {
    var geojson = {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [125.6, 10.1]
        },
        "properties": {
        "name": "Dinagat Islands"
      }
    }

    $scope.change = function(){
      $scope.geojson = {
        data: {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [0, 0]
        },
        "properties": {
        "name": "Dinagat Islands"
      }
    }
  }
    }

    angular.extend($scope, {
        taipei: {
            lat: 25.0391667,
            lng: 121.525,
            zoom: 6
        },
        layers: {
            baselayers: {
                osm: {
                    name: 'OpenStreetMap',
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    type: 'xyz'
                },
                ocm: {
                    name: 'OpenCycleMap',
                    url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
                    type: 'xyz'
                },
                cloudmade2: {
                    name: 'Cloudmade Tourist',
                    type: 'xyz',
                    url: 'http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png',
                    layerParams: {
                        key: '007b9471b4c74da4a6ec7ff43552b16f',
                        styleId: 7
                    }
                }
            }
        },
        geojson: {
          data: geojson
        }
    });
} ]);