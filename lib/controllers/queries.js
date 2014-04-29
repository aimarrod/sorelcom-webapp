var geo = require('./../utils/geo'); 
var util = require('util');
var request = require('request');
var dateutil = require('dateutil');
var terraformer = require('terraformer');
var wkt = require('terraformer-wkt-parser');

/* Webpage prefixes */

/* Prefixes for the SPARQL queries */
var prefixes = 'PREFIX fn: <http://www.w3.org/2005/xpath-functions#>\n'
+ 'PREFIX owl: <http://www.w3.org/2002/07/owl#>\n'
+ 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n' 
+ 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n'
+ 'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n'
+ 'PREFIX dcterms: <http://purl.org/dc/terms/>'
+ 'PREFIX sorelcom: <http://www.morelab.deusto.es/ontologies/sorelcom#>\n' 
+ 'PREFIX ogc: <http://www.opengis.net/ont/geosparql#>\n'
+ 'PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n'
+ 'PREFIX sioc: <http://rdfs.org/sioc/ns#>\n'
+ 'PREFIX ogcf: <http://www.opengis.net/def/function/geosparql/>\n'
+ 'PREFIX sf: <http://www.opengis.net/ont/sf#>\n'
+ 'PREFIX units: <http://www.opengis.net/def/uom/OGC/1.0/>\n';

var database = 'http://localhost:8080/parliament/sparql';
var graph = "http://morelab.deusto.es/sorelcom";

/** --------------- Binding transformation function ---------- */

var pagesize = 20;

