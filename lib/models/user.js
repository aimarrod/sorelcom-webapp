'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    db = require('./../connectors/parliament'),
    util = require('util'),
    q = require('./../controllers/queries');
  
var authTypes = ['github', 'twitter', 'facebook', 'google'];

/**
 * User Schema
 */
var UserSchema = new Schema({
/** Public attributes */
  name: String,
  email: String,
  avatar: String,
  tracks: [],
  pois: [],
  geoPostIts: [],
  posts: [],
  favourites: [],
/** Private attributes */
  role: {
    type: String,
    default: 'user'
  },
  hashedPassword: String,
  provider: String,
  salt: String,
  facebook: {},
  twitter: {},
  github: {},
  google: {}
});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Basic info to identify the current authenticated user in the app
UserSchema
  .virtual('userInfo')
  .get(function() {
    return {
      'id': this._id,
      'name': this.name,
      'role': this.role,
      'provider': this.provider
    };
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      'name': this.name,
      'email': this.email,
      'avatar': this.avatar,
      'tracks': this.tracks,
      'pois': this.pois,
      'role': this.role
    };
  });

//Shortened profile, only returns track/poi list, to avoid network overload
UserSchema
  .virtual('short')
  .get(function() {
    return {
      'id': this._id,
      'name': this.name,
      'email': this.email,
      'avatar': this.avatar,
      'tracks': this.tracks.length,
      'pois': this.pois.length,
      'geoPostIts': this.geoPostIts.length,
      'posts': this.posts.length
    };
  });
    
/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
      next(new Error('Invalid password'));
    else
      next();
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  },

  /** 
   * Saves the user to the triplestore
   * 
   * @param {function} Callback to return
   * @api public 
   */
  saveToTriplestore: function(done){
    var params = 
      {
        id: 'user'+this._id,
        type: 'sioc:UserAccount',
        email: this.email,
        name: this.name,
        avatar: this.avatar
      }
    q.create(params, done);
  }
};

UserSchema.statics.list = function(done){
  var bindings = '?id ?name ?avatar (COUNT(?track) AS ?tracks) (COUNT(distinct ?poi) AS ?pois) (COUNT(distinct ?note) AS ?notes) (COUNT(distinct ?post) AS ?posts)';
  var triples = '?id rdf:type sioc:UserAccount . \n' +
      '?id sioc:name ?name . \n' +
      '?id sioc:avatar ?avatar . \n' +
      '?id sioc:creator_of ?list .' +  
      'OPTIONAL { ?list rdf:rest*/rdf:first ?track . ?track rdf:type sorelcom:Track . } \n' +
      'OPTIONAL { ?list rdf:rest*/rdf:first ?poi . ?poi rdf:type sorelcom:POI . } \n' +
      'OPTIONAL { ?list rdf:rest*/rdf:first ?note . ?note rdf:type sorelcom:Note . } \n' +
      'OPTIONAL { ?list rdf:rest*/rdf:first ?post . ?post rdf:type sioc:Post . }';
  var extras = 'group by ?id ?name ?avatar ?list';
  db.select(bindings, triples, extras, done);
};

UserSchema.statics.profile = function(id, done){
  var triples = util.format('sorelcom:%s sioc:name ?name . ', id) +
    util.format('sorelcom:%s sioc:email ?email . ', id) +
    util.format('sorelcom:%s sioc:avatar ?avatar . ', id);

  db.select(null, triples, null, function(err, user){
    if(err) return done(err);

    user = user[0];
    var trackTriples = util.format('sorelcom:%s sioc:creator_of ?list . ?list rdf:rest*/rdf:first ?id . ?id sioc:name ?name . ?id rdf:type sorelcom:Track .', id);
    var poiTriples = util.format('sorelcom:%s sioc:creator_of ?list . ?list rdf:rest*/rdf:first ?id . ?id sioc:name ?name . ?id rdf:type sorelcom:POI .' , id);
    var geoPostItTriples = util.format('sorelcom:%s sioc:creator_of ?list . ?id rdf:rest*/rdf:first ?id . ?id sioc:name ?name . ?id rdf:type sorelcom:Note .', id);
    var postTriples = util.format('sorelcom:%s sioc:creator_of ?list . ?list rdf:rest*/rdf:first ?id . ?id sioc:name ?name . ?id rdf:type sioc:Post .' , id);
    
    db.select(null, trackTriples, null, function(err, tracks){
      if(err) user.tracks = [];
      else user.tracks = tracks;
      db.select(null, poiTriples, null, function(err, pois){
        if(err) user.pois = [];
        else user.pois = pois;
        db.select(null, geoPostItTriples, null, function(err, notes){
          if(err) user.notes = [];
          else user.notes = notes;
          db.select(null, postTriples, null, function(err, posts){
            if(err) user.posts = [];
            else user.posts = posts;
            done(null, user);
          });
        });
      });
    });
  });
};


module.exports = mongoose.model('User', UserSchema);