var terraformer = require('terraformer'),
	wkt = require('terraformer-wkt-parser');

module.exports = {
	toWKT: function(geometry){
		return wkt.convert(geometry);
	}
};