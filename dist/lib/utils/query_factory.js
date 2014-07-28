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

function currentDate(){
  var date = new Date();
  return util.format('%sT%sZ', dateutil.format(date, 'Y-m-d'), dateutil.format(date, 'h:i:s'));
}

function ResourceFactory(type){
  var that = this;
  this.type = type;

  this.getPosts = function(id){
    var params = {};
    params.bindings = '?text ?rating ?date ?name ?avatar';
    params.select = '?s rdfs:label "' + id + '" . \
    ?s rev:hasReview ?review . \
    ?review rev:text ?text . \
    ?review rev:rating ?rating . \
    ?review rev:reviewer ?author . \
    ?review dcterms:created ?date . \
    ?author foaf:nick ?name . \
    ?author foaf:depiction ?depiction . \
    ?depiction ma:locator ?avatar . ';
    return params;
  };

  this.addPost = function(id, author, review){
    var params = {};
    var reviewURI = calculateURI(this.type, id, 'has_Review', author+'_'+currentDate());

    //Get author, feature and bind review
    params.where = '?feature rdfs:label "' + id + '" . \
    ?author rdfs:label "' + author + '" . \
    BIND(' + reviewURI + ' AS ?review) .';

    params.insert = '?review rev:reviewer ?author . \
    ?feature rev:hasReview ?review . \
    ?review rev:text "' + review.text + '" . \
    ?review rev:rating "' + review.value + '"^^xsd:integer . \
    ?review dcterms:created "' + currentDate() + '"^^xsd:dateTime . \
    ?review rdf:type rev:Review . ';

    return params;
  };

  this.list = function(type){
    var params = {};

    params.bindings = '?id ?name';
    params.select = '?s rdfs:label ?id . \
    ?s rdf:type ' + type + ' . \
    { ?s sorelcom:name ?name . } UNION { ?s foaf:name ?name . }';

    console.log(params);
    return params;
  };

  this.getImages = function(id){
    var params = {};

    params.bindings = '?url';
    params.select = '?feature rdfs:label "' + id + '" . \
    ?feature sorelcom:hasMedia ?image . \
    ?image rdf:type sorelcom:Image . \
    ?image ma:locator ?url .';

    return params;
  };

  this.addImage = function(id, author, filename){
    var params = {};
    var imageURI = calculateURI(this.type, id, 'media', filename);

    params.where = '?feature rdfs:label "' + id + '" . \
    ?author rdfs:label "' + author + '" . \
    BIND(' + imageURI + ' AS ?image) .';

    params.insert = '?image sorelcom:mediaOf ?feature . \
    ?feature sorelcom:hasMedia ?image .\
    ?image foaf:maker ?author . \
    ?author foaf:made ?image . \
    ?image ma:locator "http://apps.morelab.deusto.es/sorelcom/images/' + filename + '"^^xsd:anyURI . \
    ?image rdf:type ma:Image .';

    return params;
  };


  this.nearby = function(id, filter){
    var params = {};

    params.bindings = '?id ?name ?description ?category ?date ?geometry';


    params.select = '?feature rdfs:label "' + id + '" . \
    ?fg geo:asWKT ?fwkt . \
    ?feature geo:hasGeometry ?fg . \
    ?poi rdfs:label ?id . \
    ?poi rdf:type sorelcom:PointOfInterest . \
    ?poi geo:hasGeometry ?pg . \
    ?pg geo:asWKT ?geometry . \
    FILTER (geof:distance(?fwkt, ?geometry, units:metre) < ' + filter.distance + ') \
    ?poi sorelcom:name ?name . \
    ?poi sorelcom:category ?c . ?c rdfs:label ?category . ';

    return params;
  };

  this.rating = function(id){
    var params = {};

    params.bindings = '(SUM(?note) AS ?rating)';
    params.select = '?feature rdfs:label "' + id + '" . \
    ?feature rev:hasReview ?review . \
    ?review rev:rating ?note . ';

    return params;
  };

}

