'use strict';

var index = require('./controllers'),
    users = require('./controllers/users'),
    session = require('./controllers/session'),
    models = require('./controllers/models'),
    api = require('./controllers/api');


var middleware = require('./middleware');

var pois = models.Poi;
var trails = models.Trail;

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

  /** Track CRUD methods */
  app.get('/api/trails', trails.getList);
  app.post('/api/trails', trails.new);
  app.get('/api/trails/:id', trails.get);
  app.post('/api/trails/:id/images', trails.addImage);
  app.get('/api/trails/:id/images', trails.getImages);
  app.post('/api/trails/:id/post', trails.addPost);
  app.get('/api/trails/:id/post', trails.getPosts);

  /** POI CRUD methods */
  app.get('/api/pois', pois.getList);
  app.post('/api/pois', pois.new);
  app.get('/api/pois/:id', pois.get);
  app.post('/api/pois/:id/images', pois.addImage);
  app.get('/api/pois/:id/images', pois.getImages);
  app.post('/api/pois/:id/post', pois.addPost);
  app.get('/api/pois/:id/post', pois.getPosts);

  /** User methods */
  app.post('/api/users', users.create);
  app.get('/api/users', users.list);
  app.get('/api/users/me', users.me);
  app.put('/api/users/me', users.update);
  app.post('/api/users/me/avatar', users.setAvatar);
  app.get('/api/users/:id', users.get);
  app.get('/api/users/:id/trails', users.trails);
  app.get('/api/users/:id/pois', users.pois);
  app.get('/api/users/:id/traversed', users.traversed);
  app.post('/api/users/:id/traversed', users.traverse);
  app.get('/api/users/:id/buddies', users.buddies);
  app.post('/api/users/:id/buddies', users.addBuddy);
  app.get('/api/users/:id/followers', users.followers);
  app.post('/api/users/:id/followers', users.follow);

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
