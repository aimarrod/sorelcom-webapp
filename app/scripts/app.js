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
  $stateProvider.state('map', {
    url: '/map',
    templateUrl: 'partials/map/map.html',
    controller: 'MapCtrl'
  })

  .state('map.editor', {
    url: '/editor?id&upload',
    templateUrl: 'partials/map/editor.html',
    controller: 'EditorCtrl'
  })

  .state('map.explore', {
    url: '/explore?id',
    templateUrl: 'partials/map/explore.html',
    controller: 'ExploreCtrl'
  })

  .state('home', {
    url: '/home',
    templateUrl: 'partials/web/home.html',
    controller: 'HomeCtrl'
  })

  .state('signup', {
    url: '/signup',
    templateUrl: 'partials/accounts/signup.html',
    controller: 'SignupCtrl'
  })

  .state('profile', {
    url: '/profile',
    templateUrl: 'partials/accounts/profile.html',
    controller: 'ProfileCtrl'
  })

  .state('poi', {
    url: '/poi/{id}',
    templateUrl: 'partials/web/feature.html',
    controller: 'FeatureCtrl',
    resolve: {
      resource: function(){ return 'pois'; }
    }
  })

  .state('user', {
    url: '/user/{id}',
    templateUrl: 'partials/web/user.html',
    controller: 'UserCtrl'
  })

  .state('trail', {
    url: '/track/{id}',
    templateUrl: 'partials/web/feature.html',
    controller: 'FeatureCtrl',
    resolve: {
      resource: function(){ return 'trails'; }
    }
  })

  .state('search', {
    url: '/search',
    templateUrl: 'partials/web/search.html',
    controller: 'SearchCtrl'
  })

  .state('developers', {
    url: '/developers',
    templateUrl: 'partials/developers/home.html',
  })

  .state('endpoint', {
    url: '/endpoint',
    templateUrl: 'partials/developers/endpoint.html',
    controller: 'EndpointCtrl'
  });


  $urlRouterProvider.otherwise('/home');
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