function TrailFactory(){
  var that = this;
  this.prototype = new ResourceFactory('trail');

  this.new = function(id, args){
    var params = {};

    var date = new Date();
    var trailURI = calculateURI(this.prototype.type,id);
    var geom = calculateURI(this.prototype.type,id,'geometry','geom');

    params.where = 'BIND(' + trailURI + ' AS ?s) . \
    BIND(' + geom + ' AS ?geom) . \
    ?author rdfs:label "' + args.author + '". ';
    params.insert = '?s rdfs:label "' + id + '" . \
    ?s rdf:type sorelcom:Trail . \
    ?s sorelcom:name "' + args.name + '" . \
    ?s sorelcom:description \'\'\'' + args.content + '\'\'\' . \
    ?s sorelcom:difficulty "' + args.difficulty + '"^^xsd:integer . \
    ?s sorelcom:totalDistance "' + args.totalDistance + '"^^xsd:integer . \
    ?s sorelcom:maximumAltitude "' + args.maximumAltitude + '"^^xsd:float . \
    ?s sorelcom:minimumAltitude "' + args.minimumAltitude + '"^^xsd:float . \
    ?s sorelcom:ascendingDistance "' + args.ascendingDistance + '"^^xsd:float . \
    ?s sorelcom:descendingDistance "' + args.descendingDistance + '"^^xsd:float . \
    ?s sorelcom:isCircular "' + args.isCircular + '"^^xsd:boolean . \
    ?s dcterms:created "' + util.format('%sT%sZ', dateutil.format(date, 'Y-m-d'), dateutil.format(date, 'h:i:s')) + '"^^xsd:dateTime . \
    \
    ?s foaf:maker ?author . \
    ?author foaf:made ?s . \
    \
    ?s geo:hasGeometry ?geom . \
    ?geom geo:asWKT "' + geo.toWKT2D(args.geometry) + '"^^geo:wktLiteral . \
    ?geom rdf:type geo:Geometry .';

    return params;
  };

  this.get = function(id){
    var params = {};

    params.bindings = '?id ?name ?description ?totalDistance ?maximumAltitude ?minimumAltitude \
    ?difficulty ?ascendingDistance ?descendingDistance ?circular ?date \
    ?authorId ?authorName ?geometry';
    params.select = '?s rdfs:label "' + id + '" . \
    ?s rdfs:label ?id . \
    ?s sorelcom:name ?name . \
    ?s dcterms:created ?date . \
    OPTIONAL { ?s sorelcom:description ?description . } \
    OPTIONAL { ?s sorelcom:maximumAltitude ?maximumAltitude . } \
    OPTIONAL { ?s sorelcom:minimumAltitude ?minimumAltitude . } \
    OPTIONAL { ?s sorelcom:difficulty ?difficulty . } \
    OPTIONAL { ?s sorelcom:totalDistance ?totalDistance . }\
    OPTIONAL { ?s sorelcom:ascendingDistance ?ascendingDistance . } \
    OPTIONAL { ?s sorelcom:descendingDistance ?descendingDistance . } \
    OPTIONAL { ?s sorelcom:isCircular ?circular . } \
    \
    ?s foaf:maker ?author . \
    ?author rdfs:label ?authorId . \
    ?author foaf:nick ?authorName . \
    \
    ?s geo:hasGeometry ?geom . \
    ?geom geo:asWKT ?geometry .';

    return params;
  };

  this.list = function(){
    return this.prototype.list('sorelcom:Trail');
  };
}

function PointOfInterestFactory(){
  var that = this;
  this.prototype = new ResourceFactory('poi');

  this.new = function(id, args){
    var params = {};

    var date = new Date();
    var poi = calculateURI(this.prototype.type, id);
    var geom = calculateURI(this.prototype.type, id,'geometry','geom');

    params.where = 'BIND(' + poi + ' AS ?s) . \
    BIND(' + geom + ' AS ?geom) . \
    ?author rdfs:label "' + args.author + '". \
    ?category rdfs:label "' + args.category + '" . \
    ?category rdf:type sorelcom:Category .';

    params.insert = '?s rdfs:label "' + id + '" . \
    ?s rdf:type geo:Feature . \
    ?s rdf:type sorelcom:PointOfInterest . \
    ?s sorelcom:name "' + args.name + '" . \
    ?s sorelcom:description \'\'\'' + args.content + '\'\'\' . \
    ?s sorelcom:altitude "' + args.altitude + '"^^xsd:float . \
    ?s dcterms:created "' + util.format('%sT%sZ', dateutil.format(date, 'Y-m-d'), dateutil.format(date, 'h:i:s')) + '"^^xsd:dateTime . \
    ?s sorelcom:category ?category . \
    \
    ?s foaf:maker ?author . \
    ?author foaf:made ?s . \
    \
    ?s geo:hasGeometry ?geom . \
    ?geom geo:asWKT "' + geo.toWKT2D(args.geometry) + '"^^geo:wktLiteral . \
    ?geom rdf:type geo:Geometry .';

    return params;
  };

  this.get = function(id){
    var params = {};

    params.bindings = '?id ?name ?description ?altitude ?category ?authorId ?authorName ?date ?geometry';

    params.select = '?s rdfs:label "' + id + '" . \
    ?s rdfs:label ?id . \
    ?s sorelcom:name ?name . \
    ?s dcterms:created ?date . \
    OPTIONAL { ?s sorelcom:description ?description . } \
    OPTIONAL { ?s sorelcom:altitude ?altitude . } \
    OPTIONAL { ?s sorelcom:category ?c . ?c rdfs:label ?category } \
    \
    ?s foaf:maker ?author . \
    ?author rdfs:label ?authorId . \
    ?author foaf:nick ?authorName . \
    \
    ?s geo:hasGeometry ?geom . \
    ?geom geo:asWKT ?geometry .';

    return params;
  };

  this.list = function(){
    return this.prototype.list('sorelcom:PointOfInterest');
  };
}

