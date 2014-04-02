var db = require('./../connectors/parliament'),
    geo = require('./../utils/geo'),
    util = require('util');

/** Mock */
var counter = 1;

function POI(data){
    this.id = data.id;
    this.description = data.description;
    this.author = data.author;
    this.geometry = data.geometry;

    /** Insert route to triplestore */
    this.save = function(done){
        var oldTriples = util.format('sorelcom:%s sorelcom:hasNote ?list . ',   this.author);

        var newTriples = util.format('sorelcom:%s rdf:type sorelcom:Note . ',           this.id) +
            util.format('sorelcom:%s sorelcom:hasDescription "%s" . ',                   this.id, this.description) +
            util.format('sorelcom:%s sorelcom:hasAuthor sorelcom:%s . ',                 this.id, this.author) +
            util.format('sorelcom:%s ogc:hasGeometry sorelcom:%sgeom . ',               this.id, this.id) +
            util.format('sorelcom:%sgeom ogc:asWKT "%s"^^ogc:wktLiteral . ',            this.id, geo.toWKT(this.geometry)) +
            util.format('sorelcom:%s sorelcom:hasNote [rdf:first sorelcom:%s;rdf:rest ?list] . ',  this.author, this.id); 

        var where = util.format('sorelcom:%s sorelcom:hasNote ?list . ',   this.author);

        db.modify(oldTriples, newTriples, where, done);
    };
}

POI.create = function(author, geojson){
    return new POI({
        id: 'note'+counter++,
        description: geojson.properties.description,
        author: author,
        date: new Date(),
        geometry: geojson.geometry
    });    
};

POI.findById = function(id, done){
    db.geoSelect(
        util.format('sorelcom:%s sorelcom:hasDescription ?description . ',  id) +
        util.format('sorelcom:%s ogc:hasGeometry ?geom . ', id) +
        util.format('?geom ogc:asWKT ?wkt .') +
        util.format('sorelcom:%s sorelcom:hasAuthor ?a . ', id) +
        '?a foaf:nick ?author . ', done);
};

POI.list = function(done){
    var select = '?id rdf:type sorelcom:Note . ?id sorelcom:hasLabel ?name .';
    db.select(null, select, null, function (err, data) {
        if (err)
            done(err);
        else {
            done(null, data);
        }
    });
};

module.exports = POI;