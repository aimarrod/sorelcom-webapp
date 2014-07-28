var SparqlClient = require('./../utils/sparql');

var sparqlClient = new SparqlClient(
  'http://localhost:8080/openrdf-sesame/repositories/sorelcomtest',
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

function gateway(query, res){
  sparqlClient.query(query, function(err, data){
    if(err) return res.send(500, err);
    return res.send(data);
  });
}

module.exports = function(app){
  app.get('/api/sparql', function(req, res, next){
    gateway(req.query.query, res);
  });
  app.post('/api/sparql', function(req, res, next){
    gateway(req.body.query, res);
  });
  app.get('/api/sparql/namespaces', function(req, res, next){
    res.send(200, sparqlClient.prefixes);
  });
};
