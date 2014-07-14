var SparqlClient = require('./../lib/utils/sparql');

module.exports.bbox = '35.889,-10.020,44.072,3.032';

module.exports.sparqlClient = new SparqlClient('http://localhost:8080/openrdf-sesame/repositories/sorelcomtest',
  'prefix my: <http://sorelcom.com/> \n' +
  'prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n' +
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

module.exports.googleAPIKey = 'AIzaSyDbW_awMthrWwK11tseG7XGT_ZElcAoo_M';
