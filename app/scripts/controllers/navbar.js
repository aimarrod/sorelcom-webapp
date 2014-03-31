'use strict';



angular.module('sorelcomApp')
  .controller('NavbarCtrl', function ($scope, $location, $modal, $state, Auth) {
    $scope.menu = [{
                'title': 'Home',
                'link': 'home'
              }, {
                'title': 'Conf',
                'link': 'settings'
              }, {
                'title': 'Upload',
                'link': 'upload'
              }, {
                'title': 'Browse',
                'link': 'browse'
              }];
    $scope.state = $state;

    /** Open login modal */
      $scope.login = function login(){
        var modalInstance = $modal.open({
          templateUrl: 'partials/login.html',
          controller: 'LoginCtrl',
        });

        modalInstance.result.then(function() {
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
