/*jshint multistr: true */

var geo = require('./../utils/geo');
var SparqlClient = require('./../utils/sparql');
var QueryFactory = require('./../utils/query_factory');
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
  'PREFIX sioc: <http://rdfs.org/sioc/ns#>\n' +
  'PREFIX sf: <http://www.opengis.net/ont/sf#>\n' +
  'PREFIX units: <http://www.opengis.net/def/uom/OGC/1.0/>\n'
);

var factory = new QueryFactory();


module.exports.Trail = {
  new: function(id, args, done){
    if(!id)
    return done('There is no URI');

    client.ask('?s rdf:label "'+ id + '" . ', function(err, exists){
      if(err) return done(err);
      if(exists) return done('Trail already exists');
      client.modify(factory.Trail.new(id, args), done);
    });
  },
  get: function(id, done){
    client.geojson(factory.Trail.get(id), done);
  },
  getList: function(done){
    client.select(factory.list('sorelcom:Trail'), done);
  },
  addImage: function(id, author, url, done){
    client.count(factory.Trail.countImages(id), function(err, number){
      if(err) return done(err);
      client.modify(factory.Trail.addImage(id, author, url, number), done);
    });
  },
  getImages: function(id, done){
    client.select(factory.Trail.getImages(id), done);
  },
  addPost: function(id, author, text, done){
    client.count(factory.Trail.countPosts(id), function(err, number){
      if(err) return done(err);
      client.modify(factory.Trail.addPost(id, author, text, number), done);
    });
  },
  getPosts: function(id, done){
    client.select(factory.Trail.getPosts(id), done);
  }
};

module.exports.Poi = {
  new: function(id, args, done){
    if(!id)
    return done('There is no URI');

    client.ask('?s rdf:label "'+ id + '" .', function(err, exists){
      if(err) return done(err);
      if(exists) return done('Point of Interest already exists');
      client.modify(factory.Poi.new(id, args), done);
    });
  },
  get: function(id, done){
    client.geojson(factory.Poi.get(id), done);
  },
  getList: function(done){
    client.select(factory.getList('sorelcom:PointOfInterest'), done);
  },
  addImage: function(id, author, url, done){
    client.count(factory.Poi.countImages(id), function(err, number){
      if(err) return done(err);
      client.modify(factory.Poi.addImage(id, author, url, number), done);
    });
  },
  getImages: function(id, done){
    client.select(factory.Poi.getImages(id), done);
  },
  addPost: function(id, author, text, done){
    client.count(factory.Poi.countPosts(id), function(err, number){
      if(err) return done(err);
      client.modify(factory.Poi.addPost(id, author, text, number), done);
    });
  },
  getPosts: function(id, done){
    client.select(factory.Poi.getPosts(id), done);
  }
};

module.exports.User = {
  new: function(args, done){
    client.ask('?s rdf:label "'+ args.name + '" .', function(err, exists){
      if(err) return done(err);
      if(exists) return done('Point of Interest already exists');
      client.modify(factory.User.new(args), done);
    });
  },
  get: function(id, done){
    client.select(factory.User.get(id), done);
  },
  update: function(id, args, done){
    client.modify(factory.User.update(id, args), done);
  },
  list: function(done){
    client.select(factory.getList('foaf:Person'), done);
  },
  trails: function(id, done){
    client.select(factory.User.trails(id), done);
  },
  pois: function(id, done){
    client.select(factory.User.pois(id), done);
  },
  traversed: function(id, done){
    client.select(factory.User.traversed(id), done);
  },
  hasTraversed: function(id, trail, done){
    client.select(factory.User.hasTraversed(id, trail), done);
  },
  buddies: function(id, done){
    client.select(factory.User.buddies(id), done);
  },
  isBuddy: function(id, buddy, done){
    client.ask(factory.User.isBuddy(id, buddy), done);
  },
  followers: function(user, done){
    client.select(factory.User.followers(user), done);
  },
  traverse: function(user, trail, done){
    client.modify(factory.User.traverse(user, trail), done);
  },
  setAvatar: function(user, avatar, done){
    client.modify(factory.User.setAvatar(user, avatar), done);
  },
  addBuddy: function(user, buddy, done){
    client.modify(factory.User.addBuddy(user, buddy), done);
  },
  follow: function(user, follower, done){
    client.modify(factory.User.follow(user, follower), done);
  }
};

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
      OPTIONAL { ?element rdf:type sioc:Post . BIND(?element AS ?post) }\
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
    ?id sorelcom:hasAuthor ?authorId . \
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
      OPTIONAL { ?s sioc:creator_of ?c . FILTER(?c != rdf:nil) . BIND(?s AS ?contributor) . } \
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
