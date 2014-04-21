var terraformer = require('terraformer'),
	wkt = require('terraformer-wkt-parser');

module.exports = {
	toWKT: function(geometry){
		return wkt.convert(geometry);
	},
	/** Gets uris and points for all linestrings */
	toWKT2D: function(geometry){
		for(var i = 0, len = geometry.coordinates.length; i < len; i++)
			geometry.coordinates[i].splice(2,1);
		
		return wkt.convert(geometry);
	}
};