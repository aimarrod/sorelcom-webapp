'use strict';

var Track = require('./../models/track'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');
    

/**
 * Create user
 */
exports.create = function (req, res, next) {
  if(!req.user)
   return res.json(500, "user is not logged in");
  User.findById(req.user._id, function (err, user){
    if(err) return res.json(500, err);

    var newTrack = new Track(req.body);
    newTrack.author = "user"+req.user._id;
    newTrack.save(function(err, data){
      if(err) return res.json(500, err);
      
      user.addTrack(newTrack.id, function(err, results){
        if(err) return res.json(500, err);
        return res.json(newTrack.id);
      });
    });
  });



};

/**
 *  Get profile of specified user
 */
exports.show = function (req, res, next) {
  Track.findById(req.params.id, function (err, data){
    if(err) return res.json(500, err);
    return res.json(data);
  })
};

/**
 * Change password
 */
exports.update = function(req, res, next) {
      res.send(403);
};

/**
 * Get current user
 */
exports.list = function(req, res) {
    Track.list(function(err, data){
      if(err){
        return res.send(500, err);
      }
      res.json(data);
    });
};