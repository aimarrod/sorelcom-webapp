'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var q = require('./queries');
var geo = require('./../utils/geo');
var extend = require('extend');
var short = require('./../utils/shortcut');
var ResourceController = require('./resources');

function TrailController(){
  var that = this;
  this.queryMaker = q.Trail;
  this.prototype = new ResourceController(this.queryMaker);

  this.new = function (req, res, next) {
    if(!req.user)
      return res.json(401, 'User not logged in');

    var properties = {
      author: req.user.name,
      date: new Date(),
      name: req.body.properties.name,
      content: req.body.properties.content,
      geometry: req.body.geometry,
      gpx: req.body.properties.gpx || geo.geojsonToGPX(req.body)
    };

    extend(properties, geo.analyseGeojson(req.body.geometry));

    that.queryMaker.new(req.body.properties.name.split(' ').join('_'), properties, function(err, data){
      short.returnOK(err, data, res);
    });
  };
}

module.exports = function(app){
  var controller = new TrailController();
  app.post('/api/trails', controller.new);
  app.get('/api/trails', controller.prototype.getList);
  app.get('/api/trails/:id', controller.prototype.get);
  app.post('/api/trails/:id/images', controller.prototype.addImage);
  app.get('/api/trails/:id/images', controller.prototype.getImages);
  app.post('/api/trails/:id/post', controller.prototype.addPost);
  app.get('/api/trails/:id/post', controller.prototype.getPosts);
  app.get('/api/trails/:id/nearby', controller.prototype.nearby);
  app.get('/api/trails/:id/rating', controller.prototype.rating);

};
