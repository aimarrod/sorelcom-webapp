'use strict';

var Track = require('./../models/track');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var q = require('./queries');

module.exports = {
	Track: {},
	POI: {},
	Note: {}
}

/**
	Track functions
*/

module.exports.Track.create = function (req, res, next) {
  if(!req.user)
    return res.json(500, "user is not logged in");

  var properties = {
    id: 'Track' + req.body.properties.name.split(' ').join('_'),
    type: 'sorelcom:Track',
    author: 'user' + req.user._id,
    name: req.body.properties.name,
    date: new Date(),
    content: req.body.properties.content,
    geometry: req.body.geometry
  };

  q.create(properties, function(err, data){
    if(err) return res.json(500, err);
    res.json(data);
  });
};


module.exports.Track.show = function (req, res, next) {
  q.showTrack(req.params.id, function (err, data){
    if(err) return res.json(500, err);
    return res.json(data);
  });
};


module.exports.Track.update = function(req, res, next) {
  res.send(404);
};

module.exports.Track.list = function(req, res) {
  q.list('Track', function (err, data){
    if(err) return res.send(500, err);
    res.json(data);
  });
};

module.exports.Track.pages = function(req, res){
  q.pages('sorelcom:Track', function(err, data){
    if(err) return res.send(500, err);
    res.json(data);    
  });
}

/**
	Point of Interest functions
*/

module.exports.POI.create = function (req, res, next) {
  if(!req.user)
    return res.json(500, "user is not logged in");

  var properties = {
    id: 'POI' + req.body.properties.name.split(' ').join('_'),
    type: 'sorelcom:POI',
    author: 'user' + req.user._id,
    date: new Date(),
    name: req.body.properties.name,
    content: req.body.properties.content,
    geometry: req.body.geometry
  };

  q.create(properties, function(err, data){
    if(err) return res.json(500, err);
    res.json(data);
  });
};

module.exports.POI.show = function (req, res, next) {
  q.showPOI(req.params.id, function (err, data){
    if(err) return res.json(500, err);
    return res.json(data);
  });
};


module.exports.POI.update = function(req, res, next) {
  res.send(404);
};

module.exports.POI.list = function(req, res) {
  q.list('POI', function (err, data){
    if(err) return res.send(500, err);
    res.json(data);
  });
};

module.exports.POI.pages = function(req, res){
  q.pages('sorelcom:POI', function(err, data){
    if(err) return res.send(500, err);
    res.json(data);    
  });
};