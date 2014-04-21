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

   Track.create("user"+req.user._id, req.body, function(err, data){
    if(err) {
      return res.json(500, err);}
    res.json(data);
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
      Track.update(req.body, function(err, data){
        console.log(err);
        if(err) return res.send(500, err);

        res.send(200);
      });
};

/**
 * Get current user
 */
exports.list = function(req, res) {
    Track.list(function(err, data){
      if(err) return res.send(500, err);
      
      res.json(data);
    });
};