/** Transforms a binding to a JSON */
function jsonifyBinding(binding){
  var json = {};
  for(var key in binding){
      var element = binding[key];
      console.log(key);
      if(element.type === "uri"){
        json[key] = element.value.split('#').pop();
      } else if(element.datatype === "http://www.opengis.net/ont/sf#wktLiteral" || element.datatype === 'http://www.opengis.net/ont/geosparql#wktLiteral'){
        json[key] = wkt.parse(element.value);
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

function geojsonify(json){
	var geojson;
	if(json.length  === 1){
		geojson = {
			type: 'Feature',
			geometry: json[0].geometry,
			properties: json[0]
		};
		delete geojson.properties.geometry;
		return geojson;
	} else if(json.length > 1){
		geojson.type = {
			type: 'FeatureCollection',
			features: []
		};
		for(var i = 0, len = json.length; i < len; i++){
			var feature = {
				type: 'Feature',
				geometry: json[i].geometry,
				properties: json[i]
			};
			delete feature.properties.gemetry;
			geojson.push(feature);
		}
		return geojson;
	}
	return null;
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
      done(err, body);
    }
  );
}


// MODULE

module.exports.search = function(querystring, done){
	var params = {};
	
	params.bindings = '?id ?name';
	
	params.query = '?id sioc:name ?name . '
	+ util.format('FILTER regex(?name, "%s")', querystring)
	+ '} UNION {'
	+ '?id sioc:content ?content'
	+ util.format('FILTER regex(?content, "%s")', querystring)
	+ '}';

	select(params, done);
}

module.exports.create = function(properties, done){
	var params = {}
	var date = new Date();

	if(!properties.id)
		return done('There is no ID');

	params.triples = util.format('sorelcom:%s rdf:type %s . ', properties.id, properties.type);
  if(properties.name) 
		params.triples += util.format('sorelcom:%s sioc:name "%s" . ', properties.id, properties.name); 
	if(properties.content)
		params.triples += util.format('sorelcom:%s sioc:content "%s" . ', properties.id, properties.content);
  if(properties.avatar)
  	params.triples += util.format('sorelcom:%s sioc:avatar "%s" .', properties.id, properties.avatar);
  if(properties.email)
  	params.triples += util.format('sorelcom:%s sioc:email "%s" .', properties.id, properties.email);
  if(properties.date)
  	params.triples += util.format('sorelcom:%s dcterms:created "%s"^^xsd:dateTime .', properties.id, util.format('%sT%sZ', dateutil.format(date, 'Y-m-d'), dateutil.format(date, 'h:i:s')));
  if(properties.type === 'sioc:UserAccount')
  	params.triples += util.format('sorelcom:%s sioc:creator_of () .', properties.id);


	if(properties.author){
		params.old = util.format('sorelcom:%s sioc:creator_of ?list . ', properties.author);
	  params.where = util.format('sorelcom:%s sioc:creator_of ?list . ', properties.author);
	  params.triples += util.format('sorelcom:%s sioc:has_creator sorelcom:%s . ', properties.id, properties.author) 
  	+ util.format('sorelcom:%s sioc:creator_of [rdf:first sorelcom:%s;rdf:rest ?list] . ', properties.author, properties.id); 
  }

  if(properties.geometry){
		params.triples += util.format('sorelcom:%s ogc:hasGeometry sorelcom:%sgeom . ', properties.id, properties.id) 
		+ util.format('sorelcom:%sgeom ogc:asWKT "%s"^^ogc:wktLiteral . ', properties.id, geo.toWKT2D(properties.geometry)) 
		+ util.format('sorelcom:%sgeom rdf:type ogc:Geometry . ', properties.id) 
	}

  modify(params, done);
}

module.exports.modify = function(properties, done){
	if(!properties.id) 
		return done('need to specify a ID');

	var params = {
		old: '',
		triples: '',
		where: ''
	};

	if(properties.name){
		params.old += util.format('sorelcom:%s sioc:name ?name', properties.id);
		params.where += util.format('sorelcom:%s sioc:name ?name', properties.id);
		params.triples += util.format('sorelcom:%s sioc:name "%s"', properties.id, properties.name);
	}
	if(properties.content){
		params.old += util.format('sorelcom:%s sioc:content ?content', properties.id);
		params.where += util.format('sorelcom:%s sioc:content ?content', properties.id);
		params.triples += util.format('sorelcom:%s sioc:content "%s"', properties.id, properties.content);
	}
	if(properties.avatar){
		params.old += util.format('sorelcom:%s sioc:avatar ?avatar', properties.id);
		params.where += util.format('sorelcom:%s sioc:avatar ?avatar', properties.id);
		params.triples += util.format('sorelcom:%s sioc:avatar "%s"', properties.id, properties.avatar);
	}
	if(properties.geometry){
		params.old += util.format('sorelcom:%sgeom ogc:asWKT ?wkt', properties.id);
		params.where += util.format('sorelcom:%sgeom ogc:asWKT ?wkt', properties.id);
		params.triples += util.format('sorelcom:%sgeom ogc:asWKT "%s"^^ogc:wktLiteral', properties.id, geo.toWKT2D(properties.geometry));
	}

  modify(params, done);
}

module.exports.list = function(type, done){
	var params = {}

	params.bindings = '?id ?name ?content ?date';

	params.triples = util.format('?id rdf:type sorelcom:%s . ', type)
	+ '?id sioc:name ?name .'
	+ 'OPTIONAL { ?id sioc:content ?content . }'
	+ 'OPTIONAL { ?id dcterms:created ?date . }';

	select(params, done);
}

module.exports.userList = function(done){
	var params = {}
	params.bindings = '?id ?name ?avatar (COUNT(?track) AS ?tracks) (COUNT(distinct ?poi) AS ?pois) (COUNT(distinct ?note) AS ?notes) (COUNT(distinct ?post) AS ?posts)';
  
  params.triples = '?id rdf:type sioc:UserAccount . \n' 
  + '?id sioc:name ?name . \n' 
  + '?id sioc:avatar ?avatar . \n' 
  + '?id sioc:creator_of ?list .'   
  + 'OPTIONAL { ?list rdf:rest*/rdf:first ?track . ?track rdf:type sorelcom:Track . } \n' 
  + 'OPTIONAL { ?list rdf:rest*/rdf:first ?poi . ?poi rdf:type sorelcom:POI . } \n' 
  + 'OPTIONAL { ?list rdf:rest*/rdf:first ?note . ?note rdf:type sorelcom:Note . } \n' 
  + 'OPTIONAL { ?list rdf:rest*/rdf:first ?post . ?post rdf:type sioc:Post . }';
  
  params.extras = 'group by ?id ?name ?avatar ?list';
  
  select(params, done);
}

module.exports.showTrack = function(id, done){
	var params = {};

	params.bindings = '?name ?content ?geometry ?author';

	params.triples = util.format('BIND(sorelcom:%s AS ?id)', id)
	+	'?id sioc:name ?name . '
	+	'?id sioc:content ?content . '
	+	'?id ogc:hasGeometry ?geom . '
	+	'?id sioc:has_creator ?authorId . '
	+	'?geom ogc:asWKT ?geometry .'
	+	'?authorId sioc:name ?author . ';

	select(params, function(err, data){
		if(err) return done(err);
		done(null, geojsonify(data));
	});
}

module.exports.showPOI = function(id, done){
	var params = {};

	params.bindings = '?name ?content ?geometry ?author';

	params.triples = util.format('BIND(sorelcom:%s AS ?id)', id)
	+	'?id sioc:name ?name . '
	+	'?id sioc:content ?content . '
	+	'?id ogc:hasGeometry ?geom . '
	+	'?id sioc:has_creator ?authorId . '
	+	'?geom ogc:asWKT ?geometry .'
	+	'?authorId sioc:name ?author . ';

	select(params, function(err, data){
		if(err) return done(err);
		done(null, geojsonify(data));
	});
}

module.exports.showNote = function(id, done){
	var params = {};

	params.bindings = '?name ?content ?geometry ?author';

	params.triples = util.format('BIND(sorelcom:%s AS ?id)', id)
	+	'?id sioc:name ?name . '
	+	'?id sioc:content ?content . '
	+	'?id ogc:hasGeometry ?geom . '
	+	'?id sioc:has_creator ?authorId . '
	+	'?geom ogc:asWKT ?geometry .'
	+	'?authorId sioc:name ?author . ';

	select(params, function(err, data){
		if(err) return done(err);
		done(null, geojsonify(data));
	});
}

module.exports.showUser = function(id, done){
	var params = {};
	var listParams = {};

	
	params.triples = util.format('BIND(sorelcom:%s AS ?id)', id)
	+ '?id sioc:name ?name . '
  + '?id sioc:email ?email . '
  + '?id sioc:avatar ?avatar . ';

  listParams.triples = util.format('sorelcom:%s sioc:creator_of ?list . ', id)
  + '?list rdf:rest*/rdf:first ?id . '
  + '?id sioc:name ?name .' 
  + '?id rdf:type ?type .'
	+ 'FILTER(?type = sorelcom:Track || ?type = sorelcom:POI || ?type = sorelcom:Note || ?type = sioc:Post)'

  select(params, function(err, user){
    if(err) return done(err);
    user = user[0];
    select(listParams, function(err, list){
      if(err) user.created = [];
      else user.created = list;
      done(null, user);
    });
  });
};

module.exports.pages = function(type, done){
	var params = {};

	params.bindings = '(COUNT(?element) AS ?count)';
	params.triples = util.format('?element rdf:type %s . ', type);

	select(params, function(err, data){	
		if(err) return done(err)
		done(null, { pages: Math.ceil(data[0].count/pagesize) });
	});
}
