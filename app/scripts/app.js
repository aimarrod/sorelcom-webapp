
var sorelcomApp = angular.module('sorelcomApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'ui.router',
  'leaflet-directive'
]);

sorelcomApp.config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/main.html',
        controller: 'RouteController'
      })
      .otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true); 
});

