'use strict';

angular.module('sorelcomApp')
  .controller('NavbarCtrl', function ($scope, $location, Modal, $state, Auth) {
    $scope.menu = [{
        'title': 'HOME',
        'state': 'web.home'
      }, {
        'title': 'MAP',
        'state': 'map.explore'
      }, {
        'title': 'BROWSE',
        'state': 'web.search'
      }];

    $scope.state = $state;

    /** Open login modal */
      $scope.login = function login(){
        Modal.login().then(function() {
          if($state.includes('signup'))
            $state.go('home');
        });
      };

    $scope.logout = function() {
      Auth.logout();
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
