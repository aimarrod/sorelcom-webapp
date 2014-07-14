'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var q = require('./queries');
var geo = require('./../utils/geo');
var extend = require('extend');
var short = require('./../utils/shortcut');

module.exports.amenities = function(req, res){
  res.json(200, {
    categoryGroups: [
      {
        name: 'Sustenance',
        categories: [
          { name: 'Cafe', icon: { name: 'cafe', color: 'orange' } },
          { name: 'Restaurant', icon: { name: 'restaurant', color: 'green' } },
          { name: 'Bar', icon: { name: 'beer', color: 'darkred' } },
          { name: 'Pub', icon: { name: 'pub', color: 'darkpurple' } }
        ]
      },
      {
        name: 'Transportation',
        categories: [
          { name: 'Bike rental', icon: { name: 'bicycle', color: 'red' } },
          { name: 'Bike parking', icon: { name: 'bicycle', color: 'cadetblue' } },
          { name: 'Bus stop', icon: { name: 'bus', color: 'cadetblue'} },
          { name: 'Train station ', icon: { name: 'bus', color: 'cadetblue'} }
        ]
      },
      {
        name: 'Health',
        categories: [
          { name: 'Medical center', icon: { name: 'hospital', color: 'red' } },
          { name: 'Pharmacy', icon: { name: 'pharmacy', color: 'darkgreen' } }
        ]
      },
      {
        name: 'Culture / Tourism',
        categories: [
          { name: 'Artwork', icon: { name: 'art', color: 'darkred' } },
          { name: 'Museum', icon: { name: 'monument', color: 'purple' } },
          { name: 'University', icon: { name: 'university', color: 'darkred' } },
          { name: 'Zoo', icon: { name: 'zoo', color: 'orange' } },
          { name: 'Viewpoint', icon: { name: 'camera', color: 'darkgreen' } },
          { name: 'Information', icon: { name: 'info', color: 'blue' } },
          { name: 'Nature reserve', icon: { name: 'nature-reserve', color: 'darkgreen' }  },
          { name: 'Garden', icon: { name: 'garden', color: 'green' }  }
        ]
      },
      { name: 'Other',
        categories: [
          { name: 'Custom', icon: { name: 'marker', color: 'blue' }}
        ]
      }
    ]
  });
};

module.exports.within = function(req, res, next){
  var args = {
    geometry: geo.bboxToWKT(req.query.bbox)
  };

  if(req.query.type && (req.query.type === 'POI' || req.query.type === 'Track'))
    args.type = 'sorelcom:' + req.query.type;

  q.API.within(args, function(err, data){
    short.returnAll(err, data, res);
  });
};

module.exports.latest = function(req, res){
  q.API.latest(function(err, data){
    if(err) return res.send(500, err);
    res.json(data);
  });
};

module.exports.search = function(req, res, next){

  var filter = {
    trails: req.query.trails === 'true',
    pois: req.query.pois === 'true',
    users: req.query.users === 'true',
    minDifficulty: req.query.minDifficulty || 0,
    maxDifficulty: req.query.maxDifficulty || 100
  };

  if(!req.query.trails)
    filter.trails = true;
  if(!req.query.pois)
    filter.pois = true;
  if(!req.query.users)
    filter.users = true;

  if(!filter.trails && !filter.pois && !filter.users)
    return res.json([]);

  q.API.search(req.query.query || '', filter, function (err, data){
    if(err) return res.send(500, err);
    res.json(data);
  });
};

module.exports.info = function(req, res, next){
  q.API.info(function (err, data){
    if(err) return res.send(500, err);
    res.json(data);
  });
};
