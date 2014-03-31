'use strict';

angular.module('sorelcomApp')
  .factory('Session', function ($resource) {
    return $resource('/api/session/');
  });
