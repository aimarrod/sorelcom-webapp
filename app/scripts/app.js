
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

app.config(function ($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider) {

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
      url: '/',
      templateUrl: 'partials/home.html',
      controller: 'HomeCtrl',
      resolve: {
        info: function($http) {
          return $http.get('/api/info')
            .then(function(data) { return data.data; });
        },
        slides: function($http) {
          return $http.get('/api/latest')
            .then(function(data) { return data.data; });
        }
      }
    })

    .state('signup', {
      url: '/signup',
      templateUrl: 'partials/signup.html',
      controller: 'SignupCtrl'
    })

    .state('profile', {
      url: '/profile',
      templateUrl: 'partials/profile.html',
      controller: 'ProfileCtrl'
    })

    .state('poi', {
      url: '/poi/{id}',
      templateUrl: 'partials/feature.html',
      controller: 'FeatureCtrl',
      resolve: {
        resource: function(){ return 'pois'; }
      }
    })

    .state('user', {
      url: '/user/{id}',
      templateUrl: 'partials/user.html',
      controller: 'UserCtrl'
    })

    .state('trail', {
      url: '/track/{id}',
      templateUrl: 'partials/feature.html',
      controller: 'FeatureCtrl',
      resolve: {
        resource: function(){ return 'trails'; }
      }
    })

    .state('search', {
      url: '/search',
      templateUrl: 'partials/search.html',
      controller: 'SearchCtrl',
      resolve: {
        initData: function($http) {
          return $http.get('/api/search')
            .then(function(data) { return data.data; });
        }
      }
    });

    $urlRouterProvider.otherwise('/');
});


app.run( function ($rootScope, $location, $modal, $state, Auth) {

    var loginRequired = ['settings', 'upload'];

    $rootScope.$on( "$stateChangeStart", function(event, next, current) {
        if(loginRequired.indexOf(next.name) > -1 && !Auth.isLoggedIn()){
          event.preventDefault();

          var modalInstance = $modal.open({
            templateUrl: 'partials/login.html',
            controller: 'LoginCtrl',
          });

          modalInstance.result.then(function (selectedItem) {
            $state.go(next.name);
          }, function () {
            if(!current.name)
              $state.go('home');
          });
        }

        if(Auth.isLoggedIn() && next.name=="signup"){
          event.preventDefault();
          $state.go('home');
        }
    });



});
