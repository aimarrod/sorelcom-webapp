'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    passport = require('passport'),
    fs = require('fs'),
    gm = require('gm');
var q = require('./queries');


exports.create = function (req, res, next) {
  req.body.avatar = '/images/default.png';  
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.save(function(err) {
    if (err) return res.json(400, err);
    //Save user to triplestore, if it was correctly saved to database
    newUser.saveToTriplestore(function(err){
      //If user could not be saved, remove from database
      if(err){
        newUser.remove();
        return res.json(400, err);
      }
      //Log in user, for convenience
      req.logIn(newUser, function(err) {
        if (err) return next(err);
        return res.json(req.user.userInfo);
      });
    });
  });
};

/**
 *  Get profile of specified user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  q.showUser(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(404);

    res.send(user);
  });
};

/**
 * Change password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return res.send(400);

        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Get current user
 */
exports.me = function(req, res, next) {
  if(!req.user) return res.send(401);

  q.showUser(req.user._id, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(404);

    res.send(user);
  });
};

/**
 * Get list of users
 */
exports.list = function(req, res){
 q.userList(function (err, users) {
   if(err) return res.send(500, err);
   res.json(users);  
  });
};