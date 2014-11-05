/*jshint multistr: true */

var geo = require('./../utils/geo');
var SparqlClient = require('./../utils/sparql');
var factory = require('./../utils/query_factory');
var util = require('util');
var dateutil = require('dateutil');

var client = new SparqlClient(
  'http://helheim.deusto.es:8080/openrdf-sesame/repositories/sorelcom',
  'PREFIX my: <http://sorelcom.com/>' +
  'PREFIX fn: <http://www.w3.org/2005/xpath-functions#>\n' +
  'PREFIX owl: <http://www.w3.org/2002/07/owl#>\n' +
  'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n' +
  'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n' +
  'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n' +
  'PREFIX dcterms: <http://purl.org/dc/terms/>\n' +
  'PREFIX sorelcom: <http://www.morelab.deusto.es/ontologies/sorelcom#>\n' +
  'PREFIX geo: <http://www.opengis.net/ont/geosparql#>\n' +
  'PREFIX geof: <http://www.opengis.net/def/function/geosparql/>\n' +
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n' +
  'PREFIX ma: <http://www.w3.org/ns/ma-ont#>\n' +
  'PREFIX rev: <http://purl.org/stuff/rev#>\n' +
  'PREFIX sf: <http://www.opengis.net/ont/sf#>\n' +
  'PREFIX units: <http://www.opengis.net/def/uom/OGC/1.0/>\n'
);

function ResourceQueryMaker(factory){
  var that = this;
  this.factory = factory;

  this.get = function(id, done){
    client.geojson(that.factory.get(id), done);
  };

  this.getList = function(done){
    client.select(that.factory.list(), done);
  };

  this.addImage = function(id, author, url, done){
    client.modify(that.factory.prototype.addImage(id, author, url, 0), done);
  };

  this.getImages = function(id, done){
    client.select(that.factory.prototype.getImages(id), done);
  };

  this.addPost = function(id, author, review, done){
    client.modify(that.factory.prototype.addPost(id, author, review), done);
  };

  this.getPosts = function(id, done){
    client.select(that.factory.prototype.getPosts(id), done);
  };

  this.nearby = function(id, filter, done){
    client.geojson(that.factory.prototype.nearby(id, filter), done);
  };

  this.rating = function(id, done){
    client.select(that.factory.prototype.rating(id), done);
  };
}

function TrailQueryMaker(){
  var that = this;
  this.factory = factory.Trail;
  this.prototype = new ResourceQueryMaker(this.factory);

  this.new = function(id, args, done){
    if(!id)
    return done('There is no URI');

    client.ask('?s rdf:label "'+ id + '" . ', function(err, exists){
      if(err) return done(err);
      if(exists) return done('Trail already exists');
      client.modify(that.factory.new(id, args), done);
    });
  };
}

function GeolocatedNoteQueryMaker(){
  var that = this;
  this.factory = factory.Note;
  this.prototype = new ResourceQueryMaker(this.factory);

  this.new = function(args, done){
    client.modify(that.factory.new(args), done);
  };
}

function PointOfInterestQueryMaker(){
  var that = this;
  this.factory = factory.Poi;
  this.prototype = new ResourceQueryMaker(this.factory);

  this.new = function(id, args, done){
    if(!id)
    return done('There is no URI');

    client.ask('?s rdf:label "'+ id + '" .', function(err, exists){
      if(err) return done(err);
      if(exists) return done('Point of Interest already exists');
      client.modify(that.factory.new(id, args), done);
    });
  };
}

function UserQueryMaker(){
  var that = this;
  this.factory = factory.User;
  this.prototype = new ResourceQueryMaker(this.factory);

  this.new = function(args, done){
    client.ask('?s rdf:label "'+ args.name + '" .', function(err, exists){
      if(err) return done(err);
      if(exists) return done('User already exists');
      client.modify(that.factory.new(args), done);
    });
  };

  this.prototype.get = function(id, done){
    client.select(that.factory.get(id), done);
  };

  this.update = function(id, args, done){
    client.modify(that.factory.update(id, args), done);
  };

  this.trails = function(id, done){
    client.select(that.factory.trails(id), done);
  };

  this.pois = function(id, done){
    client.select(that.factory.pois(id), done);
  };

  this.traversed = function(id, done){
    client.select(that.factory.traversed(id), done);
  };

  this.hasTraversed = function(id, trail, done){
    client.select(that.factory.hasTraversed(id, trail), done);
  };

  this.buddies = function(id, done){
    client.select(that.factory.buddies(id), done);
  };

  this.isBuddy = function(id, buddy, done){
    client.ask(that.factory.isBuddy(id, buddy), done);
  };

  this.followers = function(user, done){
    client.select(that.factory.followers(user), done);
  };

  this.traverse = function(user, trail, done){
    client.modify(that.factory.traverse(user, trail), done);
  };

  this.setAvatar = function(user, avatar, done){
    client.modify(that.factory.setAvatar(user, avatar), done);
  };

  this.addBuddy = function(user, buddy, done){
    client.modify(that.factory.addBuddy(user, buddy), done);
  };

  this.follow = function(user, follower, done){
    client.modify(that.factory.follow(user, follower), done);
  };

  this.recommended = function(id, done){
    client.select(that.factory.recommended(id), done);
  };
}

