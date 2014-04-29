'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    passport = require('passport'),
    fs = require('fs'),
    gm = require('gm');
var q = require('./queries');

/**
 * Create user
 */
function save(file, cb){
  if(!file) return cb(null, 'default.png');
  
  var name = file.path.split('/').pop();
  var newPath = __dirname + "/../../app/images/" + name;
  gm(file.path)
    .resize(256, 256)
    .autoOrient()
    .write(newPath, function (err) {
      cb(err, name);
    });
}


exports.create = function (req, res, next) {
  save(req.files.avatar, function (err, name){
    if(err) return res.json(400, err);

    req.body.avatar = name;  
    var newUser = new User(req.body);
    newUser.provider = 'local';
    newUser.save(function(err) {
      console.log(err);
      if (err) return res.json(400, err);
      //Save user to triplestore, if it was correctly saved to database
      newUser.saveToTriplestore(function(err){
        console.log(err);
        if(err){
          newUser.remove();
          return res.json(400, err);
        }
        req.logIn(newUser, function(err) {
          console.log(err);
          if (err) return next(err);
  
          return res.json(req.user.userInfo);
        });
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
  var userId = 'user' + req.user._id;

  q.showUser(userId, function (err, user) {
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