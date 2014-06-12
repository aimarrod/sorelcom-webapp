/*jshint multistr: true */
var util = require('util');
var dateutil = require('dateutil');
var geo = require('./../utils/geo');

function calculateURI(){
  var uri = '<http://sorelcom.com';
  for(var i = 0, len = arguments.length; i < len; i++)
    if(arguments[i] instanceof Array)
      for(var j in arguments[i])
        uri += '/' + arguments[i][j];
    else
      uri += '/' + arguments[i];
  return uri + '>';
}

function QueryFactory(){

  this.Trail = {};
  this.Poi = {};
  this.User = {};

  this.Trail.new = function(id, args){
    var date = new Date();
    var params = {};
    var trail = calculateURI('trail',id);
    var geom = calculateURI('trail',id,'geo_hasGeometry','geom');

    params.where = 'BIND(' + trail + ' AS ?s) . BIND(' + geom + ' AS ?geom) ?author rdf:label "' + args.author + '".';
    params.insert = '?s rdf:label "' + id + '" . ?s rdf:type sorelcom:Trail . \
    ?s sorelcom:name "' + args.name + '" . \
    ?s sorelcom:description \'\'\'' + args.content + '\'\'\' . \
    ?s sorelcom:difficulty "' + args.difficulty + '"^^xsd:integer . \
    ?s sorelcom:totalDistance "' + args.totalDistance + '"^^xsd:integer . \
    ?s sorelcom:maximumAltitude "' + args.maximumAltitude + '"^^xsd:float . \
    ?s sorelcom:minimumAltitude "' + args.minimumAltitude + '"^^xsd:float . \
    ?s sorelcom:ascendingDistance "' + args.ascendingDistance + '"^^xsd:float . \
    ?s sorelcom:descendingDistance "' + args.descendingDistance + '"^^xsd:float . \
    ?s sorelcom:isCircular "' + args.isCircular + '"^^xsd:boolean . \
    ?s sorelcom:asGPX \'\'\'' + args.gpx + '\'\'\'^^sorelcom:GPXLiteral . \
    ?s sorelcom:hasAuthor ?author . \
    ?s dcterms:created "' + util.format('%sT%sZ', dateutil.format(date, 'Y-m-d'), dateutil.format(date, 'h:i:s')) + '"^^xsd:dateTime . \
    ?s geo:hasGeometry ?geom . \
    ?geom geo:asWKT "' + geo.toWKT2D(args.geometry) + '"^^geo:wktLiteral . \
    ?geom rdf:type geo:Geometry .';

    return params;
  };

  this.Trail.get = function(id){
    var params = {};

    params.bindings = '?id ?name ?description ?totalDistance ?maximumAltitude ?minimumAltitude \
    ?difficulty ?ascendingDistance ?descendingDistance ?circular \
    ?authorId ?authorName ?geometry';
    params.select = '?s rdf:label "' + id + '" . \
    ?s rdf:label ?id . \
    ?s sorelcom:name ?name . \
    OPTIONAL { ?s sorelcom:description ?description . } \
    OPTIONAL { ?s sorelcom:maximumAltitude ?maximumAltitude . } \
    OPTIONAL { ?s sorelcom:minimumAltitude ?minimumAltitude . } \
    OPTIONAL { ?s sorelcom:difficulty ?difficulty . } \
    OPTIONAL { ?s sorelcom:totalDistance ?totalDistance . }\
    OPTIONAL { ?s sorelcom:ascendingDistance ?ascendingDistance . } \
    OPTIONAL { ?s sorelcom:descendingDistance ?descendingDistance . } \
    OPTIONAL { ?s sorelcom:isCircular ?circular . } \
    ?s sorelcom:hasAuthor ?author . \
    ?author rdf:label ?authorId . \
    ?author foaf:nick ?authorName . \
    ?s geo:hasGeometry ?geom . \
    ?geom geo:asWKT ?geometry .';

    return params;
  };

  this.Trail.addImage = function(id, author, url, number){
    var params = {};
    var image = calculateURI('trail', id, 'media', number);

    params.where = '?s rdf:label "' + id + '" . \
    ?author rdf:label "' + author + '" . \
    BIND(' + image + ' AS ?image) .';
    params.insert = '?image sorelcom:mediaOf ?s . \
    ?image sorelcom:storedOn "' + url + '" . \
    ?image rdf:type sorelcom:Image . \
    ?image sorelcom:hasAuthor ?author .';

    return params;
  };

  this.Trail.addPost = function(id, author, text, number){
    var params = {};
    var post = calculateURI('trail', id, 'media', number);

    params.where = '?s rdf:label "' + id + '" . \
    ?author rdf:label "' + author + '" . \
    BIND(' + post + ' AS ?post) .';
    params.insert = '?post sorelcom:mediaOf ?s . \
    ?post sorelcom:content "' + text + '" . \
    ?post rdf:type sorelcom:Text . \
    ?post sorelcom:hasAuthor ?author .';

    return params;
  };

  this.Poi.new = function(id, args){
    var date = new Date();
    var params = {};
    var poi = calculateURI('poi',id);
    var geom = calculateURI('poi',id,'geo_hasGeometry','geom');

    params.where = 'BIND(' + poi + ' AS ?s) . BIND(' + geom + ' AS ?geom) . ?author rdf:label "' + args.author + '".';
    params.insert = '?s rdf:label "' + id + '" . ?s rdf:type sorelcom:PointOfInterest . \
    ?s sorelcom:name "' + args.name + '" . \
    ?s sorelcom:description \'\'\'' + args.content + '\'\'\' . \
    ?s sorelcom:category "' + args.category + '". \
    ?s sorelcom:altitude "' + args.altitude + '"^^xsd:float . \
    ?s sorelcom:asGPX \'\'\'' + args.gpx + '\'\'\'^^sorelcom:GPXLiteral . \
    ?s sorelcom:hasAuthor ?author . \
    ?s dcterms:created "' + util.format('%sT%sZ', dateutil.format(date, 'Y-m-d'), dateutil.format(date, 'h:i:s')) + '"^^xsd:dateTime . \
    ?s geo:hasGeometry ?geom . \
    ?geom geo:asWKT "' + geo.toWKT2D(args.geometry) + '"^^geo:wktLiteral . \
    ?geom rdf:type geo:Geometry .';

    return params;
  };

  this.Poi.get = function(id){
    var params = {};

    params.bindings = '?id ?name ?description ?altitude ?category ?authorId ?authorName ?geometry';
    params.select = '?s rdf:label "' + id + '" . \
    ?s rdf:label ?id . \
    ?s sorelcom:name ?name . \
    OPTIONAL { ?s sorelcom:description ?description . } \
    OPTIONAL { ?s sorelcom:altitude ?altitude . } \
    OPTIONAL { ?s sorelcom:category ?category . } \
    ?s sorelcom:hasAuthor ?author . \
    ?author rdf:label ?authorId . \
    ?author foaf:nick ?authorName . \
    ?s geo:hasGeometry ?geom . \
    ?geom geo:asWKT ?geometry .';

    return params;
  };

  this.Poi.addImage = function(id, author, url, number){
    var params = {};
    var image = calculateURI('poi', id, 'media', number);

    params.where = '?s rdf:label "' + id + '" . \
    ?author rdf:label "' + author + '" . \
    BIND(' + image + ' AS ?image) .';
    params.insert = '?image sorelcom:mediaOf ?s . \
    ?image sorelcom:storedOn "' + url + '" . \
    ?image rdf:type sorelcom:Image . \
    ?image sorelcom:hasAuthor ?author .';

    return params;
  };

  this.Poi.addPost = function(id, author, text, number){
    var params = {};
    var post = calculateURI('poi', id, 'media', number);

    params.where = '?s rdf:label "' + id + '" . \
    ?author rdf:label "' + author + '" . \
    BIND(' + post + ' AS ?post) .';
    params.insert = '?post sorelcom:mediaOf ?s . \
    ?post sorelcom:content "' + text + '" . \
    ?post rdf:type sorelcom:Text . \
    ?post sorelcom:hasAuthor ?author .';

    return params;
  };

  this.User.new = function(args){
    var params = {};
    var user = calculateURI('user', args.name);
    var avatar = calculateURI('user', args.name, 'foaf_depiction', 'avatar');

    params.where = 'BIND (' + user + ' AS ?s) . BIND (' + avatar + ' AS ?avatar)';
    params.insert = '?s rdf:label "' + args.name + '" . \
    ?s rdf:type foaf:Person . \
    ?s foaf:nick "' + args.name + '" . \
    ?s foaf:mbox "' + args.email + '" . \
    ?s foaf:depiction ?avatar . \
    ?avatar rdf:type sorelcom:Image . \
    ?avatar sorelcom:storedOn "/images/icon/user.png" . ';

    return params;
  };

  this.User.get = function(id){
    var params = {};

    params.bindings = '?name ?email ?avatar ?givenName ?familyName ?weblog ?about';
    params.select = '?s rdf:label "' + id + '" . \
    ?s rdf:label ?id . \
    ?s foaf:nick ?name . \
    ?s foaf:mbox ?email . \
    OPTIONAL { ?s foaf:familyName ?familyName } . \
    OPTIONAL { ?s foaf:givenName ?givenName } . \
    OPTIONAL { ?s foaf:weblog ?weblog } . \
    OPTIONAL { ?s rdf:comment ?about } . \
    OPTIONAL { ?a foaf:depicts ?s . ?a sorelcom:storedOn ?avatar } . ';

    return params;
  };

  this.User.update = function(id, args){
    var params = {
      delete: '',
      insert: '',
      where: '?user rdf:label "' + id + '" . '
    };

    if(args.familyName){
      params.delete += '?user foaf:familyName ?fname . ';
      params.insert += '?user foaf:familyName "' + args.familyName + '" . ';
      params.where += 'OPTIONAL { ?user foaf:familyName ?fname . }';
    }
    if(args.givenName){
      params.delete += '?user foaf:givenName ?gname . ';
      params.insert += '?user foaf:givenName "' + args.givenName + '" . ';
      params.where += 'OPTIONAL { ?user foaf:givenName ?gname . }';
    }
    if(args.weblog){
      params.delete += '?user foaf:weblog ?weblog . ';
      params.insert += '?user foaf:weblog "' + args.weblog + '" . ';
      params.where += 'OPTIONAL { ?user foaf:weblog ?weblog . }';
    }
    if(args.about){
      params.delete += '?user rdf:comment ?about . ';
      params.insert += '?user rdf:comment "' + args.about + '" . ';
      params.where += 'OPTIONAL { ?user rdf:comment ?about } ';
    }
    return params;
  };

  this.User.setAvatar = function(user, avatar){
    var params = {};

    params.delete = '?a sorelcom:storedOn ?avatar . ';

    params.insert = '?a sorelcom:storedOn "' + avatar + '"';

    params.where = '?s rdf:label "' + user + '" . ?s foaf:depiction ?a . ';

    return params;
  };

  this.User.trails = function(user){
    var params = {};

    params.bindings = '?id ?name';

    params.select = '?s rdf:label "' + user + '" . \
    ?s sorelcom:authorOf ?thing . \
    ?thing rdf:label ?id . \
    ?thing sorelcom:name ?name . \
    ?thing rdf:type sorelcom:Trail . ';

    return params;
  };

  this.User.pois = function(user){
    var params = {};

    params.bindings = '?id ?name';

    params.select = '?s rdf:label "' + user + '" . \
    ?s sorelcom:authorOf ?thing . \
    ?thing rdf:label ?id . \
    ?thing sorelcom:name ?name . \
    ?thing rdf:type sorelcom:PointOfInterest . ';

    return params;
  };

  this.User.followers = function(user){
    var params = {};
    params.bindings = '?name';
    params.select = '?user rdf:label "' + user + '" . \
    ?follower sorelcom:follows ?user . \
    ?follower foaf:nick ?name . ';
    return params;
  };

  this.User.follow = function(user, follower){
    var params = {};
    params.insert = '?follower sorelcom:follows ?user';
    params.where = '?user rdf:label "' + user + '" . \
    ?follower rdf:label "' + follower + '" . \
    ?user rdf:type foaf:Person . \
    ?follower rdf:type foaf:Person . ';
    return params;
  };

  this.User.addBuddy = function(user, buddy){
    var params = {};
    params.insert = '?buddy sorelcom:trailBuddyOf ?user';
    params.where = '?user rdf:label "' + user + '" . \
    ?buddy rdf:label "' + buddy + '" . \
    ?user rdf:type foaf:Person . \
    ?buddy rdf:type foaf:Person . ';
    return params;
  };

  this.User.buddies = function(user){
    var params = {};
    params.bindings = '?name';
    params.select = '?s rdf:label "' + user + '" . \
    ?s sorelcom:trailBuddyOf ?buddy . \
    ?buddy foaf:nick ?name . ';
    return params;
  };

  this.User.isBuddy = function(user, buddy){
    return '?user sorelcom:TrailBuddyOf ?buddy . ?user rdf:label "' + user + '" . ?buddy rdf:label "' + buddy + '" .';
  };

  this.User.traverse = function(user, trail){
    var params = {};

    params.insert = '?user sorelcom:hasTraversed ?trail';
    params.where = '?user rdf:label "' + user + '" . \
    ?trail rdf:label "' + trail + '" . \
    ?user rdf:type foaf:Person . \
    ?trail rdf:type sorelcom:Trail . ';

    return params;
  };

  this.User.traversed = function(user){
    var params = {};
    params.bindings = '?name';
    params.select = '?user rdf:label "' + user + '" . \
    ?user sorelcom:hasTraversed ?route . \
    ?route sorelcom:name ?name';
    return params;
  };

  this.User.hasTraversed = function(user, trail){
    return '?user sorelcom:hasTraversed ?trail . ?user rdf:label "' + user + '" . ?trail rdf:label "' + trail + '" .';
  };

  this.Trail.countImages = this.Poi.countImages = function(id){
    var params = {};

    params.bindings = '(COUNT(?image) AS ?count)';
    params.select = '?s rdf:label "' + id + '" . \
    ?s sorelcom:hasMedia ?image . \
    ?image rdf:type sorelcom:Image . ';

    return params;
  };

  this.Trail.getImages = this.Poi.getImages = function(id){
    var params = {};

    params.bindings = '?url';
    params.select = '?s rdf:label "' + id + '" . \
    ?s sorelcom:hasMedia ?image . \
    ?image rdf:type sorelcom:Image . \
    ?image sorelcom:storedOn ?url .';

    return params;
  };

  this.Trail.countPosts = this.Poi.countPosts = function(id){
    var params = {};

    params.bindings = '(COUNT(?post) AS ?count)';
    params.select = '?s rdf:label "' + id + '" . \
    ?s sorelcom:hasMedia ?post . \
    ?post rdf:type sorelcom:Text . ';

    return params;
  };

  this.Trail.getPosts = this.Poi.getPosts = function(id){
    var params = {};

    params.bindings = '?content ?author ?avatar';
    params.select = '?s rdf:label "' + id + '" . \
    ?s sorelcom:hasMedia ?post . \
    ?post rdf:type sorelcom:Text . \
    ?post sorelcom:content ?content . \
    ?post sorelcom:hasAuthor ?a . \
    ?a foaf:nick ?author . \
    ?a foaf:depiction ?m . \
    ?m sorelcom:storedOn ?avatar . ';

    return params;
  };

  this.getList = function(type){
    var params = {};

    params.bindings = '?id ?name';
    params.select = '?s rdf:label ?id . \
    ?s rdf:type ' + type + ' . \
    { ?s sorelcom:name ?name . } UNION { ?s foaf:name ?name . }';

    return params;
  };
}

module.exports = QueryFactory;
