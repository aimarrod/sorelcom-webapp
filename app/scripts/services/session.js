'use strict';

angular.module('pruebaApp')
  .factory('Session', function ($resource) {
    return $resource('/api/session/');
  });
