var geo = require('./../utils/geo'); 
var util = require('util');
var request = require('request');
var dateutil = require('dateutil');
var step = require('step');

/* Webpage prefixes */

/* Prefixes for the SPARQL queries */
var prefixes = 'PREFIX my: <http://sorelcom.com/>' +
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
'PREFIX units: <http://www.opengis.net/def/uom/OGC/1.0/>\n';

var database = 'http://localhost:8080/parliament/sparql';
var graph = "http://morelab.deusto.es/sorelcom";

/** --------------- Binding transformation function ---------- */

var pagesize = 20;

/** Transforms a binding to a JSON */
function jsonifyBinding(binding){
  var json = {};
  for(var key in binding){
      var element = binding[key];
      if(element.type === "uri"){
        json[key] = element.value.split(/[#\/]+/).pop();
      } else if(element.datatype === "http://www.opengis.net/ont/sf#wktLiteral" || element.datatype === 'http://www.opengis.net/ont/geosparql#wktLiteral'){
        json[key] = geo.parse(element.value);
      } else if(element.dataype === "http://www.w3.org/2001/XMLSchema#boolean"){
        json[key] = Boolean(element.value);
      } else if(element.dataype === "http://www.w3.org/2001/XMLSchema#integer"){
        json[key] = parseInt(element.value);
      } else if(!element.dataype) {
        json[key] = element.value;
      }
  }
  return json;
}

/** Array of bindings */
function jsonifyBindings(data){
    var json = [];
    var bindings = data.results.bindings;
    for(var i = 0, len = bindings.length; i < len; i++)
        json.push(jsonifyBinding(bindings[i]));
    return json;
}

function geojsonify(json, isArray){
	var geojson;
	if(json.length  === 1){
		geojson = { type: 'Feature', geometry: json[0].geometry, properties: json[0] };
		delete geojson.properties.geometry;
		return geojson;
	} else if(json.length > 1){
		if(isArray){
			geojson = [];
			for(var i = 0, n = json.length; i < n; i++){
					var f = { type: 'Feature', geometry: json[i].geometry, properties: json[i] };
					delete f.properties.gemetry;
					geojson.push(f);
			}
		} else {
			geojson = {	type: 'FeatureCollection', features: [] };
			for(var j = 0, l = json.length; j < l; j++){
					var feature = { type: 'Feature', geometry: json[j].geometry, properties: json[j] };
					delete feature.properties.gemetry;
					geojson.features.push(feature);
			}
		}
		return geojson;
	}
	return { type: 'FeatureCollection', features: [] };
}

function select(params, done) {
	var bindings = params.bindings || '*';
	var extras = params.extras || '';

	request.post(
		{
			uri: database,
			json: true,
			form: {
				query: util.format('%s SELECT %s WHERE { %s } %s', prefixes, bindings, params.triples, extras),
				output: "json"
			}
		}, function (err, res, body) {
			if(err || res.statusCode !== 200)
				return done(err || "Database responded with status code " + res.statusCode);
      done(null, jsonifyBindings(body));
    }
   );
}

function ask (triples, done){
  request.post(
    {
      uri: database,
      json: true,
      form: {
        query: util.format('%s ASK { %s } ', prefixes, triples),
        output: "json"
      },
    },
    function (err, res, body) {
      if(err || res.statusCode !== 200)
        return done(err || "Database responded with status code " + res.statusCode);
      done(null, body.boolean);
    }
  );
}

function modify(params, done){
	var old = params.old || '';
	var triples = params.triples || '';
	var where = params.where || '';
	request(
		{
			uri: "http://localhost:8080/parliament/sparql",
			method: "POST",
			json: true,
			form: {
				update: util.format('%s MODIFY DELETE { %s } INSERT { %s } WHERE { OPTIONAL { %s } }', prefixes, old, triples, where),
				output: "json"
			},
		}, function (err, res, body) {
			if(!err && res.statusCode !== 200)
				err = "Database responded with status code " + res.statusCode;        
      done(err);
    }
  );
}

function calculateUri(){
  var uri = '<http://sorelcom.com';
  for(var i = 0, len = arguments.length; i < len; i++)
    if(arguments[i] instanceof Array)
      for(var j in arguments[i])
        uri += '/' + arguments[i][j];    
    else
      uri += '/' + arguments[i];
  return uri + '>';
}

/** Here the actual functions exported by the model start */

module.exports.create = function(args, done){
	var params = {};
	var date = new Date();

  /** If there is no URI (ID actually, it is not the complete URI, just relative to the SORELCOM prefix), cannot create */
	if(!args.id)
		return done('There is no URI');

  var uri = calculateUri(args.id);

  params.triples = util.format('%s rdf:type %s . ', uri, args.type);

  /** SIOC properties */
  if(args.name) 
    params.triples += util.format('%s sioc:name "%s" . ', uri, args.name); 
  if(args.content)
    params.triples += util.format('%s sioc:content \'\'\'%s\'\'\' . ', uri, args.content);
  if(args.avatar)
    params.triples += util.format('%s sioc:avatar "%s" . ', uri, args.avatar);
  if(args.email)
    params.triples += util.format('%s sioc:email "%s" . ', uri, args.email);
  
  /** Dublin Core metadata (dates, etc) */
  if(args.date)
    params.triples += util.format('%s dcterms:created "%s"^^xsd:dateTime . ', uri, util.format('%sT%sZ', dateutil.format(date, 'Y-m-d'), dateutil.format(date, 'h:i:s')));
  
  /** SORELCOM properties for tracks */
  if(args.difficulty)
    params.triples += util.format('%s sorelcom:hasDifficulty "%s"^^xsd:integer . ', uri, args.difficulty);
  if(args.distance)
    params.triples += util.format('%s sorelcom:hasDistance "%s"^^xsd:long . ', uri, args.distance);
  if(args.maxAltitude)
    params.triples += util.format('%s sorelcom:hasMaxAltitude "%s"^^xsd:float . ', uri, args.maxAltitude);
  if(args.minAltitude)
    params.triples += util.format('%s sorelcom:hasMinAltitude "%s"^^xsd:float . ', uri, args.minAltitude);    
  if(args.averageAscendingSlope)
    params.triples += util.format('%s sorelcom:hasAverageAscendingSlope "%s"^^xsd:float . ', uri, args.averageAscendingSlope);
  if(args.averageDescendingSlope)
    params.triples += util.format('%s sorelcom:hasAverageDescendingSlope "%s"^^xsd:float . ', uri, args.averageDescendingSlope);
  if(args.totalAscendingSlope)
    params.triples += util.format('%s sorelcom:hasTotalAscendingSlope "%s"^^xsd:float . ', uri, args.totalAscendingSlope);
  if(args.totalDescendingSlope)
    params.triples += util.format('%s sorelcom:hasTotalDescendingSlope "%s"^^xsd:float . ', uri, args.totalDescendingSlope);
  if(args.isCircular)
    params.triples += util.format('%s sorelcom:isCircular "%s"^^xsd:boolean . ', uri, args.isCircular);
  /** Media */
  if(args.source)
    params.triples += util.format('%s sorelcom:hasSource "%s". ', uri, args.source);


  /** Bidirectional properties */
	if(args.author)
	  params.triples += util.format('%s sioc:has_creator %s . ', uri, calculateUri('user', args.author)) +
      util.format('%s sioc:creator_of %s . ', calculateUri('user', args.author), uri); 
  if(args.container)
    params.triples += util.format('%s sioc:has_container %s . ', uri, calculateUri(args.container.type, args.container.id)) +
      util.format('%s sioc:container_of %s . ', calculateUri(args.container.type, args.container.id), uri); 

  /** 
   * OGC GeoSPARQL properties
   * cannot use prefixes because of the slashes to indicate nested resources.
   */
  if(args.geometry)
		params.triples += util.format('%s geo:hasGeometry %s . ', uri, calculateUri(args.id, 'ogc_hasGeometry', 'geometry')) + 
      util.format('%s geo:asWKT "%s"^^geo:wktLiteral . ', calculateUri(args.id, 'ogc_hasGeometry', 'geometry'), geo.toWKT2D(args.geometry)) + 
      util.format('%s rdf:type geo:Geometry . ', calculateUri(args.id, 'ogc_hasGeometry', 'geometry')); 

  /** Ask if it exists, before commiting to the database */
  ask(util.format('%s ?p ?o .', uri), function(err, exists){
    if(err) return done(err);
    if(exists) return done('Resource already exists');
    modify(params, done);
  });
};

//Need to define better what can be modified.
module.exports.modify = function(args, done){
	if(!args.id) 
		return done('need to specify a URI');

	var params = {
		old: '',
		triples: '',
		where: ''
	};

	if(args.name){
		params.old += util.format('my:%s sioc:name ?name', args.id);
		params.where += util.format('my:%s sioc:name ?name', args.id);
		params.triples += util.format('my:%s sioc:name "%s"', args.id, args.name);
	}
	if(args.content){
		params.old += util.format('my:%s sioc:content ?content', args.id);
		params.where += util.format('my:%s sioc:content ?content', args.id);
		params.triples += util.format('my:%s sioc:content "%s"', args.id, args.content);
	}
	if(args.avatar){
		params.old += util.format('my:%s sioc:avatar ?avatar', args.id);
		params.where += util.format('my:%s sioc:avatar ?avatar', args.id);
		params.triples += util.format('my:%s sioc:avatar "%s"', args.id, args.avatar);
	}
	if(args.geometry){
		params.old += util.format('my:%sgeom geo:asWKT ?wkt', args.id);
		params.where += util.format('my:%sgeom geo:asWKT ?wkt', args.id);
		params.triples += util.format('my:%sgeom geo:asWKT "%s"^^geo:wktLiteral', args.id, geo.toWKT2D(args.geometry));
	}
  if(args.distance){
    params.old += util.format('my:%s sioc:distance ?distance', args.id);
    params.where += util.format('my:%s sioc:distance ?distance', args.id);
    params.triples += util.format('my:%s sioc:distance "%s"', args.id, args.distance); 
  }

  ask(util.format('my:%s ?p ?o .', args.id), function(err, exists){
    if(err) return done(err);
    if(!exists) return done('Resource does not exist');
    modify(params, done);
  });
};

module.exports.showTrack = function(id, done){
	var params = {};

	params.bindings = '?id ?name ?content ?geometry ?author ?distance ?difficulty ?isCircular ?maxAltitude ?totalAscendingSlope ?totalDescendingSlope';

	params.triples = util.format('BIND(%s AS ?id) .', calculateUri('track', id)) +
  /** Minimum essential data properties and relations */
  '?id sioc:name ?name . ' +
  '?id geo:hasGeometry ?geom . ' +
  '?id sioc:has_creator ?authorId . ' +
  '?geom geo:asWKT ?geometry .' +
  '?authorId sioc:name ?author . ' +
  /** Parameters data properties thay may not exist */
  'OPTIONAL { ?id sioc:content ?content } . ' +
  'OPTIONAL { ?id sorelcom:hasDistance ?distance } . ' +
  'OPTIONAL { ?id sorelcom:hasDifficulty ?difficulty } . ' +
  'OPTIONAL { ?id sorelcom:isCircular ?isCircular } . ' +
  'OPTIONAL { ?id sorelcom:hasMaxAltitude ?maxAltitude } . ' +
  'OPTIONAL { ?id sorelcom:hasMinAltitude ?minAltitude } . ' +
  'OPTIONAL { ?id sorelcom:hasTotalAscendingSlope ?totalAscendingSlope } . ' +
  'OPTIONAL { ?id sorelcom:hasTotalDescendingSlope ?totalDescendingSlope } . ' +
  'OPTIONAL { ?id sorelcom:hasAverageAscendingSlope ?averageAscendingSlope } . ' +
  'OPTIONAL { ?id sorelcom:hasAverageDescendingSlope ?averageDescendingSlope } . ';

	select(params, function(err, data){
		if(err) return done(err);
		done(null, geojsonify(data));
	});
};

module.exports.showPOI = function(id, done){
	var params = {};

	params.bindings = '?name ?content ?geometry ?author';

	params.triples = util.format('BIND(%s AS ?id)', calculateUri('poi', id)) +
  /** Parameters */
  '?id sioc:name ?name . ' +
  '?id geo:hasGeometry ?geom . ' +
  '?id sioc:has_creator ?authorId . ' +
  '?geom geo:asWKT ?geometry .' +
  '?authorId sioc:name ?author . ' +
    /** Parameters data properties thay may not exist */
  'OPTIONAL { ?id sioc:content ?content } . ' +
  'OPTIONAL { ?id sorelcom:hasMaxAltitude ?maxAltitude } . ';

	select(params, function(err, data){
		if(err) return done(err);
		done(null, geojsonify(data));
	});
};

//To Do
module.exports.showNote = function(id, done){
	var params = {};

	params.bindings = '?name ?content ?geometry ?author';

	params.triples = util.format('BIND(my:%s AS ?id)', calculateUri('note', id)) +
  '?id sioc:name ?name . ' +
  '?id sioc:content ?content . ' +
  '?id geo:hasGeometry ?geom . ' +
  '?id sioc:has_creator ?authorId . ' +
  '?geom geo:asWKT ?geometry .' +
  '?authorId sioc:name ?author . ';

	select(params, function(err, data){
		if(err) return done(err);
		done(null, geojsonify(data));
	});
};

module.exports.showUser = function(id, done){
	var params = {};
	var listParams = {};

	
	params.triples = util.format('BIND(%s AS ?id) . ', calculateUri('user', id)) +
    '?id sioc:name ?name . ' +
    '?id sioc:email ?email . ' +
    '?id sioc:avatar ?avatar . ';

  listParams.triples = util.format('%s sioc:creator_of ?id . ', calculateUri('user', id)) +
    '?id sioc:name ?name .'  +
    '?id rdf:type ?type .' +
    'FILTER(?type = sorelcom:Track || ?type = sorelcom:POI || ?type = sorelcom:Note || ?type = sioc:Post)';

  select(params, function(err, user){
    if(err || !user || user.length === 0) return done(err || "User does not exist");
    user = user[0];
    select(listParams, function(err, list){
      if(err) user.created = [];
      else user.created = list;
      done(null, user);
    });
  });
};

module.exports.showPosts = function(id, done){
  var params = {};

  params.bindings = 'DISTINCT ?content ?author ?authorId ?avatar ?date';

  params.triples = util.format('?post sioc:has_container %s . ', calculateUri(id)) +
  '?post sioc:content ?content . ' +
  '?post sioc:has_creator ?authorId . ' +
  '?post dcterms:created ?date . ' +
  '?authorId sioc:name ?author . ' +
  '?authorId sioc:avatar ?avatar . ';

  params.extras = 'ORDER BY DESC(?date)';

  select(params, function(err, data){
    if(err) return done(err);
    done(null, data);
  });  
};

module.exports.showMedia = function(id, done){
  var params = {};

  params.bindings = 'DISTINCT ?source';

  params.triples = util.format('?media sioc:has_container %s . ', calculateUri(id)) +
  '?media sorelcom:hasSource ?source . ';

  select(params, function(err, data){
    if(err) return done(err);
    done(null, data);
  });    
};

module.exports.search = function(string, done){
  var params = {};
  
  params.bindings = 'DISTINCT ?id ?name ?content ?date ?email ?avatar ?creator ?type (COUNT(?track) AS ?tracks) (COUNT(?poi) AS ?pois) (COUNT(?note) AS ?notes) (COUNT(?post) AS ?posts)';
  params.extras = 'GROUP BY ?id ?name ?content ?date ?email ?avatar ?creator ?type ?match ORDER BY ?match DESC(?date)';

  params.triples = 
  util.format('{ ?id sioc:name ?name . FILTER regex(?name, "%s", "i") . BIND(1 AS ?match) . }', string) +
  ' UNION ' +
  util.format('{ ?id sioc:content ?content . FILTER regex(?content, "%s", "i") . BIND(2 AS ?match) . } ', string) +
  'OPTIONAL { ?id sioc:name ?name } ' +
  'OPTIONAL { ?id sioc:content ?content } ' +
  'OPTIONAL { ?id dcterms:created ?date } ' +
  'OPTIONAL { ?id sioc:email ?email } ' +
  'OPTIONAL { ?id sioc:avatar ?avatar } ' +
  'OPTIONAL { ?id sioc:has_creator ?creator_id . ?creator_id sioc:name ?creator } ' +
  'OPTIONAL { ?id rdf:type ?type . FILTER(?type != geo:Feature) } ' +
  'OPTIONAL { ' +
  '  ?id sioc:creator_of ?element . ' +
  '  OPTIONAL { ?element rdf:type sorelcom:Track . BIND(?element AS ?track) }' +
  '  OPTIONAL { ?element rdf:type sorelcom:POI . BIND(?element AS ?poi) }' +
  '  OPTIONAL { ?element rdf:type sorelcom:Note . BIND(?element AS ?note) }' +
  '  OPTIONAL { ?element rdf:type sioc:Post . BIND(?element AS ?post) }' +
  '}';

  select(params, function(err, data){
    if(err) return done(err);
    done(null, data);
  });
};

module.exports.count = function(args, done){
  var params = {};
  params.bindings = '(COUNT(?item) AS ?items)';
  params.triples = util.format('?item rdf:type %s . ', args.type);
  if(args.model)
    params.triples += util.format('?item sioc:has_container %s . ', calculateUri(args.container.type, args.container.id));
  if(args.author)
    params.triples += util.format('?item sioc:has_creator %s . ', calculateUri('user', args.author));
  
  select(params, function(err, data){
    if(err || !data[0] || !data[0].items) return done(err || 'Could not retreve count');
    done(null, data[0].items);
  });
};

module.exports.latest = function(done){
  var params = {};

  params.bindings = '?name ?geometry ?author ?authorId ?date ?type';

  params.triples = '?id sioc:name ?name . ' +
  '?id rdf:type ?type .' +
  '?id geo:hasGeometry ?geom . ' +
  '?id sioc:has_creator ?authorId . ' +
  '?geom geo:asWKT ?geometry . ' +
  '?authorId sioc:name ?author . ' +
  '?id dcterms:created ?date . ' +
  'FILTER(?type = sorelcom:Track || ?type = sorelcom:POI || ?type = sorelcom:Note || ?type = sioc:Post)';

  params.extras = 'ORDER BY DESC(?date) LIMIT 5';

  select(params, function(err, data){
    if(err) return done(err);
    done(null, geojsonify(data, true));
  });
};

module.exports.pages = function(type, done){
	var params = {};

	params.bindings = '(COUNT(?element) AS ?count)';
	params.triples = util.format('?element rdf:type %s . ', type);

	select(params, function(err, data){	
		if(err) return done(err);
		done(null, { pages: Math.ceil(data[0].count/pagesize) });
	});
};

module.exports.nearby = function(args, done){
	var params = {};

	params.bindings = '?id ?name ?content ?geometry';
	
  params.triples = '?id sioc:name ?name . ' +
  '?id sioc:content ?content . ' +
  '?geom geo:asWKT ?geometry . '  +
  util.format('BIND (my:%s AS ?f) ', args.id) +
  '?f geo:hasGeometry ?poigeom . ' +
  '?poigeom geo:asWKT ?t .' +
  util.format('BIND (geof:buffer(?t, %s, units:metre) AS ?buff) . ', args.distance) +
  '?geom geo:sfWithin [ a geo:Geometry; geo:asWKT ?buff ] . ' +
  '?id geo:hasGeometry ?geom . ' +
  '?id a sorelcom:POI . ' +
  'FILTER (?id != ?f) ';

	select(params, function(err, data){
		if(err) return done(err);
		done(null, geojsonify(data));
	});
};

module.exports.around = function(args, done){
  var params = {};

  params.bindings = '?id ?name ?content ?geometry';
  
  params.triples = '?id sioc:name ?name . ' +
  '?id sioc:content ?content . ' +
  '?geom geo:asWKT ?geometry . '  +
  util.format('BIND (geof:buffer("%s"^^wktLiteral, %s, units:metre) AS ?buff) . ', args.distance) +
  '?geom geo:sfWithin [ a geo:Geometry; geo:asWKT ?buff ] . ' +
  '?id geo:hasGeometry ?geom . ' +
  '?id a sorelcom:POI . ';

  select(params, function(err, data){
    if(err) return done(err);
    done(null, geojsonify(data));
  });
};

module.exports.buffer = function(args, done){
	var params = {};
	params.bindings = '?geometry';
	params.triples = util.format('my:%s geo:hasGeometry ?g . ', args.id) +
  '?g geo:asWKT ?wkt . '  +
  util.format('BIND (geof:buffer(?wkt, %s, units:metre) AS ?geometry) . ', args.distance);

	select(params, function(err, data){
		if(err) return done(err);
		done(null, geojsonify(data));
	});
};

//TODO
module.exports.metaInfo = function(done){
  var params = {};
  
  params.bindings = '(COUNT(distinct ?track) AS ?tracks) ' + 
  '(COUNT(distinct ?poi) AS ?pois) ' + 
  '(COUNT(distinct ?feature) AS ?features) ' +
  '(COUNT(distinct ?user) AS ?users) ' + 
  '(COUNT(distinct ?contributor) AS ?contributors) ' + 
  '(COUNT(distinct ?media) AS ?medias) ' +
  '(COUNT(distinct ?image) AS ?images) ' +
  '(COUNT(distinct ?audio) AS ?audios) ' +
  '(COUNT(distinct ?video) AS ?videos)';

  params.triples =  '?s ?p ?o . ' +
  'OPTIONAL { ?s rdf:type sorelcom:Track . BIND(?s AS ?track) . } ' +
  'OPTIONAL { ?s rdf:type sorelcom:POI . BIND(?s AS ?poi) . } ' +
  'OPTIONAL { ?s rdf:type geo:Feature . BIND(?s AS ?feature) . } ' +
  'OPTIONAL { ?s rdf:type sioc:UserAccount . BIND(?s AS ?user) . ' +
  '  OPTIONAL { ?s sioc:creator_of ?c . FILTER(?c != rdf:nil) . BIND(?s AS ?contributor) . } ' +
  '} ' +
  'OPTIONAL { ?s sorelcom:hasType ?type . BIND(?s AS ?media) ' + 
  'OPTIONAL { ?s sorelcom:hasType "image" . BIND(?s AS ?image) } ' +
  'OPTIONAL { ?s sorelcom:hasType "audio" . BIND(?s AS ?audio) } ' +
  'OPTIONAL { ?s sorelcom:hasType "video" . BIND(?s AS ?video) } ' +
  '}'; 

  select(params, function(err, data){
    if(err) return done(err);
    done(null, data.shift());
  });
};

// Need to rethink these
module.exports.list = function(type, done){
  var params = {};

  params.bindings = '?id ?name ?content ?date ?image';
  
  params.triples = util.format('?id rdf:type sorelcom:%s . ', type) + 
  '?id sioc:name ?name .' + 
  'OPTIONAL { ?id sioc:content ?content . }' + 
  'OPTIONAL { ?id dcterms:created ?date . }';

  select(params, done);
};

module.exports.userList = function(done){
  var params = {};
  params.bindings = '?id ?name ?avatar (COUNT(?track) AS ?tracks) (COUNT(distinct ?poi) AS ?pois) (COUNT(distinct ?note) AS ?notes) (COUNT(distinct ?post) AS ?posts)';
  
  params.triples = '?id rdf:type sioc:UserAccount . \n'  +
  '?id sioc:name ?name . \n'  +
  '?id sioc:avatar ?avatar . \n'  +
  '?id sioc:creator_of ?element .'    +
  'OPTIONAL { ?element rdf:type sorelcom:Track . BIND(?element AS ?track) } \n'  +
  'OPTIONAL { ?element rdf:type sorelcom:POI . BIND(?element AS ?poi) } \n'  +
  'OPTIONAL { ?element rdf:type sorelcom:Note . BIND(?element AS ?note) } \n'  +
  'OPTIONAL { ?element rdf:type sioc:Post . BIND(?element AS ?post) }';
  
  params.extras = 'group by ?id ?name ?avatar ?list';
  
  select(params, done);
};