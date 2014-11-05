var short = require('./../utils/shortcut');

function ResourceController(queryMaker){
  this.queryMaker = queryMaker;
  var that = this;

  this.get = function(req, res, next){
    that.queryMaker.prototype.get(req.params.id, function(err, data){
      short.returnOne(err, data, res);
    });
  };

  this.getList = function(req, res, next){
    that.queryMaker.prototype.getList(function(err, data){
      short.returnAll(err, data, res);
    });
  };

  this.addImage = function(req, res, next){
    var extension = req.body.flowFilename.split('.').pop();
    if(req.body.flowChunkNumber !== req.body.flowTotalChunks)
      return res.send(200); //Check for chunk validity

    short.saveImage(req.files.file, '', function(err, name){
      if(err) return res.send(500);
      that.queryMaker.prototype.addImage(req.params.id, req.user.name, name, function(err, data){
        short.returnOK(err, data, res);
      });
    });
  };

  this.getImages = function(req, res, next){
    that.queryMaker.prototype.getImages(req.params.id, function(err, data){
      short.returnAll(err, data, res);
    });
  };

  this.addPost = function(req, res, next){
    that.queryMaker.prototype.addPost(req.params.id, req.user.name, req.body.review, function(err, data){
      short.returnOK(err, data, res);
    });
  };

  this.getPosts = function(req, res, next){
    that.queryMaker.prototype.getPosts(req.params.id, function(err, data){
      short.returnAll(err, data, res);
    });
  };

  this.nearby = function(req, res, next){
    that.queryMaker.prototype.nearby(req.params.id, {distance: 1000}, function(err, data){
      short.returnOne(err, data, res);
    });
  };

  this.rating = function(req, res, next){
    that.queryMaker.prototype.rating(req.params.id, function(err, data){
      short.returnOne(err, data, res);
    });
  };
}

module.exports = ResourceController;
