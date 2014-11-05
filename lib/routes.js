'use strict';

var index = require('./controllers'),
    session = require('./controllers/session'),
    api = require('./controllers/api'),
    jwt = require('jwt-simple'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    passport = require('passport');


var middleware = require('./middleware');

/**
 * Application routes
 */
module.exports = function(app) {

  app.post('/api/session', session.login);
  app.del('/api/session', session.logout);


  app.all('/api/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

  app.all('/api/*',function(req, res, next) {
    var username = req.get('x-username');
    var token = req.get('x-token');
    if(!token || !username){
      return res.status(401).json({error: 'Missing parameters'});
    }
    User.findOne({username: username}, function (err, user) {

          if (err) {
            return res.status(401).json({error: err});
          }

          if (!user) {
            return res.status(401).json({error: 'User not found'});
          }

          if (jwt.decode(token).username === user.name) {
            return res.status(401).json({error: 'Invalid token'});
          }

          req.user = user;
          next();
    });
  });

  /** API base methods */
  app.get('/api/within', api.within);
  app.get('/api/amenities', api.amenities);
  app.get('/api/latest', api.latest);
  app.get('/api/info', api.info);
  app.get('/api/search', api.search);

  require('./controllers/trails')(app);
  require('./controllers/pois')(app);
  require('./controllers/notes')(app);
  require('./controllers/users')(app);
  require('./controllers/endpoint')(app);


  /** Session methods */

  // All undefined api routes return a 404
  app.get('/api/*', function(req, res) {
    res.send(404);
  });

  // All other routes to use Angular routing in app/scripts/app.js
  app.get('/partials/*', index.partials);
  app.get('/*', middleware.setUserCookie, index.index);
};
