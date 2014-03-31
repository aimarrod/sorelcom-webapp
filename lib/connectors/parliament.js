var util = require('util');
var request = require('request');
var terraformer = require('terraformer');
var wkt = require('terraformer-wkt-parser');

/** Attribute to predicate association */

function bindingToJson(vars, binding){
    var element = {};
    for(var i = 0, len = vars.length; i < len; i++){
        var variable = vars[i];
        var el = binding[variable];
        if(el.type == "literal" || el.type == "typed-literal"){
            if(el.dataype && el.dataype=="http://www.w3.org/2001/XMLSchema#boolean")
                element[variable] = Boolean(el.value);
            else if(el.dataype && el.dataype=="http://www.w3.org/2001/XMLSchema#integer")
                element[variable] = parseInt(el.value);
            else if(!el.dataype)
                element[variable] = el.value;
        } else if(el.type == "uri"){
            element[variable] = el.value.split('#').pop();
        }
    }
    return element;
}

function bindingsToJson(data){
    var json = [];
    var vars = data.head.vars;
    var bindings = data.results.bindings;
    for(var i = 0, len = bindings.length; i < len; i++)
        json.push(bindingToJson(vars, bindings[i]));
    return json;
}

function bindingsToGeojson(data){
    var vars = data.head.vars;
    var binding = data.results.bindings[0];
    if(binding.wkt){
        var geojson = { 
            type: "Feature",
            geometry: wkt.parse(binding.wkt.value),
            properties: {} 
        };                
        geojson.properties = bindingToJson(vars, binding);
        return geojson;
    }
    return null;
}

module.exports = {
    
    /** Attributes used internally */
    prefixes: [
        'PREFIX afn: <http://jena.hpl.hp.com/ARQ/function#>',
        'PREFIX fn: <http://www.w3.org/2005/xpath-functions#>',
        'PREFIX owl: <http://www.w3.org/2002/07/owl#>',
        'PREFIX par: <http://parliament.semwebcentral.org/parliament#>', 
        'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>', 
        'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>', 
        'PREFIX time: <http://www.w3.org/2006/time#>', 
        'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>', 
        'PREFIX sorelcom: <http://www.morelab.deusto.es/ontologies/sorelcom#>', 
        'PREFIX ogc: <http://www.opengis.net/ont/geosparql#>',
        'PREFIX foaf: <http://xmlns.com/foaf/0.1/>'
    ].join('\n'),
    sparqlURI: "http://localhost:8080/parliament/sparql",
    bulkURI: "http://localhost:8080/parliament/bulk",
    graph: "http://morelab.deusto.es/sorelcom",

    /** Select operation on the Triplestore.*/
    select: function (bindings, triples, extras, callback) {
        var bindings = bindings || '*';
        var extras = extras || '';

        request.post({
                uri: "http://localhost:8080/parliament/sparql",
                json: true,
                form: {
                    query: util.format('%s SELECT %s WHERE { GRAPH <%s> { %s } } %s', this.prefixes, bindings, this.graph, triples, extras),
                    output: "json"
                }
            },
            function (err, res, body) {
                if(err || res.statusCode != 200)
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
                    query: util.format('%s SELECT * WHERE { GRAPH <%s> { %s  %s  ?list . ?list  rdf:rest*/rdf:first  ?node . %s } }', this.prefixes, this.graph, id, list, triples),
                    output: "json"
                }
            },
            function (err, res, body) {
                if(err || res.statusCode != 200)
                    return callback(err || "Database responded with status code " + res.statusCode);
                
                callback(null, bindingsToJson(body));
            }
        );
    }, 

    geoSelect: function (triples, callback) {
        request.post({
                uri: "http://localhost:8080/parliament/sparql",
                json: true,
                form: {
                    query: util.format('%s SELECT * WHERE { GRAPH <%s> { %s } }', this.prefixes, this.graph, triples),
                    output: "json"
                }
            },
            function (err, res, body) {
                if(err || res.statusCode != 200)
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
                    query: util.format('%s ASK FROM <%s> { %s } ', this.prefixes, this.graph, triples),
                    output: "json"
                },
            },
            function (err, res, body) {
                if(!err && res.statusCode != 200)
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
                    update: util.format('%s INSERT DATA INTO <%s> { %s } ', this.prefixes, this.graph, triples),
                    display: "json",
                    output: "json"
                },
            },
            function (err, res, body) {
                if(!err && res.statusCode != 200)
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
                    update: [util.format('%s MODIFY <%s>',          this.prefixes, this.graph),
                             util.format('DELETE { %s %s ?list }',  id, list),
                             util.format('INSERT { %s %s [rdf:first %s;rdf:rest ?list] }', id, list, element),
                             util.format('WHERE {  %s %s ?list . }', id, list)
                             ].join('\n'),
                    output: "json"
                },
            },
            function (err, res, body) {
                if(!err && res.statusCode != 200)
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
                    update: util.format('%s MODIFY <%s> DELETE { %s } INSERT { %s } WHERE { %s }', this.prefixes, this.graph, oldTriples, newTriples, whereClause),
                    output: "json"
                },
            },
            function (err, res, body) {
                if(!err && res.statusCode != 200)
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
                    display: "json",
                    output: "json"
                },
            },
            function (err, res, body) {
                if(!err && res.statusCode != 200)
                    err = "Database responded with status code " + res.statusCode;
                callback(err, body);
            }
        );
    },


    update: function (query, callback) {
        request({
                uri: "http://localhost:8080/parliament/sparql",
                method: "POST",
                json: true,
                form: {
                    update: this.prefixes + query,
                    display: "json",
                    output: "json"
                },
            },
            function (err, res, body) {
                if(!err && res.statusCode != 200)
                    err = "Database responded with status code " + res.statusCode;
                callback(err, body);
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
