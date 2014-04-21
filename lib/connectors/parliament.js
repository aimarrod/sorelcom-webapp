var util = require('util');
var request = require('request');
var terraformer = require('terraformer');
var wkt = require('terraformer-wkt-parser');

/** Attribute to predicate association */

function bindingToJson(binding){
    var element = {};
    for(var key in binding){
        var el = binding[key];
        if(el.datatype === "http://www.opengis.net/ont/sf#wktLiteral")
            continue;
        
        if(el.type === "literal" || el.type === "typed-literal"){
            if(el.dataype && el.dataype === "http://www.w3.org/2001/XMLSchema#boolean")
                element[key] = Boolean(el.value);
            else if(el.dataype && el.dataype === "http://www.w3.org/2001/XMLSchema#integer")
                element[key] = parseInt(el.value);
            else if(!el.dataype)
                element[key] = el.value;

        } else if(el.type === "uri"){
            element[key] = el.value.split('#').pop();
        }
    }
    return element;
}

function bindingsToJson(data){
    var json = [];
    var bindings = data.results.bindings;
    for(var i = 0, len = bindings.length; i < len; i++)
        json.push(bindingToJson(bindings[i]));
    return json;
}

function bindingsToGeojson(data){
    var bindings = data.results.bindings;

    if(bindings.length > 1){
        return bindingsToFeatureCollection(bindings);
    } else {
        return bindingToFeature(bindings[0])
    }
}

function bindingsToFeatureCollection(bindings){
    var fCollection = {
            type: "FeatureCollection",
            features: []
        }

    for(var i = 0, len = bindings.length; i < len; i++){
        var binding = bindings[i];
        
        if(binding.wkt){
            var feature = { 
                type: "Feature",
                geometry: wkt.parse(binding.wkt.value),
                properties: {} 
            };                
            feature.properties = bindingToJson(binding);
            fCollection.features.push(feature);
        }
    }
    return fCollection;    
}

function bindingToFeature(binding){
    if(binding.wkt){
        var geojson = { 
            type: "Feature",
            geometry: wkt.parse(binding.wkt.value),
            properties: bindingToJson(binding)
        };                
        return geojson;
    }
    return null;
}

module.exports = {
    
    /** Attributes used internally */
    prefixes: [
        'PREFIX fn: <http://www.w3.org/2005/xpath-functions#>',
        'PREFIX owl: <http://www.w3.org/2002/07/owl#>',
        'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>', 
        'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>', 
        'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>', 
        'PREFIX sorelcom: <http://www.morelab.deusto.es/ontologies/sorelcom#>', 
        'PREFIX ogc: <http://www.opengis.net/ont/geosparql#>',
        'PREFIX foaf: <http://xmlns.com/foaf/0.1/>',
        'PREFIX sioc: <http://rdfs.org/sioc/ns#>',
        'PREFIX ogcf: <http://www.opengis.net/def/function/geosparql/>',
        'PREFIX sf: <http://www.opengis.net/ont/sf#>',
        'PREFIX units: <http://www.opengis.net/def/uom/OGC/1.0/>'
    ].join('\n'),
    sparqlURI: "http://localhost:8080/parliament/sparql",
    bulkURI: "http://localhost:8080/parliament/bulk",
    graph: "http://morelab.deusto.es/sorelcom",

    /** Select operation on the Triplestore.*/
    select: function (binds, triples, extraOps, callback) {
        var bindings = binds || '*';
        var extras = extraOps || '';

        request.post({
                uri: "http://localhost:8080/parliament/sparql",
                json: true,
                form: {
                    query: util.format('%s SELECT %s WHERE { %s } %s', this.prefixes, bindings, triples, extras),
                    output: "json"
                }
            },
            function (err, res, body) {
                if(err || res.statusCode !== 200)
                    return callback(err || "Database responded with status code " + res.statusCode);
                
                callback(null, bindingsToJson(body));
            }
        );
    },

    listSelect: function (id, list, triples, callback) {
        request.post({
                uri: "http://localhost:8080/parliament/sparql",
                json: true,
                form: {
                    query: util.format('%s SELECT * WHERE { %s  %s  ?list . ?list  rdf:rest*/rdf:first  ?node . %s }', this.prefixes, id, list, triples),
                    output: "json"
                }
            },
            function (err, res, body) {
                if(err || res.statusCode !== 200)
                    return callback(err || "Database responded with status code " + res.statusCode);
                
                callback(null, bindingsToJson(body));
            }
        );
    }, 

    geoSelect: function (binds, triples, extraOps, callback) {
        var bindings = binds || '*';
        var extras = extraOps || '';

        request.post({
                uri: "http://localhost:8080/parliament/sparql",
                json: true,
                form: {
                    query: util.format('%s SELECT %s WHERE { %s } %s', this.prefixes, bindings, triples, extras),
                    output: "json"
                }
            },
            function (err, res, body) {
                if(err || res.statusCode !== 200)
                    return callback(err || "Database responded with status code " + res.statusCode);
                
                callback(null, bindingsToGeojson(body));
            }
        );
    },


    ask: function (triples, callback){
        request({
                uri: "http://localhost:8080/parliament/sparql",
                method: "POST",
                json: true,
                form: {
                    query: util.format('%s ASK { %s } ', this.prefixes, triples),
                    output: "json"
                },
            },
            function (err, res, body) {
                if(!err && res.statusCode !== 200)
                    err = "Database responded with status code " + res.statusCode;
                
                callback(err, body.boolean);
            }
        );
    }, 

    /** Insert operation on the triplestore */
    insert: function (triples, callback){
        request({
                uri: "http://localhost:8080/parliament/sparql",
                method: "POST",
                json: true,
                form: {
                    update: util.format('%s INSERT { %s } WHERE {} ', this.prefixes, triples),
                    display: "json",
                    output: "json"
                },
            },
            function (err, res, body) {
                if(!err && res.statusCode !== 200)
                    err = "Database responded with status code " + res.statusCode;
                
                callback(err, body);
            }
        );
    },

    addToList: function (id ,list, element, done){
        request({
                uri: "http://localhost:8080/parliament/sparql",
                method: "POST",
                json: true,
                form: {
                    update: [util.format('%s MODIFY',          this.prefixes),
                             util.format('DELETE { %s %s ?list }',  id, list),
                             util.format('INSERT { %s %s [rdf:first %s;rdf:rest ?list] }', id, list, element),
                             util.format('WHERE {  %s %s ?list . }', id, list)
                             ].join('\n'),
                    output: "json"
                },
            },
            function (err, res, body) {
                if(!err && res.statusCode !== 200)
                    err = "Database responded with status code " + res.statusCode;
                
                done(err, body);
            }
        );
    },   

    modify: function (oldTriples ,newTriples, whereClause, done){
        request({
                uri: "http://localhost:8080/parliament/sparql",
                method: "POST",
                json: true,
                form: {
                    update: util.format('%s MODIFY DELETE { %s } INSERT { %s } WHERE { %s }', this.prefixes, oldTriples, newTriples, whereClause),
                    output: "json"
                },
            },
            function (err, res, body) {
                if(!err && res.statusCode !== 200)
                    err = "Database responded with status code " + res.statusCode;
                
                done(err, body);
            }
        );
    },   

    query: function (query, callback) {
        request({
                uri: "http://localhost:8080/parliament/sparql",
                method: "POST",
                json: true,
                form: {
                    query: this.prefixes + query,
                    output: "json"
                },
            },
            function (err, res, body) {
                if(!err && res.statusCode !== 200)
                    err = "Database responded with status code " + res.statusCode;
                callback(err, bindingsToJson(body));
            }
        );
    },
};

