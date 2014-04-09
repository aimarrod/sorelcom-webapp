'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ResourceSchema = new Schema({
  type: String,
});

var Resource = mongoose.model('Resource', ResourceSchema);

module.exports = {
  nextId: function nextId (type) {
    return new Resource({type: type})._id;
  }
}