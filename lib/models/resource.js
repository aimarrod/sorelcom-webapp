'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ResourceSchema = new Schema({
  type: String,
});

var Resource = mongoose.model('Resource', ResourceSchema);

module.exports = {
  next: function nextId (type, done) {
    var thing = new Resource({type: type});
  	thing.save(function(err, resource){
  		if(err) return done(err)

  		done(null, resource)
  	});
  }
}