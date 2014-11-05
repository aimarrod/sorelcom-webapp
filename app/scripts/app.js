'use strict';

var app = angular.module('sorelcomApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'ui.bootstrap',
  'ui.validate',
  'ui.router',
  'ui.router.util',
  'leaflet-directive',
  'flow',
  'restangular',
]);

app.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider.state('login', {
    url: '/login',
    templateUrl: 'partials/login/login.html',
    controller: 'LoginCtrl'
  });


  $urlRouterProvider.otherwise('/login');
});

/**

app.run( function ($rootScope, $location, Modal, $state, Auth) {

  var loginRequired = ['settings', 'upload'];

  $rootScope.$on( '$stateChangeStart', function(event, next, current) {
    if(loginRequired.indexOf(next.name) > -1 && !Auth.isLoggedIn()){
      event.preventDefault();

      var modalInstance = $modal.open({
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl',
      });

      modalInstance.result.then(function (selectedItem) {
        $state.go(next.name);
      }, function () {
        if(!current.name){
          $state.go('home');
        }
      });
    }

    if(Auth.isLoggedIn() && next.name === 'signup'){
      event.preventDefault();
      $state.go('home');
    }
  });

});
**/