module.exports.Trail = new TrailQueryMaker();

module.exports.Poi = new PointOfInterestQueryMaker();

module.exports.Note = new GeolocatedNoteQueryMaker();

module.exports.User = new UserQueryMaker();

module.exports.API = {
  search: function(string, filter, done){
    var params = {};
    params.bindings = '?id ?name ?description ?date ?email ?avatar ?creator ?type ?author ?category';
    params.extras = 'LIMIT 20';

    params.select = '';

    if(filter.trails){
      params.select += '{ \
      ?id rdf:type sorelcom:Trail . \
      ?id sorelcom:difficulty ?difficulty . \
      ?id sorelcom:name ?name . \
      ?id sorelcom:description ?description . \
      ?id foaf:maker ?author . \
      BIND("Trail" AS ?type) \
      FILTER(?difficulty >= ' + filter.minDifficulty + ' && ?difficulty <= ' + filter.maxDifficulty + ') \
      FILTER(regex(?name, "' + string + '", "i") || regex(?description, "' + string + '", "i")) \
      }';
      if(filter.pois || filter.users)
        params.select += ' UNION ';
    }
    if(filter.pois){
      params.select += ' { \
      ?id rdf:type sorelcom:PointOfInterest . \
      ?id sorelcom:name ?name . \
      ?id sorelcom:description ?description . \
      ?id foaf:maker ?author . \
      ?id sorelcom:category ?c . \
      ?c rdfs:label ?category . \
      BIND("Point of Interest" AS ?type) \
      FILTER(regex(?name, "' + string + '", "i") || regex(?description, "' + string + '", "i")) \
      }';
      if(filter.users)
        params.select += ' UNION ';
    }
    if(filter.users){
      params.select += '{ \
      ?id rdf:type foaf:Person . \
      ?id foaf:nick ?name . \
      ?id foaf:mbox ?mbox . \
      BIND("Person" AS ?type) \
      FILTER regex(?name, "' + string + '", "i")\
      }';
    }

    client.select(params, function(err, data){
      if(err) return done(err);
      done(null, data);
    });
  },
  latest: function(done){
    var params = {};
    params.bindings = '?name ?geometry ?author ?authorId ?date ?type';
    params.extras = 'LIMIT 5';
    params.select = '?id sorelcom:name ?name . \
    ?id rdf:type ?type .\
    ?id geo:hasGeometry ?geom . \
    ?id foaf:maker ?authorId . \
    ?geom geo:asWKT ?geometry . \
    ?authorId foaf:nick ?author . \
    ?id dcterms:created ?date . \
    FILTER(?type = sorelcom:Trail || ?type = sorelcom:PointOfInterest)';


    client.geojsonArray(params, function(err, data){
      if(err) return done(err);
      done(null, data);
    });
  },
  within: function(args, done){
    var params = {};

    params.bindings = '?id ?name ?description ?geometry ?category ?difficulty ?range ?public ?author ?type';
    params.select = '{ \
      ?s rdf:type sorelcom:Trail . \
      ?s sorelcom:name ?name . \
      ?s sorelcom:description ?description . \
      ?s sorelcom:difficulty ?difficulty . \
      BIND("Trail" AS ?type) \
    } UNION { \
      ?s rdf:type sorelcom:PointOfInterest . \
      ?s sorelcom:name ?name . \
      ?s sorelcom:description ?description . \
      ?s sorelcom:category ?category . \
      BIND("Point of Interest" AS ?type) \
    } UNION { \
      ?s rdf:type sorelcom:GeolocatedNote . \
      ?s sorelcom:description ?description . \
      ?s sorelcom:range ?range . \
      ?s sorelcom:public ?public . \
      FILTER(?public = true) \
      BIND("Geolocated Note" AS ?type)  \
    } \
    ?s geo:hasGeometry ?geom . \
    ?geom geo:asWKT ?geometry . \
    ?s rdfs:label ?id . \
    FILTER(geof:sfIntersects(?geometry, "' + args.geometry + '"))';

    if(args.type)
      params.select += '?id rdf:type ?class . ?class rdfs:label "' + args.type + '" . ';

    client.geojson(params, function(err, data){
      if(err) return done(err);
      done(null, data);
    });
  },
  info: function(done){
    var params = {};

    params.bindings = '(COUNT(?trail) AS ?trail) \
    (COUNT(?poi) AS ?pois) \
    (COUNT(?user) AS ?users)';

    params.select =  'OPTIONAL { ?trail rdf:type sorelcom:Trail . } \
    OPTIONAL { ?poi rdf:type sorelcom:PointOfInterest . } \
    OPTIONAL { ?user rdf:type foaf:Person . } ';

    client.select(params, function(err, data){
      if(err) return done(err);

      done(null, data.shift());
    });
  }
};
