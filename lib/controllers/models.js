'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var q = require('./queries');
var geo = require('./../utils/geo');
var extend = require('extend');
var short = require('./../utils/shortcut');


module.exports.Trail = {};
module.exports.Poi = {};

module.exports.Trail.new = function (req, res, next) {
  if(!req.user)
    return res.json(500, "user is not logged in");

  var properties = {
    author: req.user.name,
    date: new Date(),
    name: req.body.properties.name,
    content: req.body.properties.content,
    geometry: req.body.geometry,
		gpx: req.body.properties.gpx || geo.geojsonToGPX(req.body)
  };

  extend(properties, geo.analyseGeojson(req.body.geometry));

  q.Trail.new(req.body.properties.name.split(' ').join('_'), properties, function(err, data){
    short.returnOK(err, data, res);
  });
};

module.exports.Trail.get = function(req, res, next){
	q.Trail.get(req.params.id, function(err, data){
    short.returnOne(err, data, res);
  });
};

module.exports.Trail.getList = function(req, res, next){
	q.Trail.getList(function(err, data){
    short.returnAll(err, data, res);
  });
};

module.exports.Trail.addImage = function(req, res, next){
  var extension = req.body.flowFilename.split('.').pop();
  if(!req.user)
    return res.send(401);
  if(req.body.flowChunkNumber !== req.body.flowTotalChunks)
    return res.send(200); //Check for chunk validity

  short.saveImage(req.files.file, function(err, name){
    if(err) return res.send(500);
    q.Trail.addImage(req.params.id, req.user.name, name, function(err, data){
      short.returnOK(err, data, res);
    });
  });
};

module.exports.Trail.getImages = function(req, res, next){
	q.Trail.getImages(req.params.id, function(err, data){
    short.returnAll(err, data, res);
  });
};

module.exports.Trail.addPost = function(req, res, next){
	q.Trail.addPost(req.params.id, req.user.name, req.body.text, function(err, data){
    short.returnOK(err, data, res);
  });
};

module.exports.Trail.getPosts = function(req, res, next){
	q.Trail.getPosts(req.params.id, function(err, data){
    short.returnAll(err, data, res);
  });
};

module.exports.Poi.new = function (req, res, next) {
  if(!req.user)
    return res.json(500, "user is not logged in");

  var properties = {
    author: req.user.name,
    date: new Date(),
    name: req.body.properties.name,
    content: req.body.properties.content,
    category: req.body.properties.category,
    geometry: req.body.geometry
  };

  q.Poi.new(req.body.properties.name.split(' ').join('_'), properties, function(err, data){
    short.returnOK(err, data, res);
  });
};

module.exports.Poi.get = function(req, res, next){
	q.Trail.get(req.params.id, function(err, data){
    short.returnOne(err, data, res);
  });
};

module.exports.Poi.getList = function(req, res, next){
	q.Poi.getList(function(err, data){
    short.returnAll(err, data, res);
  });
};

module.exports.Poi.addImage = function(req, res, next){
  var extension = req.body.flowFilename.split('.').pop();
  if(!req.user)
    return res.send(401);
  if(req.body.flowChunkNumber !== req.body.flowTotalChunks)
    return res.send(200); //Check for chunk validity

  short.saveImage(req.files.file, function(err, name){
    if(err) return res.send(500);
    q.Poi.addImage(req.params.id, req.user.name, name, function(err, data){
      short.returnOK(err, data, res);
    });
  });
};

module.exports.Poi.getImages = function(req, res, next){
	q.Poi.getImages(req.params.id, function(err, data){
    short.returnAll(err, data, res);
  });
};

module.exports.Poi.addPost = function(req, res, next){
	q.Poi.addPost(req.params.id, req.user.name, req.body.text, function(err, data){
    short.returnOK(err, data, res);
  });
};

module.exports.Poi.getPosts = function(req, res, next){
	q.Poi.getPosts(req.params.id, function(err, data){
    short.returnAll(err, data, res);
  });
};
