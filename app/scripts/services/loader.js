angular.module('sorelcomApp').service('Loader', function Loader(){

  this.load = function (text, format) {
      var geojson = extractLayers(text, format);
      if(geojson){
        if(geojson.length === 1){
          return geojson[0];
        } else {
          return geojson;
        }
      } else {
        return null;
      }
  };

  function extractLayers(text, format) {
    var geojson;

    if($.inArray(format, ['gpx', 'GPX']) > -1) {
      geojson = toGeoJSON.gpx($.parseXML(text));
    }

    if(!geojson){
      $scope.$emit('onNotification', 'error', 'File format is not valid');
      return null;
    }

    if(geojson.type === "FeatureCollection"){
      var json = [];
      for(var i = 0, len = geojson.features.length; i < len; i++){
        geojson.features[i].properties.gpx = text;
        json.push(geojson.features[i]);
      }
      return json;
    } else {
      return [geojson];
    }
  }
});
