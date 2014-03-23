
var sorelcomApp = angular.module('sorelcomApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'leaflet-directive'
]);

sorelcomApp.config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'RouteController'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
