var request = require('request');
var OSMAggregator = require('./OSMAggregator');
var constants = require('./constants');
var fs = require('fs');


var osmFile = 'osm.json'
var osmJSON = require('./osm.json')
var place = osmJSON[osmJSON.length-1];

console.log(place);

request(
  {
    uri: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
    qs: {
      location: place.lat+','+place.lon,
      radius: 50,
      key: constants.googleAPIKey
    },
    method: 'GET',
    json: true
  },
  function(err, res, body){
    console.log(body);
  }
);
/*
new OSMAggregator(function(data){
  console.log(data.length);
  fs.writeFile(osmFile, JSON.stringify(data), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("JSON saved to " + osmFile);
    }
});
}).run();
*/
