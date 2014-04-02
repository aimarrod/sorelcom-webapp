
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
      views: {
        'header': { 
          templateUrl: 'partials/navbar.html',
          controller: 'NavbarCtrl'
        },
        'main': {
          templateUrl: 'partials/home.html',
          controller: 'MapController'
        }
      }
    })

    .state('settings', {
      url: '/settings',
      views: {
        'header': { 
          templateUrl: 'partials/navbar.html',
          controller: 'NavbarCtrl'
        },
        'main': {
          templateUrl: 'partials/settings.html',
          controller: 'RouteController'
        }
      }
    })

    .state('editor', {
      url: '/editor',
      views: {
        'header': { 
          templateUrl: 'partials/navbar.html',
          controller: 'NavbarCtrl'
        },
        'main': {
          templateUrl: 'partials/editor.html',
          controller: 'EditorCtrl'
        }
      }
    })

    .state('signup', {
      url: '/signup',
      views: {
        'header': { 
          templateUrl: 'partials/navbar.html',
          controller: 'NavbarCtrl'
        },
        'main': {
          templateUrl: 'partials/signup.html',
          controller: 'SignupCtrl'
        }
      }
    })


    .state('upload', {
      url: '/upload',
      views: {
        'header': { 
          templateUrl: 'partials/navbar.html',
          controller: 'NavbarCtrl',
        },
        'main': {
          templateUrl: 'partials/upload.html',
          controller: 'UploadCtrl'
        }
      }
    })

    .state('users', {
      url: '/users',
      views: {
        'header': { 
          templateUrl: 'partials/navbar.html',
          controller: 'NavbarCtrl'
        },
        'main': {
          templateUrl: 'partials/users.html',
          controller: 'UserCtrl'
        }
      }
    })

    .state('profile', {
      url: '/profile',
      views: {
        'header': { 
          templateUrl: 'partials/navbar.html',
          controller: 'NavbarCtrl'
        },
        'main': {
          templateUrl: 'partials/profile.html',
          controller: 'ProfileCtrl'
        }
      }
    })

    .state('browse', {
      url: '/browse',
      views: {
        'header': { 
          templateUrl: 'partials/navbar.html',
          controller: 'NavbarCtrl'
        },
        'main': {
          templateUrl: 'partials/browse/browse.html',
          controller: 'BrowseCtrl'
        }
      }
    })

    .state('browse.pois', {
      url: '/pois',
      templateUrl: 'partials/browse/pois.html',
      controller: 'POIListCtrl'
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