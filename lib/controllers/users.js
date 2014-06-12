'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var passport = require('passport');
var fs = require('fs');
var gm = require('gm');
var q = require('./queries');
var short = require('./../utils/shortcut');


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
exports.get = function (req, res, next) {
  q.User.get(req.params.id, function(err, data){
    short.returnOne(err, data, res);
  });
};

/**
 * Update profile of a person
 */

exports.update = function(req, res, next){
  q.User.update(req.user.name, req.body, function(err, data){
    short.returnOK(err, data, res);
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
  q.User.get(req.user.name, function(err, data){
    short.returnOne(err, data, res);
  });
};

exports.setAvatar = function(req, res){
  if(!req.user)
    return res.send(401);

  if(req.body.flowChunkNumber !== req.body.flowTotalChunks)
    return res.send(200); //Check for chunk validity

  short.saveImage(req.files.file, function(err, name){
    if(err) return res.send(500, "Image could not be saved");
    q.User.setAvatar(req.user.name, name, function(err, data){
      short.returnOK(err, data, res);
    });
  });
};

/** ------- Getters -------- */

exports.list = function(req, res){
 q.User.list(function(err, data){
   short.returnAll(err, data, res);
 });
};

exports.trails = function(req, res){
  q.User.trails(req.params.id, function(err, data){
    short.returnAll(err, data, res);
  });
};

exports.pois = function(req, res){
  q.User.pois(req.params.id, function(err, data){
    short.returnAll(err, data, res);
  });
};

exports.traversed = function(req, res){
  if(req.query.trail)
    q.User.hasTraversed(req.params.id, req.query.trail, function(err, data){
      short.returnOne(err, data, res);
    });
  else
    q.User.traversed(req.params.id, function(err, data){
      short.returnAll(err, data, res);
    });
};

exports.buddies = function(req, res){
  if(req.query.buddy)
    q.User.isBuddy(req.params.id, req.query.buddy, function(err, data){
      short.returnOne(err, data, res);
    });
  else
    q.User.buddies(req.params.id, function(err, data){
      short.returnAll(err, data, res);
    });
};

exports.followers = function(req, res){
  q.User.followers(req.params.id, function(err, data){
    short.returnAll(err, data, res);
  });
};

/** ------- Setters -------- */

exports.traverse = function(req, res){
  q.User.traverse(req.params.id, req.body.trail, function(err, data){
    short.returnOK(err, data, res);
  });
};

exports.addBuddy = function(req, res){
  q.User.addBuddy(req.params.id, req.user.name, function(err, data){
    short.returnOK(err, data, res);
  });
};

exports.follow = function(req, res){
  q.User.follow(req.params.id, req.user.name, function(err, data){
    short.returnOK(err, data, res);
  });
};
