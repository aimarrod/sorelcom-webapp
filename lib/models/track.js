var db = require('./../connectors/parliament'),
    geo = require('./../utils/geo'),
    util = require('util');

/** Mock */
var counter = 1;

function Track(geojson){
	this.id = counter++;
    this.data = geojson;
    this.name = geojson.properties.name;
    this.description = geojson.properties.description;
    //Calculate difficulty
	this.geometry = geojson.geometry;

    /** Triples to insert */
    this.triples = function(){
        return [
            util.format('sorelcom:track%s rdf:type sorelcom:Route .',          this.id),
            util.format('sorelcom:track%s sorelcom:hasLabel "%s" .',           this.id, this.name),
            util.format('sorelcom:track%s sorelcom:hasDescription "%s" .',     this.id, this.description),
            util.format('sorelcom:track%s sorelcom:hasAuthor sorelcom:%s .',   this.id, this.author),
            util.format('sorelcom:track%s ogc:hasGeometry sorelcom:geom%s .',  this.id, this.id),
            util.format('sorelcom:geom%s ogc:asWKT "%s"^^ogc:wktLiteral .',    this.id, geo.toWKT(this.geometry))
        ].join('\n');
    }
    /** Insert route to triplestore */
	this.save = function(done){
        db.insert(this.triples(), done);
	};
}

Track.findById = function(id, done){
    db.geoSelect([
        util.format('sorelcom:%s sorelcom:hasLabel ?name .', id),
        util.format('sorelcom:%s ogc:hasGeometry ?geom .', id),
        util.format('?geom ogc:asWKT ?wkt .'),
        ].join('\n'), done);
};

Track.list = function(done){
    var select = '?id rdf:type sorelcom:Route . ?id sorelcom:hasLabel ?name .';
    db.select(null, select, null, function (err, data) {
        if (err)
            done(err);
        else {
            done(null, data);
        }
    });
};

module.exports = Track;