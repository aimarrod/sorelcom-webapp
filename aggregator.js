var SparqlClient = require('./lib/utils/sparql');
var geo = require('./lib/utils/geo');
var request = require('request');
var clc = require('cli-color');
var util = require('util');
var dateutil = require('dateutil');
var fs = require('fs');

var bbox = '35.889,-10.020,44.072,3.032';

var sparqlClient = new SparqlClient('http://localhost:8080/openrdf-sesame/repositories/sorelcomtest',
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

var currentDate = function(){
  var date = new Date();
  return util.format('%sT%sZ', dateutil.format(date, 'Y-m-d'), dateutil.format(date, 'h:i:s'));
};

var makeCategories = function(){
  return 'INSERT { \
    sorelcom:Restaurant rdf:type sorelcom:Category . \
    sorelcom:Restaurant rdfs:label "Restaurant" . \
    sorelcom:Cafe rdf:type sorelcom:Category . \
    sorelcom:Cafe rdfs:label "Cafe" . \
    sorelcom:Pub rdf:type sorelcom:Category . \
    sorelcom:Pub rdfs:label "Pub" . \
    sorelcom:Pharmacy rdf:type sorelcom:Category . \
    sorelcom:Pharmacy rdfs:label "Pharmacy" . \
    sorelcom:Hospital rdf:type sorelcom:Category . \
    sorelcom:Hospital rdfs:label "Hospital" . \
    sorelcom:Bus_Stop rdf:type sorelcom:Category . \
    sorelcom:Bus_Stop rdfs:label "Bus Stop" . \
    sorelcom:Train_Station rdf:type sorelcom:Category . \
    sorelcom:Train_Station rdfs:label "Train Station" . \
    sorelcom:University rdf:type sorelcom:Category . \
    sorelcom:University rdfs:label "University" . \
    sorelcom:Art rdf:type sorelcom:Category . \
    sorelcom:Art rdfs:label "Art" . \
    sorelcom:Viewpoint rdf:type sorelcom:Category . \
    sorelcom:Viewpoint rdfs:label "View Point" . \
  } WHERE { \
    \
  }';
};

var makeUsers = function(){
  return 'INSERT {\
    ?s rdf:type foaf:Agent . \
    ?s rdfs:label "OpenStreetMap" . \
    ?s foaf:nick "OpenStreetMap" . \
    ?s foaf:weblog "OpenStreetMap" . \
    ?s foaf:mbox "-" . \
    ?s foaf:depiction ?avatar . \
    ?s rdf:type foaf:Person . \
    ?avatar rdf:type ma:Image . \
    ?avatar ma:locator "http://apps.morelab.deusto.es/sorelcom/images/user/default.png"^^xsd:anyURI . \
  } WHERE { \
    BIND(<http://sorelcom.com/user/OpenStreetMap> AS ?s) \
    BIND(<http://sorelcom.com/user/OpenStreetMap/image> AS ?avatar) \
  }'
};

var makeQuery = function(poi){
  return 'INSERT { \
    ?s rdf:type geo:Feature . \
    ?s rdf:type sorelcom:PointOfInterest . \
    ?s rdfs:label "' + poi.id + '" . \
    ?s sorelcom:name "' + poi.name + '" . \
    ?s sorelcom:description \'\'\'Point of Interest courtesy of OpenStreetMap.\
     \nMore information about this point of interest can be found on http://www.openstreetmap.org.\
     \nThe ID associated with it is ' + poi.id + ' \'\'\' . \
    ?s sorelcom:altitude "0"^^xsd:float . \
    ?s dcterms:created "' + currentDate() + '"^^xsd:dateTime . \
    ?s sorelcom:category ?category . \
    \
    ?s foaf:maker ?author . \
    ?author foaf:made ?s . \
    \
    ?s geo:hasGeometry ?geom . \
    ?geom geo:asWKT "' + poi.geometry + '"^^geo:wktLiteral . \
    ?geom rdf:type geo:Geometry . \
  } WHERE { \
    BIND(<http://sorelcom.com/poi/' + poi.id + '> AS ?s) \
    BIND(<http://sorelcom.com/poi/' + poi.id + '/geom> AS ?geom) \
    ?author rdfs:label "OpenStreetMap" . \
    ?category rdfs:label "' + poi.category + '" . \
    ?category rdf:type sorelcom:Category . \
  }';
};

function OSMAggregator(){
  var that = this;

  this.queryForm = { data: '[out:json];\n\
    node\n\
      ["amenity"~""]\n\
      (' + bbox + ');\n\
      out body;'};

  this.categories = {
    'restaurant': 'Restaurant',
    'fast_food': 'Restaurant',
    'food_court': 'Restaurant',
    'bar': 'Bar',
    'cafe': 'Cafe',
    'pub': 'Pub',
    'pharmacy': 'Pharmacy',
    'Medical clinic': 'Hospital',
    'clinic': 'Hospital',
    'hospital': 'Hospital',
    'doctors': 'Doctors',
    'bus_stop': 'Bus Stop',
    'bus_station': 'Bus Stop',
    'train_station': 'Train Station',
    'university': 'University',
    'college': 'University',
    'arts_center': 'Art',
    'fountain': 'Viewpoint',
    'bridge': 'Viewpoint',
    'bicycle_parking': 'Bike parking',
    'garden': 'Garden',
    'nature_reserve': 'Nature Reserve'
  };

  this.run = function(){
    console.log("Downloading Points of Interest from OSM...");
    request(
      {
        uri: 'http://overpass-api.de/api/interpreter',
        form: this.queryForm,
        method: 'POST',
        json: true
      },
      this.process
    );
  };

  this.process = function(err, res, body){
    console.log('Download finished, got ' + body.elements.length + ' points.');

    that.extracted = [];
    console.log("Starting processing...");

    var results = body.elements; //Get results;
    for(var i = 0, l = results.length; i < l; i++){
      var node = results[i];
      if(node.lat === undefined || node.lon === undefined || !node.tags || !node.tags.name || !that.categories[node.tags.amenity]){
        continue;
      } else {
        var poi = {
          id: node.id,
          author: 'OpenStreetMap',
          geometry: geo.pointToWKT(node.lat, node.lon),
          description: node.tags.description,
          category: that.categories[node.tags.amenity],
          name: node.tags.name
        };
        that.extracted.push(poi);
      }
    }
    that.successes = 0;
    that.failures = 0;
    console.log('Extracted ' + clc.green(that.extracted.length) + ' valid points of interest.');
    fs.writeFile('osmdata.js', JSON.stringify(that.extracted), function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("JSON saved to " + osmFile);
      }
    });
  };


    this.save = function(index){
        if(index === that.extracted.length){
           return;
        }
        sparqlClient.update(makeQuery(that.extracted[index]), function(err, data){
          if(err) that.failures += 1;
          else that.successes += 1;

          process.stdout.write('Processed [' + index + '/' + that.extracted.length + '] ' + clc.green(that.successes) + ' ' + clc.red(that.failures) + '\r');
          that.save(index+1);
        });
    };
}

sparqlClient.update(makeUsers(), function(err, data){
  if(err) console.log('Users could not be inserted');
  else console.log('Users inserted succesfully')
});

sparqlClient.update(makeCategories(), function(err, data){
  if(err) console.log('Categories could not be inserted');
  else console.log('Categories inserted succesfully')
});

new OSMAggregator().run();
