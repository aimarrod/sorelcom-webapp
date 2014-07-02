/*jshint multistr: true */

var geo = require('./../utils/geo');
var SparqlClient = require('./../utils/sparql');
var factory = require('./../utils/query_factory');
var util = require('util');
var dateutil = require('dateutil');

var client = new SparqlClient(
  'http://localhost:8080/parliament/sparql',
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
    client.select(that.factory.prototype.list(), done);
  };

  this.addImage = function(id, author, url, done){
    client.modify(that.factory.prototype.addImage(id, author, url, 0), done);
  };

  this.getImages = function(id, done){
    client.select(that.factory.prototype.getImages(id), done);
  };

  this.addPost = function(id, author, text, done){
    client.modify(that.factory.prototype.addPost(id, author, text, 0), done);
  };

  this.getPosts = function(id, done){
    client.select(that.factory.prototype.getPosts(id), done);
  };

  this.nearby = function(id, filters, done){
    client.geojson(that.factory.prototype.nearby(id), filters, done);
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
}

module.exports.Trail = new TrailQueryMaker();

module.exports.Poi = new PointOfInterestQueryMaker();

module.exports.User = new UserQueryMaker();

module.exports.API = {
  search: function(string, done){
    var params = {};
    params.bindings = 'DISTINCT ?id ?name ?content ?date ?email ?avatar ?creator ?type ?author (COUNT(?trail) AS ?trails) (COUNT(?poi) AS ?pois) (COUNT(?note) AS ?notes) (COUNT(?post) AS ?posts)';
    params.extras = 'GROUP BY ?id ?name ?content ?date ?email ?avatar ?creator ?type ?author ?match ORDER BY ?match DESC(?date)';
    params.select =
    '{ \
      { ?id foaf:nick ?name } UNION { ?id sorelcom:name ?name }  \
      FILTER regex(?name, "' + string + '", "i") . BIND(1 AS ?match) . \
    } UNION { \
      ?id sorelcom:description ?content . \
      FILTER regex(?content, "' + string + '", "i") . BIND(2 AS ?match) .  \
    } \
    ?id rdf:type ?type . FILTER(?type = sorelcom:Trail || ?type = sorelcom:PointOfInterest || ?type = foaf:Person) \
    OPTIONAL { ?id foaf:nick ?name } \
    OPTIONAL { ?id sorelcom:name ?name } \
    OPTIONAL { ?id sorelcom:description ?content } \
    OPTIONAL { ?id dcterms:created ?date } \
    OPTIONAL { ?id foaf:mbox ?email } \
    OPTIONAL { ?id foaf:depiction ?avatar . ?id rdf:type foaf:Person . } \
    OPTIONAL { ?id sorelcom:hasAuthor ?a . ?a foaf:nick ?author } \
    OPTIONAL { \
      ?id sorelcom:authorOf ?element . \
      OPTIONAL { ?element rdf:type sorelcom:Trail . BIND(?element AS ?trail) }\
      OPTIONAL { ?element rdf:type sorelcom:PointOfInterest . BIND(?element AS ?poi) }\
      OPTIONAL { ?element rdf:type sorelcom:Note . BIND(?element AS ?note) }\
      OPTIONAL { ?element rdf:type rev:Review . BIND(?element AS ?post) }\
    }';

    client.select(params, function(err, data){
      if(err) return done(err);
      done(null, data);
    });
  },
  latest: function(done){
    var params = {};
    params.bindings = '?name ?geometry ?author ?authorId ?date ?type';
    params.extras = 'ORDER BY DESC(?date) LIMIT 5';
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

    params.bindings = '?id ?name ?description ?geometry ?category ?difficulty';
    params.select = '?geom geo:sfIntersects [ a geo:Geometry; geo:asWKT "' + args.geometry + '"^^geo:wktLiteral ] . \
    ?s geo:hasGeometry ?geom . \
    ?geom geo:asWKT ?geometry . \
    ?s sorelcom:name ?name . \
    ?s sorelcom:description ?description . \
    ?s rdf:label ?id . \
    OPTIONAL { ?s sorelcom:category ?category } . \
    OPTIONAL { ?s sorelcom:difficulty ?difficulty } . ';

    if(args.type)
      params.select += util.format('?id rdf:type %s', args.type);

    client.geojson(params, function(err, data){
      if(err) return done(err);
      done(null, data);
    });
  },
  info: function(done){
    var params = {};

    params.bindings = '(COUNT(distinct ?track) AS ?tracks) \
    (COUNT(distinct ?poi) AS ?pois) \
    (COUNT(distinct ?feature) AS ?features) \
    (COUNT(distinct ?user) AS ?users) \
    (COUNT(distinct ?contributor) AS ?contributors) \
    (COUNT(distinct ?media) AS ?medias) \
    (COUNT(distinct ?image) AS ?images) \
    (COUNT(distinct ?audio) AS ?audios) \
    (COUNT(distinct ?video) AS ?videos)';

    params.select =  '?s ?p ?o . \
    OPTIONAL { ?s rdf:type sorelcom:Track . BIND(?s AS ?track) . } \
    OPTIONAL { ?s rdf:type sorelcom:POI . BIND(?s AS ?poi) . } \
    OPTIONAL { ?s rdf:type geo:Feature . BIND(?s AS ?feature) . } \
    OPTIONAL { ?s rdf:type foaf:Person . BIND(?s AS ?user) . \
      OPTIONAL { ?s foaf:made ?c . FILTER(?c != rdf:nil) . BIND(?s AS ?contributor) . } \
    } \
    OPTIONAL { ?s sorelcom:hasType ?type . BIND(?s AS ?media) \
    OPTIONAL { ?s sorelcom:hasType "image" . BIND(?s AS ?image) } \
    OPTIONAL { ?s sorelcom:hasType "audio" . BIND(?s AS ?audio) } \
    OPTIONAL { ?s sorelcom:hasType "video" . BIND(?s AS ?video) } \
    }';

    client.select(params, function(err, data){
      if(err) return done(err);

      done(null, data.shift());
    });
  }
};


/*



module.exports.nearby = function(args, done){
	var params = {};

	params.bindings = '?id ?name ?content ?geometry';

  params.triples = util.format('BIND (my:%s AS ?f) ', args.id) +
  '?f geo:hasGeometry ?poigeom . ?poigeom geo:asWKT ?t . ' +
  util.format('BIND (geof:buffer(?t, %s, units:metre) AS ?buff) . ', args.distance) +
  '?geom geo:asWKT ?geometry . \
  ?geom geo:sfWithin [ a geo:Geometry; geo:asWKT ?buff ] . \
  ?id geo:hasGeometry ?geom . \
  ?id a sorelcom:POI . \
  ?id sioc:name ?name . \
  ?id sioc:content ?content . \
  FILTER (?id != ?f) ';

	client.geojson(params, function(err, data){
		if(err) return done(err);
		done(null, data);
	});
};




module.exports.within = function(args, done){

};

module.exports.amenities = function(done){
  var params = {};

  params.bindings = 'DISTINCT ?amenity';

  params.triples = '?s sorelcom:isType ?amenity';

  client.select(params, function(err, data){
    if(err) return done(err);
    done(null, data);
  });


};
*/
