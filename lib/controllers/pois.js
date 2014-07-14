'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var q = require('./queries');
var geo = require('./../utils/geo');
var extend = require('extend');
var short = require('./../utils/shortcut');
var ResourceController = require('./resources');

function PointOfInterestController(){
  var that = this;
  this.queryMaker = q.Poi;
  this.prototype = new ResourceController(this.queryMaker);

  this.new = function (req, res, next) {
    if(!req.user)
      return res.json(401, 'User not logged in');

    var properties = {
      author: req.user.name,
      date: new Date(),
      name: req.body.properties.name,
      content: req.body.properties.content,
      category: req.body.properties.category,
      geometry: req.body.geometry
    };

    that.queryMaker.new(req.body.properties.name.split(' ').join('_'), properties, function(err, data){
      short.returnOK(err, data, res);
    });
  };
}

module.exports = function(app){
  var controller = new PointOfInterestController();
  app.post('/api/pois', controller.new);
  app.get('/api/pois', controller.prototype.getList);
  app.get('/api/pois/:id', controller.prototype.get);
  app.post('/api/pois/:id/images', controller.prototype.addImage);
  app.get('/api/pois/:id/images', controller.prototype.getImages);
  app.post('/api/pois/:id/post', controller.prototype.addPost);
  app.get('/api/pois/:id/post', controller.prototype.getPosts);
  app.get('/api/pois/:id/nearby', controller.prototype.nearby);
  app.get('/api/pois/:id/rating', controller.prototype.rating);
};
