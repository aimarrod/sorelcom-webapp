'use strict';

angular.module('sorelcomApp')
  .factory('Track', function ($resource) {
    return $resource('/api/tracks/:id', {
      id: '@id'
    }, { //parameters default
      update: {
        method: 'PUT',
        params: {}
      },
      pages: {
        method: 'GET',
        params: {id: 'pages'}
      }
  	});
  });

angular.module('sorelcomApp')
  .factory('POI', function ($resource) {
    return $resource('/api/pois/:id', {
      id: '@id'
    }, { //parameters default
      update: {
        method: 'PUT',
        params: {}
      },
      pages: {
        method: 'GET',
        params: {id: 'pages'}
      }
  	});
  });

angular.module('sorelcomApp')
  .factory('Note', function ($resource) {
    return $resource('/api/notes/:id', {
      id: '@id'
    }, { //parameters default
      update: {
        method: 'PUT',
        params: {}
      },
      pages: {
        method: 'GET',
        params: {id: 'pages'}
      }
  	});
  });