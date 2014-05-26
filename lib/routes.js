'use strict';

var index = require('./controllers'),
    users = require('./controllers/users'),
    session = require('./controllers/session'),
    models = require('./controllers/models'),
    files = require('./controllers/files'),
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

  /** Track CRUD methods */
  app.post('/api/tracks', models.Track.create);
  app.put('/api/tracks', models.Track.update);
  app.get('/api/tracks/:id', models.Track.show);
  //app.post('/api/tracks/:id/media', models.Track.addMedia);
  app.get('/api/tracks/:id/media', models.Track.media);
  app.post('/api/tracks/:id/post', models.Track.createPost);
  app.get('/api/tracks/:id/post', models.Track.showPosts);
  app.get('/api/tracks', models.Track.list);

  /** POI CRUD methods */
  app.post('/api/pois', models.POI.create);
  app.put('/api/pois', models.POI.update);
  app.get('/api/pois/:id', models.POI.show);
  //app.post('/api/tracks/:id/media', models.Track.addMedia);
  app.get('/api/pois/:id/media', models.POI.media);
  app.post('/api/pois/:id/post', models.POI.createPost);
  app.get('/api/pois/:id/post', models.POI.showPosts);
  app.get('/api/pois', models.POI.list);
  
  /** File upload methods */
  app.post('/api/files/User', files.uploadAvatar);
  app.post('/api/files/:type/:id', files.upload);

  /** User methods */
  app.post('/api/users', users.create);
  app.put('/api/users', users.changePassword);
  app.get('/api/users', users.list);
  app.get('/api/users/me', users.me);
  app.get('/api/users/:id', users.show);

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