'use strict';

angular.module('sorelcomApp')
  .factory('Track', function ($resource) {
    return $resource('/api/tracks/:id');
  });

angular.module('sorelcomApp')
  .factory('POI', function ($resource) {
    return $resource('/api/pois/:id');
  });

angular.module('sorelcomApp')
  .factory('Note', function ($resource) {
    return $resource('/api/notes/:id');
  });