var geo = require('./../lib/utils/geo');
var request = require('request');
var clc = require('cli-color');
var util = require('./utils');
var constants = require('./constants');

function OSMAggregator(finish){
  var that = this;

  this.queryForm = { data: '[out:json];\n\
    node\n\
      ["amenity"~""]\n\
      (' + constants.bbox + ');\n\
      out body;'};

  this.categories = {
    'restaurant': 'Restaurant',
    'fast_food': 'Restaurant',
    'food_court': 'Restaurant',
    'bar': 'Bar',
    'cafe': 'Cafe',
    'pub': 'Pub',
    'pharmacy': 'Pharmacy',
    'Medical clinic': 'Hospital',
    'clinic': 'Hospital',
    'hospital': 'Hospital',
    'doctors': 'Doctors',
    'bus_stop': 'Bus Stop',
    'bus_station': 'Bus Stop',
    'train_station': 'Train Station',
    'university': 'University',
    'college': 'University',
    'arts_center': 'Art',
    'fountain': 'Viewpoint',
    'bridge': 'Viewpoint',
    'bicycle_parking': 'Bike parking',
    'garden': 'Garden',
    'nature_reserve': 'Nature Reserve'
  };

  this.run = function(){
    console.log("Downloading Points of Interest from OSM...");
    request(
      {
        uri: 'http://overpass-api.de/api/interpreter',
        form: this.queryForm,
        method: 'POST',
        json: true
      },
      this.process
    );
  };

  this.process = function(err, res, body){
    console.log('Download finished, got ' + body.elements.length + ' points.');

    that.extracted = [];
    console.log("Starting processing...");

    var results = body.elements; //Get results;
    for(var i = 0, l = results.length; i < l; i++){
      var node = results[i];
      if(node.lat === undefined || node.lon === undefined || !node.tags || !node.tags.name || !that.categories[node.tags.amenity]){
        continue;
      } else {
        var poi = {
          id: node.id,
          author: 'OpenStreetMap',
          lat: node.lat,
          lon: node.lon,
          description: node.tags.description,
          category: that.categories[node.tags.amenity],
          name: node.tags.name
        };
        that.extracted.push(poi);
      }
    }
    console.log('Extracted ' + clc.green(that.extracted.length) + ' valid points of interest.');
    finish(that.extracted);
  }
}

module.exports = OSMAggregator;
