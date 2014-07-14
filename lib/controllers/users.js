'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var passport = require('passport');
var fs = require('fs');
var gm = require('gm');
var q = require('./queries');
var short = require('./../utils/shortcut');
var ResourceController = require('./resources');

function UserController(){
  var that = this;
  this.queryMaker = q.User;
  this.prototype = new ResourceController(this.queryMaker);


  this.new = function (req, res, next) {
    req.body.avatar = '/images/default.png';
    var newUser = new User(req.body);
    newUser.provider = 'local';
    console.log(req.body);
    newUser.save(function(err) {
      if (err) return res.json(400, err);
      //Save user to triplestore, if it was correctly saved to database
      newUser.saveToTriplestore(function(err){
        //If user could not be saved, remove from database
        if(err){
          newUser.remove();
          return res.json(500, err);
        }
        //Log in user, for convenience
        req.logIn(newUser, function(err) {
          if (err) return next(err);
          return res.json(req.user.userInfo);
        });
      });
    });
  };

  this.update = function(req, res, next){
    that.queryMaker.update(req.user.name, req.body, function(err, data){
      short.returnOK(err, data, res);
    });
  };


  this.changePassword = function(req, res, next) {
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

  this.me = function(req, res, next) {
    if(!req.user) return res.send(401);
    that.queryMaker.prototype.get(req.user.name, function(err, data){
      short.returnOne(err, data, res);
    });
  };

  this.setAvatar = function(req, res){
    if(!req.user)
      return res.send(401);

    if(req.body.flowChunkNumber !== req.body.flowTotalChunks)
      return res.send(200); //Check for chunk validity

    short.saveImage(req.files.file, 'user/', function(err, name){
      if(err) return res.send(500, "Image could not be saved");
      that.queryMaker.setAvatar(req.user.name, name, function(err, data){
        short.returnOK(err, data, res);
      });
    });
  };

  this.trails = function(req, res){
    that.queryMaker.trails(req.params.id, function(err, data){
      short.returnAll(err, data, res);
    });
  };

  this.pois = function(req, res){
    that.queryMaker.pois(req.params.id, function(err, data){
      short.returnAll(err, data, res);
    });
  };

  this.traversed = function(req, res){
    if(req.query.trail){
      that.queryMaker.hasTraversed(req.params.id, req.query.trail, function(err, data){
        short.returnOne(err, data, res);
      });
    } else {
      that.queryMaker.traversed(req.params.id, function(err, data){
        short.returnAll(err, data, res);
      });
    }
  };

  this.buddies = function(req, res){
    if(req.query.buddy){
      that.queryMaker.isBuddy(req.params.id, req.query.buddy, function(err, data){
        short.returnOne(err, data, res);
      });
    }else{
      that.queryMaker.buddies(req.params.id, function(err, data){
        short.returnAll(err, data, res);
      });
    }
  };

  this.followers = function(req, res){
    that.queryMaker.followers(req.params.id, function(err, data){
      short.returnAll(err, data, res);
    });
  };

  this.traverse = function(req, res){
    that.queryMaker.traverse(req.params.id, req.body.trail, function(err, data){
      short.returnOK(err, data, res);
    });
  };

  this.addBuddy = function(req, res){
    that.queryMaker.addBuddy(req.params.id, req.user.name, function(err, data){
      short.returnOK(err, data, res);
    });
  };

  this.follow = function(req, res){
    that.queryMaker.follow(req.params.id, req.user.name, function(err, data){
      short.returnOK(err, data, res);
    });
  };

  this.recommended = function(req, res){
    that.queryMaker.recommended(req.user.name, function(err, data){
      short.returnAll(err, data, res);
    });
  };
}

module.exports = function(app){
  var controller = new UserController();
  app.post('/api/users', controller.new);
  app.get('/api/users', controller.prototype.getList);
  app.get('/api/users/me', controller.me);
  app.put('/api/users/me', controller.update);
  app.get('/api/users/me/recommended', controller.recommended);
  app.post('/api/users/me/avatar', controller.setAvatar);
  app.get('/api/users/:id', controller.prototype.get);
  app.get('/api/users/:id/trails', controller.trails);
  app.get('/api/users/:id/pois', controller.pois);
  app.get('/api/users/:id/traversed', controller.traversed);
  app.post('/api/users/:id/traversed', controller.traverse);
  app.get('/api/users/:id/buddies', controller.buddies);
  app.post('/api/users/:id/buddies', controller.addBuddy);
  app.get('/api/users/:id/followers', controller.followers);
  app.post('/api/users/:id/followers', controller.follow);
};
