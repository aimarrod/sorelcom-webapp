var terraformer = require('terraformer');
var util = require('util');
var wkt = require('terraformer-wkt-parser');
var xmlbuilder = require('xmlbuilder');

var difficultyConfig = {
	maximum: 100,
	minimum: 1,
	maxSlope: 20
};

function numberToRadius(number){
  return number * Math.PI / 180;
}

function numberToDegree(number){
  return number * 180 / Math.PI;
}

function haversine(pt1, pt2){
  var lon1 = pt1[0],
    lat1 = pt1[1],
    lon2 = pt2[0],
    lat2 = pt2[1],
    dLat = numberToRadius(lat2 - lat1),
    dLon = numberToRadius(lon2 - lon1),
    a = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(numberToRadius(lat1)) *
      Math.cos(numberToRadius(lat2)) * Math.pow(Math.sin(dLon / 2), 2),
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (6371 * c) * 1000;
}

function slope(pt1, pt2){
	var hdist = haversine(pt1, pt2);
	var vdist = Math.abs(pt2[2] - pt1[2]);
	return (vdist/hdist) * 100;
}

//In a separate loop due to complexity, should I integrate with the analyse loop?
function difficulty(coordinates){
	var slopeDistances = [];
	var distance = 0;
	//Small loop to make sure that everything is initialized to 0
	for(var j = 0; j < difficultyConfig.maxSlope; j++)
		slopeDistances.push(0);

	//Get the distances for every slope type
	for(var i = 1, l = coordinates.length; i < l; i++){
		if(coordinates[i-1].length <= 2 || coordinates[i].length <= 2){
			return 0;
		}
		var s = Math.round(slope(coordinates[i-1], coordinates[i]));
		if(s >= difficultyConfig.maximum) s = difficultyConfig.maximum-1;
		var d = haversine(coordinates[i-1], coordinates[i]);
		slopeDistances[s] += d;
		distance += d;
	}

	//Get the difficulty from data
	var df = 0;
  var proportion = difficultyConfig.maximum/distance;
  for(var k = 0; k < difficultyConfig.maxSlope; k++){
    var indexP = k / (difficultyConfig.maxSlope-1);
    indexP = ((1 - indexP) + 1) * indexP;
    df += indexP * proportion * slopeDistances[k];
  }
  return Math.round(df);
}

module.exports.analyseGeojson = function(geojson){
	var geometry;
	if(geojson.type === 'Feature' && geojson.geometry.type === 'LineString')
		geometry = geojson.geometry;
	else if(geojson.type === 'LineString')
		geometry = geojson;
	else
		return;

	var properties = {
		totalDistance: 0,
		ascendingDistance: 0,
		descendingDistance: 0,
		isCircular: false,
		difficulty: difficulty(geometry.coordinates)
	};

	/** Initial Altitude calculations */
	if(geometry.coordinates[0].length > 2){
		properties.maximumAltitude = geometry.coordinates[0][2];
		properties.minimumAltitude = geometry.coordinates[0][2];
	} else {
		properties.maximumAltitude = 0;
		properties.minimumAltitude = 0;
	}

	/* Calculate if it is circular */
	if(haversine(geometry.coordinates[0], geometry.coordinates[geometry.coordinates.length-1]) < 30)
		properties.isCircular = true;

	for(var i = 1, l = geometry.coordinates.length; i < l; i++){
		var localDistance = haversine(geometry.coordinates[i-1], geometry.coordinates[i]);
		properties.totalDistance += localDistance;

		/** ALtitude calculations */
		if(geometry.coordinates[i].length > 2){
			/* Max altitude */
			if(properties.maximumAltitude < geometry.coordinates[i][2])
				properties.maximumAltitude = geometry.coordinates[i][2];
			/* Min altitude */
			if(properties.minimumAltitude > geometry.coordinates[i][2])
				properties.minimumAltitude = geometry.coordinates[i][2];

			/** Things that can only be calculated when the two coordinates have altitude */
			if(geometry.coordinates[i-1].length > 2){
				/* Slope is descending */
				if(geometry.coordinates[i-1][2] > geometry.coordinates[i][2])
					properties.ascendingDistance += geometry.coordinates[i-1][2] - geometry.coordinates[i][2];
				/** Slope is ascending */
				else
					properties.descendingDistance += geometry.coordinates[i][2] - geometry.coordinates[i-1][2];
			}
		}
	}
	properties.totalDistance = Math.round(properties.totalDistance);

	return properties;
};

module.exports.toWKT = function(geometry){
	return wkt.convert(geometry);
};
	/** Gets uris and points for all linestrings */
module.exports.toWKT2D = function(geometry){
	if(geometry.type === 'Point')
		geometry.coordinates.splice(2,1);
	else
		for(var i = 0, len = geometry.coordinates.length; i < len; i++)
			geometry.coordinates[i].splice(2,1);

	return wkt.convert(geometry);
};

module.exports.parse = function(wktString){
	//Remove the CRS, not going to use other cordinate systems that WSG84 (for now)
	wktString = wktString.replace(/<.*>/, '');
	return wkt.parse(wktString);

};


function _bboxToGeojson(bbox){
	var coords = bbox.split(',');
	var geojson = {
		type: 'Polygon',
		coordinates: [[
			[parseFloat(coords[0]), parseFloat(coords[1])],
			[parseFloat(coords[0]), parseFloat(coords[3])],
			[parseFloat(coords[2]), parseFloat(coords[3])],
			[parseFloat(coords[2]), parseFloat(coords[1])],
			[parseFloat(coords[0]), parseFloat(coords[1])] //Database needs bbox to be self closing, sigh
		]]};
	return geojson;
}

module.exports.bboxToGeojson = _bboxToGeojson;

module.exports.bboxToWKT = function(bbox){
	return wkt.convert(_bboxToGeojson(bbox));
};

function featureToGPX(parent, feature){
	if(feature.geometry.type === 'Point'){
		var wpt = parent.ele('wpt')
			.att('lat',feature.geometry.coordinates[1])
			.att('lon', feature.geometry.coordinates[0]);
		wpt.ele('desc', feature.properties.content);
		wpt.ele('name', feature.properties.name);
		wpt.ele('ele', feature.geometry.coordinates[2] || 0);

	} else if(feature.geometry.type === 'LineString'){
		var trk = parent.ele('trk');
		trk.ele('desc', feature.properties.content);
		trk.ele('name', feature.properties.name);

		for(var i = 0, l = feature.geometry.coordinates.length; i < l; i++){
			trk.ele('trkpt')
				.att('lat', feature.geometry.coordinates[i][1])
				.att('lon', feature.geometry.coordinates[i][0])
				.ele('ele', feature.geometry.coordinates[i][2] || 0);
		}
	}
}

module.exports.geojsonToGPX = function(geojson){
	var gpx = xmlbuilder.create('gpx')
		.att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
		.att('xmlns', 'http://www.topografix.com/GPX/1/0')
		.att('version', '1.0')
	  .att('creator','SORELCOM - http://www.morelab.deusto.es/sorelcom')
		.att('xsi:schemaLocation','http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd');

	if(geojson.type === 'FeatureCollection')
		for(var i = 0, l = geojson.features.length; i < l; i++)
			featureToGPX(gpx, geojson.features[i]);
	else if(geojson.type === 'Feature')
		featureToGPX(gpx, geojson);

	gpx = gpx.end({ pretty: true});
	console.log(gpx);
	return gpx;

};
