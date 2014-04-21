
var app = angular.module('sorelcomApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'angularFileUpload',
  'ui.bootstrap',
  'ui.validate',
  'ui.router',
  'leaflet-directive'
]);

app.config(function ($stateProvider, $urlRouterProvider) {
    
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'partials/home.html',
      controller: 'HomeController'
    })

    .state('settings', {
      url: '/settings',
      templateUrl: 'partials/settings.html',
      controller: 'RouteController'
    })

    .state('map', {
      url: '/map',
      templateUrl: 'partials/map/map.html',
      controller: 'MapCtrl'
    })

    .state('map.editor', {
      url: '/editor',
      templateUrl: 'partials/map/editor.html',
      controller: 'EditorCtrl'  
    })

    .state('map.explore', {
      url: '/explore',
      templateUrl: 'partials/map/explore.html',
      controller: 'ExploreCtrl'  
    })

    .state('signup', {
      url: '/signup',
      templateUrl: 'partials/signup.html',
      controller: 'SignupCtrl'
    })

    .state('upload', {
      url: '/upload',
      templateUrl: 'partials/upload.html',
      controller: 'UploadCtrl'
    })

    .state('users', {
      url: '/users',
      templateUrl: 'partials/users.html',
      controller: 'UserCtrl'
    })

    .state('profile', {
      url: '/profile',
      templateUrl: 'partials/profile.html',
      controller: 'ProfileCtrl'
    })

    .state('browse', {
      url: '/browse',
      templateUrl: 'partials/browse/browse.html',
      controller: 'BrowseCtrl'
    })

    .state('browse.pois', {
      url: '/pois',
      templateUrl: 'partials/browse/pois.html',
      controller: 'POIListCtrl'
    })

    .state('browse.pois.detail', {
      url: '/{id}',
      templateUrl: 'partials/browse/pois_detail.html',
      controller: 'POIDetailCtrl'
    })

    .state('browse.users', {
      url: '/users',
      templateUrl: 'partials/browse/users.html',
      controller: 'UserListCtrl'
    })

    .state('browse.users.detail', {
      url: '/{id}',
      templateUrl: 'partials/browse/users_detail.html',
      controller: 'UserDetailCtrl'
    })

    .state('browse.tracks', {
      url: '/tracks',
      templateUrl: 'partials/browse/tracks.html',
      controller: 'TrackListCtrl'
    })

    .state('browse.tracks.detail', {
      url: '/{id}',
      templateUrl: 'partials/browse/tracks_detail.html',
      controller: 'TrackDetailCtrl'
    });

    $urlRouterProvider.otherwise('/');
});


app.run( function ($rootScope, $location, $modal, $state, Auth) {

    var loginRequired = ['settings', 'upload'];

    $rootScope.$on( "$stateChangeStart", function(event, next, current) {
        if(loginRequired.indexOf(next.name) > -1 && !Auth.isLoggedIn()){ 
          event.preventDefault();

          var modalInstance = $modal.open({
            templateUrl: 'partials/login.html',
            controller: 'LoginCtrl',
          });

          modalInstance.result.then(function (selectedItem) {
            $state.go(next.name);
          }, function () {
            if(!current.name)
              $state.go('home');
          });
        }

        if(Auth.isLoggedIn() && next.name=="signup"){
          event.preventDefault();
          $state.go('home');
        }
    });



});