function GeolocatedNoteFactory(){
  var that = this;
  this.prototype = new ResourceFactory('gnote');

  this.new = function(args){
    var params = {};

    var id = args.author + '_' + currentDate();
    var note = calculateURI(this.prototype.type, id);
    var geom = calculateURI(this.prototype.type, id, 'geometry', 'geom');

    params.where = 'BIND(' + note + ' AS ?s) . \
    BIND(' + geom + ' AS ?geom) . \
    ?author rdfs:label "' + args.author + '". ';

    params.insert = '?s rdfs:label "' + id + '" . \
    ?s rdf:type sorelcom:GeolocatedNote . \
    ?s sorelcom:description \'\'\'' + args.description + '\'\'\' . \
    ?s sorelcom:range "' + args.range + '"^^xsd:float . \
    ?s sorelcom:public "' + args.public + '"^^xsd:boolean . \
    ?s dcterms:created "' + currentDate() + '"^^xsd:dateTime . \
    \
    ?author foaf:made ?s . \
    ?s foaf:maker ?author . \
    \
    ?s geo:hasGeometry ?geom . \
    ?geom geo:asWKT "' + geo.toWKT2D(args.geometry) + '"^^geo:wktLiteral . \
    ?geom rdf:type geo:Geometry .';

    for(var i = 0, l = args.targets.length; i < l; i++){
      params.where += '?target' + i + ' rdfs:label "' + args.targets[i] + '" . ';
      params.insert += '?s sorelcom:hasTarget ?target' + i + ' . ';
    }
    return params;
  };

  this.list = function(){
    return this.prototype.list('sorelcom:GeolocatedNote');
  };
}

