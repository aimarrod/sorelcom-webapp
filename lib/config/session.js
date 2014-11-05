var express = require('express'),
    mongoStore = require('connect-mongo')(express),
    config = require('./config');

module.exports = {
  key: 'express.sid',
  secret: 'sorelcom-secret',
  sessionStore: new mongoStore({
    url: config.mongo.uri,
    collection: 'sessions'
  }, function () {
    console.log("db connection open");
  })
};
