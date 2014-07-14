var dateutil = require('dateutil');
var util = require('util');
var geo = require('./../lib/utils/geo');

module.exports.currentDate = function(){
  var date = new Date();
  return util.format('%sT%sZ', dateutil.format(date, 'Y-m-d'), dateutil.format(date, 'h:i:s'));
};

module.exports.makeCategories = function(){
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

module.exports.makeUsers = function(){
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

module.exports.makeQuery = function(poi){
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


  module.exports.save = function(index){
      if(index === that.extracted.length){
         console.log();
         return;
      }
      sparqlClient.update(makeQuery(that.extracted[index]), function(err, data){
        if(err) that.failures += 1;
        else that.successes += 1;

        process.stdout.write('Processed [' + index + '/' + that.extracted.length + '] ' + clc.green(that.successes) + ' ' + clc.red(that.failures) + '\r');
        that.save(index+1);
      });
  };
