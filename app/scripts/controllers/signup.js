'use strict';

angular.module('sorelcomApp')
  .controller('SignupCtrl', function ($scope, $upload, Auth, $location) {
    $scope.user = {};
    $scope.errors = {};

    $scope.upload = function($files){
      $scope.user.avatar = $files[0];
    }

    $scope.register = function(form) {
      $scope.submitted = true;
  
      if(form.$valid) {
        Auth.createUser({
          name: $scope.user.name,
          email: $scope.user.email,
          password: $scope.user.password,
          avatar: $scope.user.avatar
        })
        .then( function() {
          // Account created, redirect to home
          $location.path('/');
        })
        .catch( function(err) {
          err = err.data;
          $scope.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function(error, field) {
            form[field].$setValidity('mongoose', false);
            $scope.errors[field] = error.message;
          });
        });
      }
    };
  });