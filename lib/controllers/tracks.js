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

   var newTrack = Track.create("user"+req.user._id, req.body);
   newTrack.save(function(err, data){
    console.log(err, data);
    if(err) return res.json(500, err);
    
    return res.json(newTrack);
   });
};

/**
 *  Get profile of specified user
 */
exports.show = function (req, res, next) {
  Track.findById(req.params.id, function (err, data){
    if(err) return res.json(500, err);
    return res.json(data);
  });
};

/**
 * Change password
 */
exports.update = function(req, res, next) {
      console.log(req.body);
      Track.update(req.body, function(err, data){
        if(err) return res.send(500, err);

        res.send(200);
      });
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