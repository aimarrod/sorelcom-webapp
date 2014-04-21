'use strict';

var POI = require('./../models/poi');
    

/**
 * Create POI
 */
exports.create = function (req, res, next) {
  if(!req.user)
   return res.json(500, "user is not logged in");

   POI.create("user"+req.user._id, req.body, function(err, data){
    if(err) return res.json(500, err);
    res.json(data);
   });
};

/**
 *  Get details of a POI
 */
exports.show = function (req, res, next) {
  POI.findById(req.params.id, function (err, data){
    if(err) return res.json(500, err);
    
    return res.json(data);
  });
};

/**
 * Update POI
 */
exports.update = function(req, res, next) {
  console.log(req.body);
  POI.update(req.body, function(err, data){
    if(err) return res.send(500, err);
    
    res.send(200);
  });
};

/**
 * Get list of all POIs
 */
exports.list = function(req, res) {
    POI.list(function(err, data){
      if(err){
        return res.send(500, err);
      }
      console.log(data);
      res.json(data);
    });
};