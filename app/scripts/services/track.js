'use strict';

angular.module('sorelcomApp')
  .factory('Track', function ($resource) {
    return $resource('/api/tracks/:id');
  });