function UserFactory(){
  var that = this;
  this.prototype = new ResourceFactory('user');

  this.new = function(args){
    var params = {};

    var user = calculateURI(this.prototype.type, args.name);
    var interests = calculateURI(this.prototype.type, args.name, 'interests');
    var avatar = calculateURI(this.prototype.type, args.name, 'avatar');

    params.where = 'BIND (' + user + ' AS ?s) . \
    BIND (' + avatar + ' AS ?avatar) \
    BIND (' + interests + ' AS ?interests) \
    ?category rdf:type sorelcom:Category . ';

    params.insert = '?s rdfs:label "' + args.name + '" . \
    ?s rdf:type foaf:Agent . \
    ?s rdf:type foaf:Person . \
    ?s foaf:nick "' + args.name + '" . \
    ?s foaf:mbox "' + args.email + '" . \
    \
    ?s sorelcom:interests ?interests . \
    ?interests sorelcom:topic ?category . \
    ?interests sorelcom:topic sorelcom:PointOfInterest . \
    ?s sorelcom:level "25"^^xsd:integer . \
    \
    ?s foaf:depiction ?avatar . \
    ?avatar foaf:depicts ?s . \
    ?avatar rdf:type ma:Image . \
    ?avatar ma:locator "http://apps.morelab.deusto.es/sorelcom/images/user/default.png"^^xsd:anyURI . ';

    return params;
  };

  this.get = function(id){
    var params = {};

    params.bindings = '?name ?email ?avatar ?givenName ?familyName ?weblog ?about';

    params.select = '?s rdfs:label "' + id + '" . \
    ?s rdfs:label ?id . \
    ?s foaf:nick ?name . \
    ?s foaf:mbox ?email . \
    OPTIONAL { ?s foaf:familyName ?familyName } . \
    OPTIONAL { ?s foaf:givenName ?givenName } . \
    OPTIONAL { ?s foaf:weblog ?weblog } . \
    OPTIONAL { ?s rdf:comment ?about } . \
    OPTIONAL { ?s foaf:depiction ?a . ?a ma:locator ?avatar } . ';

    return params;
  };

  this.update = function(id, args){
    var params = {
      delete: '',
      insert: '',
      where: '?user rdfs:label "' + id + '" . '
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
      params.insert += '?user rdf:comment \'\'\'' + args.about + '\'\'\' . ';
      params.where += 'OPTIONAL { ?user rdf:comment ?about } ';
    }
    return params;
  };

  this.setAvatar = function(user, avatar){
    var params = {};

    params.delete = '?a ma:locator ?avatar . ';

    params.insert = '?a ma:locator "' + avatar + '"';

    params.where = '?s rdfs:label "' + user + '" . ?s foaf:depiction ?a . ';

    return params;
  };

  this.trails = function(user){
    var params = {};

    params.bindings = '?id ?name';

    params.select = '?s rdfs:label "' + user + '" . \
    ?s foaf:made ?thing . \
    ?thing rdfs:label ?id . \
    ?thing sorelcom:name ?name . \
    ?thing rdf:type sorelcom:Trail . ';

    return params;
  };

  this.pois = function(user){
    var params = {};

    params.bindings = '?id ?name';

    params.select = '?s rdfs:label "' + user + '" . \
    ?s foaf:made ?thing . \
    ?thing rdfs:label ?id . \
    ?thing sorelcom:name ?name . \
    ?thing rdf:type sorelcom:PointOfInterest . ';

    return params;
  };

  this.followers = function(user){
    var params = {};

    params.bindings = '?name';

    params.select = '?user rdfs:label "' + user + '" . \
    ?follower sorelcom:follows ?user . \
    ?follower foaf:nick ?name . ';

    return params;
  };

  this.follow = function(user, follower){
    var params = {};

    params.insert = '?follower sorelcom:follows ?user';

    params.where = '?user rdfs:label "' + user + '" . \
    ?follower rdfs:label "' + follower + '" . \
    ?user rdf:type foaf:Person . \
    ?follower rdf:type foaf:Person . ';

    return params;
  };

  this.addBuddy = function(user, buddy){
    var params = {};

    params.insert = '?buddy sorelcom:trailBuddyOf ?user . ?user sorelcom:trailBuddyOf ?buddy .';

    params.where = '?user rdfs:label "' + user + '" . \
    ?buddy rdfs:label "' + buddy + '" . \
    ?user rdf:type foaf:Person . \
    ?buddy rdf:type foaf:Person . ';

    return params;
  };

  this.buddies = function(user){
    var params = {};

    params.bindings = '?name';

    params.select = '?s rdfs:label "' + user + '" . \
    ?s sorelcom:trailBuddyOf ?buddy . \
    ?buddy foaf:nick ?name . ';

    return params;
  };

  this.isBuddy = function(user, buddy){
    return '?user sorelcom:TrailBuddyOf ?buddy . ?user rdfs:label "' + user + '" . ?buddy rdfs:label "' + buddy + '" .';
  };

  this.traverse = function(user, trail){
    var params = {};

    params.insert = '?user sorelcom:hasTraversed ?trail . ?trail sorelcom:traversedBy ?user';

    params.where = '?user rdfs:label "' + user + '" . \
    ?trail rdfs:label "' + trail + '" . \
    ?user rdf:type foaf:Person . \
    ?trail rdf:type sorelcom:Trail . ';

    return params;
  };

  this.traversed = function(user){
    var params = {};

    params.bindings = '?name';

    params.select = '?user rdfs:label "' + user + '" . \
    ?user sorelcom:hasTraversed ?route . \
    ?route sorelcom:name ?name';

    return params;
  };

  this.hasTraversed = function(user, trail){
    return '?user sorelcom:hasTraversed ?trail . ?user rdfs:label "' + user + '" . ?trail rdfs:label "' + trail + '" .';
  };

  this.addInterest = function(user, interest){
    var params = {};
    params.insert = '?interest sorelcom:topic ?topic . ';
    params.where = '?user rdfs:label "' + user + '" . \
    ?user sorelcom:interest ?interests . \
    ?topic rdfs:label "' + interest + '" . ';
    return params;
  };

  this.addInterest = function(user, interest){
    var params = {};
    params.delete = '?interest sorelcom:topic ?topic . ';
    params.where = '?user rdfs:label "' + user + '" . \
    ?user sorelcom:interest ?interests . \
    ?topic rdfs:label "' + interest + '" . ';
    return params;
  };

  this.recommended = function(user){
    var params = {};

    params.bindings = '?id ?name';

    params.select = '?user rdfs:label "' + user + '" . \
    ?user sorelcom:level ?level . \
    \
    ?trail rdf:type sorelcom:Trail . \
    ?trail rdfs:label ?id . \
    ?trail sorelcom:name ?name . \
    ?trail sorelcom:difficulty ?difficulty . \
    FILTER(abs(?difficulty-?level) < 50) \
    MINUS { ?user sorelcom:hasTraversed ?trail } \
    MINUS { ?user foaf:made ?trail }';

    params.extras = 'LIMIT 5';

    return params;
  };

  this.list = function(){
    return this.prototype.list('foaf:Person');
  };
}

function QueryFactory(){

  this.Trail = new TrailFactory();

  this.Poi = new PointOfInterestFactory();

  this.Note = new GeolocatedNoteFactory();

  this.User = new UserFactory();
}

module.exports = new QueryFactory();
