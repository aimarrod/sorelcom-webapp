'use strict';

var index = require('./controllers'),
    session = require('./controllers/session'),
    api = require('./controllers/api');


var middleware = require('./middleware');

/**
 * Application routes
 */
module.exports = function(app) {

  /** API base methods */
  app.get('/api/within', api.within);
  app.get('/api/amenities', api.amenities);
  app.get('/api/latest', api.latest);
  app.get('/api/info', api.info);
  app.get('/api/search', api.search);

  require('./controllers/trails')(app);
  require('./controllers/pois')(app);
  require('./controllers/users')(app);


  /** Session methods */
  app.post('/api/session', session.login);
  app.del('/api/session', session.logout);

  // All undefined api routes return a 404
  app.get('/api/*', function(req, res) {
    res.send(404);
  });

  // All other routes to use Angular routing in app/scripts/app.js
  app.get('/partials/*', index.partials);
  app.get('/*', middleware.setUserCookie, index.index);
};