/**
 GET LISt

 
PREFIX afn: <http://jena.hpl.hp.com/ARQ/function#>
PREFIX fn: <http://www.w3.org/2005/xpath-functions#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX par: <http://parliament.semwebcentral.org/parliament#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX time: <http://www.w3.org/2006/time#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX sorelcom: <http://www.morelab.deusto.es/ontologies/sorelcom#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX  list: <http://jena.hpl.hp.com/ARQ/list#>

SELECT DISTINCT
?member
WHERE {
GRAPH <http://morelab.deusto.es/sorelcom>{
  sorelcom:user53398fe5945c5af628631104  sorelcom:hasTracks  ?list .
  ?list  rdf:rest*/ //rdf:first  ?member }
//}

/**
PREFIX sorelcom: <http://www.morelab.deusto.es/ontologies/sorelcom#>
PREFIX units: <http://www.opengis.net/def/uom/OGC/1.0/> 
PREFIX my: <http://example.org/ApplicationSchema#> 
PREFIX geo: <http://www.opengis.net/ont/geosparql#> 
PREFIX geof: <http://www.opengis.net/def/function/geosparql/>

SELECT ?recgeom ?poigeom
WHERE { 
?poi a sorelcom:POI . 
?poi geo:hasGeometry ?poigeom .
?rec a sorelcom:POI . 
?rec geo:hasGeometry ?recgeom . 
?poigeom geo:sfWithin ?recgeom. 
FILTER (?poi != ?rec)
}


PREFIX sorelcom: <http://www.morelab.deusto.es/ontologies/sorelcom#>
PREFIX units: <http://www.opengis.net/def/uom/OGC/1.0/> 
PREFIX my: <http://example.org/ApplicationSchema#> 
PREFIX geo: <http://www.opengis.net/ont/geosparql#> 
PREFIX geof: <http://www.opengis.net/def/function/geosparql/>

SELECT ?near
WHERE { 
sorelcom:POIcentro geo:hasGeometry ?poigeom .
?poigeom geo:asWKT ?wkt .
BIND (geof:buffer(?wkt, 500, units:metre) AS ?buff) .
?neargeom geo:sfWithin [ a geo:Geometry; geo:asWKT ?buff ] .
?near geo:hasGeometry ?neargeom .
}
*/