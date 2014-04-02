'use strict';

var Note = require('./../models/note');

/**
 * Create user
 */
exports.create = function (req, res, next) {
  if(!req.user)
   return res.json(500, "user is not logged in");

   var newNote = Note.create("user"+req.user._id, req.body);
   newNote.save(function(err, data){
    if(err) return res.json(500, err);
    
    return res.json(newNote);
   });
};

/**
 *  Get profile of specified user
 */
exports.show = function (req, res, next) {
  Note.findById(req.params.id, function (err, data){
    if(err) return res.json(500, err);
    return res.json(data);
  });
};

/**
 * Change password
 */
exports.update = function(req, res, next) {
      res.send(403);
};

/**
 * Get current user
 */
exports.list = function(req, res) {
    Note.list(function(err, data){
      if(err){
        return res.send(500, err);
      }
      res.json(data);
    });
};