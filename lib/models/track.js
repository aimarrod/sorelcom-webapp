var db = require('./../connectors/parliament'),
    geo = require('./../utils/geo'),
    util = require('util'),
    Resource = require('./resource');

var Track = {};

Track.create = function(author, geojson, done){
    var id = 'Track' + geojson.properties.name.split(' ').join('_');

    var oldTriples = util.format('sorelcom:%s sioc:creator_of ?list . ',                        author);
    var newTriples = util.format('sorelcom:%s rdf:type sorelcom:Track . ',                      id) +
        util.format('sorelcom:%s sioc:name "%s" . ',                                            id, geojson.properties.name) +
        util.format('sorelcom:%s sioc:content "%s" . ',                                         id, geojson.properties.content) +
        util.format('sorelcom:%s sioc:has_creator sorelcom:%s . ',                              id, author) +
        util.format('sorelcom:%s ogc:hasGeometry sorelcom:%sgeom . ',                           id, id) +
        util.format('sorelcom:%sgeom ogc:asWKT "%s"^^ogc:wktLiteral . ',                        id, geo.toWKT2D(geojson.geometry)) +
        util.format('sorelcom:%sgeom rdf:type ogc:Geometry . ',                                 id) +
        util.format('sorelcom:%s sioc:creator_of [rdf:first sorelcom:%s;rdf:rest ?list] . ',    author, id); 
    var where = util.format('sorelcom:%s sioc:creator_of ?list . ', author);

    db.modify(oldTriples, newTriples, where, done);

};

Track.findById = function(id, done){
    var query = util.format('sorelcom:%s sioc:name ?name . ',               id) +
        util.format('sorelcom:%s sioc:content ?content . ',  id) +
        util.format('sorelcom:%s ogc:hasGeometry ?geom . ', id) +
        util.format('?geom ogc:asWKT ?wkt .') +
        util.format('sorelcom:%s sioc:has_creator ?authorId . ', id) +
        '?authorId sioc:name ?author . ' +
        '?id sioc:name ?name . ';

    db.geoSelect(null, query, null, done);
};

Track.erase = function(id, done){
    console.log(id);
    var oldTriples = util.format('sorelcom:%s ?p ?o . ',     id) +
                     util.format('sorelcom:%sgeom ?p ?o . ', id);

    var newTriples = '';
    var where = '';

    db.modify(oldTriples, newTriples, where, done);
}

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

                 console.log(geo.toWKT(data.geometry));

    where = util.format('sorelcom:%s sioc:name ?name . ',       properties.id) + 
            util.format('sorelcom:%s sioc:content ?content . ', properties.id) +
            util.format('sorelcom:%sgeom ogc:asWKT ?wkt .',     properties.id);

    db.modify(oldTriples, newTriples, where, done);
}

module.exports = Track;