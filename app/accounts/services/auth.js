'use strict';

angular.module('sorelcomApp')
  .factory('Auth', function Auth($location, $rootScope, Modal, Session, $cookieStore, API) {

    var api = API.all('users');
    // Get currentUser from cookie
    $rootScope.currentUser = $cookieStore.get('user') || null;
    $cookieStore.remove('user');

    return {

      /**
       * Authenticate user
       *
       * @param  {Object}   user     - login info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      login: function(user, callback) {
        var cb = callback || angular.noop;

        return Session.save({
          email: user.email,
          password: user.password
        }, function(user) {
          $rootScope.currentUser = user;
          return cb();
        }, function(err) {
          return cb(err);
        }).$promise;
      },

      /**
       * Unauthenticate user
       *
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      logout: function(callback) {
        var cb = callback || angular.noop;

        return Session.delete(function() {
            $rootScope.currentUser = null;
            return cb();
          },
          function(err) {
            return cb(err);
          }).$promise;
      },

      /**
       * Create a new user
       *
       * @param  {Object}   user     - user info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      createUser: function(user, success, error) {
        var su = success || angular.noop;
        var er = error || angular.noop;
        api.post(user).then(
          function(user) {
            $rootScope.currentUser = user;
            return su(user);
          },
          function(err) {
            return er(err);
          });

      },

      /**
       * Change password
       *
       * @param  {String}   oldPassword
       * @param  {String}   newPassword
       * @param  {Function} callback    - optional
       * @return {Promise}
       */
      changePassword: function(oldPassword, newPassword, callback) {
        var cb = callback || angular.noop;

        return User.update({
          oldPassword: oldPassword,
          newPassword: newPassword
        }, function(user) {
          return cb(user);
        }, function(err) {
          return cb(err);
        }).$promise;
      },

      /**
       * Gets all available info on authenticated user
       *
       * @return {Object} user
       */
      currentUser: function() {
        return User.get();
      },

      /**
       * Simple check to see if a user is logged in
       *
       * @return {Boolean}
       */
      isLoggedIn: function() {
        var user = $rootScope.currentUser;
        return !!user;
      },
      isSameUser: function(name){
        return !!$rootScope.currentUser && $rootScope.currentUser.name === name;
      },
      loggedUser: function(){
        return $rootScope.currentUser;
      },
      requireLogin: function (callback){
        if(!$rootScope.currentUser){
          Modal.login().then(
            function success() {
              callback()
            }, function cancel() {
              //What to do
            }
          );
        } else {
          callback();
        }
      },
    };
  });
