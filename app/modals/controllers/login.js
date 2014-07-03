'use strict';

angular.module('sorelcomApp')
  .controller('LoginCtrl', function ($scope, Auth, $modalInstance) {
    $scope.user = {};
    $scope.errors = {};

    $scope.login = function(form) {
      $scope.errors = {};
      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function (data) {
          $modalInstance.close();
        }, function (err) {
          err = err.data;
          $scope.errors.other = err.message;
        });
      }
    };

    $scope.cancel =  function(event){
      if(event)
        event.preventDefault();
      $modalInstance.dismiss('cancel');  
    };
  });