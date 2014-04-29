
var app = angular.module('sorelcomApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'angularFileUpload',
  'ui.bootstrap',
  'ui.validate',
  'ui.router',
  'ui.router.util',
  'leaflet-directive',
  'flow'
]);

app.config(function ($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider) {

    $stateProvider.state('web', {
      url: '/',
      templateUrl: 'partials/layout.html',
    })

    .state('map', {
      url: '/map',
      templateUrl: 'partials/map/map.html',
      controller: 'MapCtrl'
    })

    .state('map.editor', {
      url: '/editor?id&upload',
      templateUrl: 'partials/map/editor.html',
      controller: 'EditorCtrl'  
    })

    .state('map.explore', {
      url: '/explore?id',
      templateUrl: 'partials/map/explore.html',
      controller: 'ExploreCtrl'  
    })

    .state('web.signup', {
      url: '/signup',
      templateUrl: 'partials/signup.html',
      controller: 'SignupCtrl'
    })

    .state('web.home', {
      url: 'home',
      templateUrl: 'partials/home.html', 
      controller: 'HomeController'
    })

    .state('web.profile', {
      url: 'profile',
      templateUrl: 'partials/profile.html',
      controller: 'ProfileCtrl'
    })

    .state('web.poi', {
      url: 'poi/{id}',
      templateUrl: 'partials/poi.html',
      controller: 'POICtrl'
    })

    .state('web.user', {
      url: 'user/{id}',
      templateUrl: 'partials/user.html',
      controller: 'UserCtrl'
    })

    .state('web.track', {
      url: '/{id}',
      templateUrl: 'partials/track.html',
      controller: 'TrackCtrl'
    })

    .state('web.search', {
      url: 'search',
      templateUrl: 'partials/search/search.html',
      controller: 'BrowseCtrl'
    })

    .state('web.search.pois', {
      url: '/poi/list/{page}',
      templateUrl: 'partials/search/pois.html',
      controller: 'POIListCtrl'
    })

    .state('web.search.users', {
      url: '/user/list/{page}',
      templateUrl: 'partials/search/users.html',
      controller: 'UserListCtrl'
    })

    .state('web.search.tracks', {
      url: '/track/list{page}/',
      templateUrl: 'partials/search/tracks.html',
      controller: 'TrackListCtrl'
    });

    $urlRouterProvider.otherwise('/home');
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