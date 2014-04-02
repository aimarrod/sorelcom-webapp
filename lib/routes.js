'use strict';

var api = require('./controllers/api'),
    index = require('./controllers'),
    users = require('./controllers/users'),
    tracks = require('./controllers/tracks'),
    pois = require('./controllers/pois'),
    notes = require('./controllers/notes'),
    session = require('./controllers/session');

var middleware = require('./middleware');

/**
 * Application routes
 */
module.exports = function(app) {

  // Server API Routes
  app.post('/api/tracks', tracks.create);
  app.put('/api/tracks', tracks.update);
  app.get('/api/tracks/:id', tracks.show);
  app.get('/api/tracks', tracks.list);

  app.post('/api/notes', notes.create);
  app.put('/api/notes', notes.update);
  app.get('/api/notes/:id', notes.show);
  app.get('/api/notes', notes.list);

  app.post('/api/pois', pois.create);
  app.put('/api/pois', pois.update);
  app.get('/api/pois/:id', pois.show);
  app.get('/api/pois', pois.list);

  app.post('/api/users', users.create);
  app.put('/api/users', users.changePassword);
  app.get('/api/users', users.list);
  app.get('/api/users/me', users.me);
  app.get('/api/users/:id', users.show);


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