var db = require('./../connectors/parliament'),
    util = require('util'),
    geo = require('./../utils/geo');

var distance = 1000;

module.exports = {
	nearby: function(req, res, next){
		var binds = '?id ?name ?content ?wkt\n';
		var triples = 
		/** Parameters to retrieve */
		'?id sioc:name ?name . \n' +
		'?id sioc:content ?content . \n' +
		'?geom ogc:asWKT ?wkt . \n' + 

		util.format('BIND (sorelcom:%s AS ?f) \n', req.params.id) +
		'?f ogc:hasGeometry ?poigeom . \n' +
		'?poigeom ogc:asWKT ?t .\n' +
		util.format('BIND (ogcf:buffer(?t, %s, units:metre) AS ?buff) . \n', distance) +
		'?geom ogc:sfWithin [ a ogc:Geometry; ogc:asWKT ?buff ] . \n' +
		'?id ogc:hasGeometry ?geom . \n' +
		'?id a sorelcom:POI . \n' +
		'FILTER (?id != ?f) \n';

		db.geoSelect(binds, triples, null, function(err, data){
			if(err) return res.send(304);

			res.json(data);
		});
	},
	around: function(req, res, next){
		if(!req.body.location) return res.send(304);

		var point = geo.toWKT2D(req.body.location);
		var binds = '?id ?name ?content ?wkt\n';
		var triples = 
		/** Parameters to retrieve */
		'?id sioc:name ?name . \n' +
		'?id sioc:content ?content . \n' +
		'?geom ogc:asWKT ?wkt . \n' + 

		util.format('BIND (ogcf:buffer("%s"^^ogc:wktLiteral, %s, units:metre) AS ?buff) . \n', point, distance) +
		'?geom ogc:sfWithin [ a ogc:Geometry; ogc:asWKT ?buff ] . \n' +
		'?id ogc:hasGeometry ?geom . \n';

		db.geoSelect(binds, triples, null, function(err, data){
			if(err) return res.send(304);

			res.json(data);
		});
	}
}
