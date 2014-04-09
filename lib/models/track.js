var db = require('./../connectors/parliament'),
    geo = require('./../utils/geo'),
    util = require('util'),
    resource = require('./resource');

function Track(data){
	this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.author = data.author;
    this.geometry = data.geometry;

    /** Insert route to triplestore */
	this.save = function(done){
        var oldTriples = util.format('sorelcom:%s sioc:creator_of ?list . ',   this.author);

        var newTriples = util.format('sorelcom:%s rdf:type sorelcom:Track . ',           this.id) +
            util.format('sorelcom:%s sioc:name "%s" . ',                         this.id, this.name) +
            util.format('sorelcom:%s sioc:content "%s" . ',                   this.id, this.description) +
            util.format('sorelcom:%s sioc:has_creator sorelcom:%s . ',                 this.id, this.author) +
            util.format('sorelcom:%s ogc:hasGeometry sorelcom:%sgeom . ',               this.id, this.id) +
            util.format('sorelcom:%sgeom ogc:asWKT "%s"^^ogc:wktLiteral . ',            this.id, geo.toWKT(this.geometry)) +
            util.format('sorelcom:%s sioc:creator_of [rdf:first sorelcom:%s;rdf:rest ?list] . ',  this.author, this.id); 

        var where = util.format('sorelcom:%s sioc:creator_of ?list . ',   this.author);

        db.modify(oldTriples, newTriples, where, done);
	};
}

Track.create = function(author, geojson){
    return new Track({
        id: 'track' + resource.nextId(),
        name: geojson.properties.name,
        description: geojson.properties.description,
        author: author,
        date: new Date(),
        geometry: geojson.geometry
    });    
};

Track.findById = function(id, done){
    db.geoSelect(
        util.format('sorelcom:%s sioc:name ?name . ',               id) +
        util.format('sorelcom:%s sioc:content ?content . ',  id) +
        util.format('sorelcom:%s ogc:hasGeometry ?geom . ', id) +
        util.format('?geom ogc:asWKT ?wkt .') +
        util.format('sorelcom:%s sioc:has_creator ?authorId . ', id) +
        '?authorId sioc:name ?author . ' +
        '?id sioc:name ?name . ', done);
};

Track.list = function(done){
    var select = '?id rdf:type sorelcom:Track . ?id sioc:name ?name .';
    db.select(null, select, null, function (err, data) {
        if (err)
            done(err);
        else {
            done(null, data);
        }
    });
};

Track.update = function(data, done){
    var properties = data.properties,
        oldTriples, 
        newTriples,
        where;

    oldTriples = util.format('sorelcom:%s sioc:name ?name . ', properties.id) + 
                 util.format('sorelcom:%s sioc:content ?content . ', properties.id) +
                 util.format('sorelcom:%sgeom ogc:asWKT ?wkt .', properties.id);

    newTriples = util.format('sorelcom:%s sioc:name "%s" . ',                      properties.id, properties.name) +
                 util.format('sorelcom:%s sioc:content "%s" . ',                   properties.id, properties.content) +
                 util.format('sorelcom:%sgeom ogc:asWKT "%s"^^ogc:wktLiteral . ',  properties.id, geo.toWKT(data.geometry));

    where = util.format('sorelcom:%s sioc:name ?name . ',       properties.id) + 
            util.format('sorelcom:%s sioc:content ?content . ', properties.id) +
            util.format('sorelcom:%sgeom ogc:asWKT ?wkt .',     properties.id);

    db.modify(oldTriples, newTriples, where, done);
}

module.exports = Track;