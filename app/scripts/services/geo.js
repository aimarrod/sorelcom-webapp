angular.module('sorelcomApp')
  .factory('Geo', function Geo($location, $http) {
  	return {
  		nearby: function(id, success, error){
  			$http.get('/api/nearby/'+id)
  				.success(success)
  				.error(error);
  		}
  	}
  });
