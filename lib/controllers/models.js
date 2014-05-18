'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var q = require('./queries');
var geo = require('./../utils/geo');
var extend = require('extend');


module.exports = {
	Model: {},
  Track: {},
	POI: {},
	Note: {},
};

var config = {
  distance: 1000
};

module.exports.info = function(req, res, next){
  q.metaInfo(function (err, data){
    if(err) return res.send(500, err);
    res.json(data);
  });
};

module.exports.search = function(req, res, next){
  console.log(req.query);
  q.search(req.query.query || '', function (err, data){
    if(err) return res.send(500, err);
    res.json(data);
  });
};

module.exports.Model.media =  function(req, res, next) {
  q.media(req.params.id, function (err, data){
    if(err) return res.send(500, err);
    res.json(data);
  });
};

module.exports.Model.latest = function(req, res){
  q.latest(function(err, data){
    if(err) return res.send(500, err);
    res.json(data);    
  });
};

module.exports.Model.nearby = function(req, res, next){
  var properties = {
    id: req.params.id,
    distance: req.params.distance || config.distance
  };

  q.nearby(properties, function(err, data){
    if(err) return res.send(500, err);
    res.json(data);
  });
};

module.exports.Model.buffer = function(req, res, next){
  var properties = {
    id: req.params.id,
    distance: req.params.distance || config.distance
  };

  q.buffer(properties, function(err, data){
    if(err) return res.send(500, err);
    res.json(data);
  });
};

module.exports.Model.within = function(req, res, next){
  var properties = {
    bbox: req.query.bbox,
    distance: config.distance
  };

  q.within(properties, function(err, data){
    if(err) return res.send(500, err);
    res.json(data);
  });
};

/** Track functions **/

module.exports.Track.create = function (req, res, next) {
  if(!req.user)
    return res.json(500, "user is not logged in");

  var geometryData = geo.analyseGeojson(req.body.geometry);

  var properties = {
    id: ['track', req.body.properties.name.split(' ').join('_')],
    type: 'sorelcom:Track',
    author: req.user._id,
    date: new Date(),
    name: req.body.properties.name,
    content: req.body.properties.content,
    geometry: req.body.geometry,
  };

  extend(properties, geometryData);

  q.create(properties, function(err, data){
    if(err) return res.json(500, err);
    res.json({id: properties.id});
  });
};

module.exports.Track.createPost = function (req, res, next) {
  if(!req.user)
    return res.json(500, "user is not logged in");

  q.count({type: 'sioc:Post', container: { type: 'track', id: req.params.id }}, function(err, number){
    var properties = {
      id: ['track', req.params.id, 'post', number],
      type: 'sioc:Post',
      author: req.user._id,
      date: new Date(),
      content: req.body.content,
      container: {
        type: 'track',
        id: req.params.id
      }
    };

    q.create(properties, function(err, data){
      if(err) return res.json(500, err);
      res.send(200, 'OK');
    });
  });
};

module.exports.Track.showPosts = function (req, res, next){
  q.showPosts(['track', req.params.id], function(err, data){
    if(err) return res.json(500, err);
    return res.json(data);
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
};

module.exports.Track.showMedia = function(req, res){
  q.showMedia(['track', req.params.id], function(err, data){
    if(err) return res.send(500, err);
    res.json(data);
  });
};

/**
	Point of Interest functions
*/

module.exports.POI.create = function (req, res, next) {
  if(!req.user)
    return res.json(500, "user is not logged in");

  var properties = {
    id: ['POI', req.body.properties.name.split(' ').join('_')],
    type: 'sorelcom:POI',
    author: req.user._id,
    date: new Date(),
    name: req.body.properties.name,
    content: req.body.properties.content,
    geometry: req.body.geometry
  };

  q.create(properties, function(err, data){
    if(err) return res.json(500, err);
    res.json({id: properties.id});
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

/** Note functions */

module.exports.Note.create = function (req, res, next) {
  if(!req.user)
    return res.json(500, "user is not logged in");

  var properties = {
    id: ['Note', req.body.properties.name.split(' ').join('_')],
    type: 'sorelcom:Note',
    author: req.user._id,
    date: new Date(),
    content: req.body.properties.content,
    geometry: req.body.geometry
  };

  q.create(properties, function(err, data){
    if(err) return res.json(500, err);
    res.json({id: properties.id});
  });
};

module.exports.Note.show = function (req, res, next) {
  q.showNote(req.params.id, function (err, data){
    if(err) return res.json(500, err);
    return res.json(data);
  });
};


module.exports.Note.update = function(req, res, next) {
  res.send(404);
};

module.exports.Note.list = function(req, res) {
  q.list('POI', function (err, data){
    if(err) return res.send(500, err);
    res.json(data);
  });
};

module.exports.Note.pages = function(req, res){
  q.pages('sorelcom:POI', function(err, data){
    if(err) return res.send(500, err);
    res.json(data);    
  });
};

module.exports.Note.media = function(req, res, next) {
  q.media(req.params.id, function (err, data){
    if(err) return res.send(500, err);
    res.json(data);
  });
};

