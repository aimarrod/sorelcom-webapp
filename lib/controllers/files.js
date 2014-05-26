'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var passport = require('passport');
var fs = require('fs');
var gm = require('gm');
var q = require('./queries');

function saveImage(file, done){
  var name = file.path.split('/').pop();  
  var newPath = __dirname + "/../../app/images/" + name;
  gm(file.path).resize(256, 256).autoOrient()
    .write(newPath, function (err) {
      done(err, name);
    });
}

module.exports.uploadAvatar = function(req, res, next){
	if(!req.user)
		return res.send(401);

	if(req.body.flowChunkNumber !== req.body.flowTotalChunks)
		return res.send(200); //Check for chunk validity

	saveImage(req.files.file, function(err, name){
		if(err) return res.send(500);
		q.modify({
			id: 'user'+req.user._id,
			avatar: name
		}, function(err, data){
			if(err)
				return res.send(500);
			res.send(200);
		});
	});
};

module.exports.upload = function(req, res, next){
	var extension = req.body.flowFilename.split('.').pop();
  if(!req.user)
    return res.send(401);
  if(req.body.flowChunkNumber !== req.body.flowTotalChunks)
    return res.send(200); //Check for chunk validity

  saveImage(req.files.file, function(err, name){
    if(err) return res.send(500);
    q.create({
      id: [(req.params.type.toLowerCase()==='track')?'track':'POI', req.params.id, 'sorelcom_hasMedia', name],
      type: 'sorelcom:Media',
      source: '/images/' + name,
      container: {
        type: (req.params.type.toLowerCase()==='track')?'track':'POI', 
        id: req.params.id
      }
    }, function(err, data){
      if(err)
        return res.send(500);
      res.send(200);
    });
  });
};