'use strict';

var mongoose = require('mongoose'),
    passport = require('passport'),
    jwt = require('jwt-simple'),
    tokenSecret = require('../config/session').secret;

/**
 * Logout
 */
exports.logout = function (req, res) {
  req.logout();
  res.send(200);
};

/**
 * Login
 */
exports.login = function (req, res, next) {
  passport.authenticate('local', function(err, user, info) {
   
    var error = err || info;
    if (error) return res.json(401, error);

    var token = jwt.encode({ username: user.name }, tokenSecret);
    res.json({ token : token });
  })(req, res, next);
};