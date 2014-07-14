angular.module('sorelcomApp').controller('EndpointCtrl', function ($scope, $http, API){

  $scope.query = '';
  $scope.results = null;
  var sparql = API.one('sparql');

  sparql.one('namespaces').get().then(
    function success(data){
      $scope.prefixes = data;
    }
  );

  $scope.submit = function(){
    $scope.results = null;
    $http.get('/api/sparql', {params: { query: $scope.query }}).then(
      function success(response){
        $scope.results = response.data;
      },
      function error(err){
        $scope.err = err;
      }
    )
  }

});
