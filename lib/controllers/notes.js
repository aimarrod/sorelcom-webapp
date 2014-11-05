'use strict';

var q = require('./queries');
var geo = require('./../utils/geo');
var extend = require('extend');
var short = require('./../utils/shortcut');
var ResourceController = require('./resources');

function PointOfInterestController(){
  var that = this;
  this.queryMaker = q.Note;
  this.prototype = new ResourceController(this.queryMaker);

  this.new = function (req, res, next) {

    var properties = {
      author: req.user.name,
      description: req.body.properties.content,
      range: req.body.properties.range,
      public: req.body.properties.public,
      targets: req.body.properties.targets,
      geometry: req.body.geometry
    };

    that.queryMaker.new(properties, function(err, data){
      short.returnOK(err, data, res);
    });

  };
}

module.exports = function(app){
  var controller = new PointOfInterestController();
  app.post('/api/notes', controller.new);
  app.post('/api/notes/:id/images', controller.prototype.addImage);
  app.get('/api/notes/:id/images', controller.prototype.getImages);
};
