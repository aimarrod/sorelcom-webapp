var request = require('request');
var util = require('util');
var geo = require('./geo');

function toRow(binding){
  var json = {};
  for(var key in binding){
      var element = binding[key];
      if(element.type === "uri"){
        json[key] = element.value.split(/[#\/]+/).pop();
      } else if(element.datatype === "http://www.opengis.net/ont/sf#wktLiteral" || element.datatype === 'http://www.opengis.net/ont/geosparql#wktLiteral'){
        json.geometry = geo.parse(element.value);
      } else if(element.datatype === 'http://www.w3.org/2001/XMLSchema#boolean'){
        json[key] = Boolean(element.value);
      } else if(element.datatype === 'http://www.w3.org/2001/XMLSchema#integer' || element.datatype === 'http://www.w3.org/2001/XMLSchema#long'){
        json[key] = parseInt(element.value);
      } else if(element.datatype === 'http://www.w3.org/2001/XMLSchema#float'){
        json[key] = parseFloat(element.value);
      } else if(!element.datatype) {
        json[key] = element.value;
      }
  }
  return json;
}

function toRows(data){
    var json = [];
    var bindings = data.results.bindings;
    for(var i = 0, len = bindings.length; i < len; i++)
        json.push(toRow(bindings[i]));
    return json;
}

function toGeoJSON(json){
  if(json.length === 1){
    var feature = { type: 'Feature', geometry: json[0].geometry, properties: json[0] };
    delete feature.properties.geometry;
    return feature;
  } else if(json.length > 1){
    var featureC = {	type: 'FeatureCollection', features: [] };
    for(var i = 0, l = json.length; i < l; i++){
      featureC.features[i] = { type: 'Feature', geometry: json[i].geometry, properties: json[i] };
      delete featureC.features[i].properties.geometry;
    }
    return featureC;
  } else {
    return { type: 'FeatureCollection', features: [] };
  }
}


function SparqlClient(endpoint, prefixes){
  this.endpoint = endpoint;
  this.prefixes = prefixes;

  /** Select triples from the endpoint */
  this.select = function(params, done) {
    var bindings = params.bindings || '*';
    var extras = params.extras || '';
    var select = params.select || '?s ?p ?o';

    request.post(
      {
        uri: this.endpoint,
        json: true,
        form: {
          query: util.format('%s SELECT %s WHERE { %s } %s', this.prefixes, bindings, select, extras),
          output: 'json'
        }
      }, function (err, res, body) {
        if(err || res.statusCode !== 200)
          return done(err || 'Could not access database (response: ' + res.statusCode + ')');
        done(null, toRows(body));
      }
    );
  };

  this.geojson = function(params, done) {
    this.select(params, function(err, rows){
      if(err || !rows || rows.length === 0) return done(err || 'No results');
      done(null, toGeoJSON(rows));
    });
  };

  this.geojsonArray = function(params, done) {
    this.select(params, function(err, rows){
      if(err) return done(err);
      var geojson = [];
      for(var i = 0, l = rows.length; i < l; i++){
        geojson.push(toGeoJSON([rows[i]]));
      }
      done(null, geojson);
    });
  };

  this.count = function(params, done){
    this.select(params, function(err, rows){
      if(err || !rows || rows.length === 0) return done(err || 'No results');
      done(null, rows[0].count);
    });
  };

  this.ask = function(triples, done){
    request.post(
      {
        uri: this.endpoint,
        json: true,
        form: {
          query: util.format('%s ASK { %s } ', this.prefixes, triples),
          output: 'json'
        },
      },
      function (err, res, body) {
        if(err || res.statusCode !== 200)
          return done(err || 'Could not access database (response: ' + res.statusCode + ')');
        done(null, body.boolean);
      }
    );
  };

  this.modify = function(params, done){
    var del = params.delete || '';
    var insert = params.insert || '';
    var where = params.where || '';

    request(
      {
        uri: this.endpoint,
        method: 'POST',
        json: true,
        form: {
          update: util.format('%s DELETE { %s } INSERT { %s } WHERE { OPTIONAL { %s } }', this.prefixes, del, insert, where),
          output: 'json'
        },
      }, function (err, res, body) {
        if(!err && res.statusCode !== 200)
          err = 'Could not access database (response: ' + res.statusCode + ')';
        done(err);
      }
    );
  };

  this.insert = function(data, done){
    var triples = '';
    for(var i = 0, l = data.length; i < l; i++){
      triples += data[i].uri + ' ';
      var keys = Object.keys(data[i].properties);
      for(var j = 0, n = keys.length; j < n; j++)
        triples += keys[j] + ' ' + data[i].properties[keys[j]] + (j === n-1)?'.':';';
    }
    this.modify({triples: triples}, done);
  };
}

module.exports = SparqlClient;
