angular.module('sorelcomApp')
  .factory('API', function Geo(Restangular) {
  	return Restangular.all('api');
  });
