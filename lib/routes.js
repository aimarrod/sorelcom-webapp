'use strict';

var index = require('./controllers'),
    users = require('./controllers/users'),
    session = require('./controllers/session'),
    models = require('./controllers/models'),
    files = require('./controllers/files');


var middleware = require('./middleware');

/**
 * Application routes
 */
module.exports = function(app) {

  /** Track CRUD methods */
  app.post('/api/tracks', models.Track.create);
  app.put('/api/tracks', models.Track.update);
  app.get('/api/tracks/:id', models.Track.show);
  //app.post('/api/tracks/:id/media', models.Track.addMedia);
  app.get('/api/tracks/:id/media', models.Track.showMedia);
  app.post('/api/tracks/:id/post', models.Track.createPost);
  app.get('/api/tracks/:id/post', models.Track.showPosts);
  app.get('/api/tracks', models.Track.list);


  /** POI CRUD methods */
  app.post('/api/pois', models.POI.create);
  app.put('/api/pois', models.POI.update);
  app.get('/api/pois/pages', models.POI.pages);
  app.get('/api/pois/:id', models.POI.show);
  app.get('/api/pois', models.POI.list);

  /** Common methods */
  app.get('/api/(tracks|pois)/:id/media', models.Model.media);
  app.get('/api/(tracks|pois)/:id/nearby', models.Model.nearby);
  app.get('/api/(tracks|pois)/:id/within', models.Model.within);
  app.get('/api/(tracks|pois)/:id/buffer', models.Model.buffer);
  app.get('/api/latest', models.Model.latest);
  
  /** File upload methods */
  app.post('/api/files/User', files.uploadAvatar);
  app.post('/api/files/:type/:id', files.upload);

  /** TO DO */
  app.post('/api/notes', models.Note.create);
  app.put('/api/notes', models.Note.update);
  app.get('/api/notes/:id', models.Note.show);
  app.get('/api/notes', models.Note.list);

  /** User methods */
  app.post('/api/users', users.create);
  app.put('/api/users', users.changePassword);
  app.get('/api/users', users.list);
  app.get('/api/users/me', users.me);
  app.get('/api/users/:id', users.show);

  /** Session methods */
  app.post('/api/session', session.login);
  app.del('/api/session', session.logout);

  app.get('/api/info', models.info);
  app.get('/api/search', models.search);

  // All undefined api routes return a 404
  app.get('/api/*', function(req, res) {
    res.send(404);
  });
  
  // All other routes to use Angular routing in app/scripts/app.js
  app.get('/partials/*', index.partials);
  app.get('/*', middleware.setUserCookie, index.index);
};