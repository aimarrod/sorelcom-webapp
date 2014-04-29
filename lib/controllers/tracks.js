'use strict';

var Track = require('./../models/track'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');
var q = require('./queries');


/**
 * Create user
 */
exports.create = function (req, res, next) {
  if(!req.user)
    return res.json(500, "user is not logged in");

  var properties = {
    id: 'Track' + req.body.properties.name.split(' ').join('_'),
    type: 'sorelcom:Track',
    author: req.user._id,
    name: req.body.properties.name,
    content: req.body.properties.content,
    geometry: req.body.geometry
  }

  q.create(properties, function(err, data){
    if(err) return res.json(500, err);
    res.json(data);
  });
};

/**
 *  Get profile of specified user
 */
exports.show = function (req, res, next) {
  q.showTrack(req.params.id, function (err, data){
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

exports.count = function(req, res, next){
  
}