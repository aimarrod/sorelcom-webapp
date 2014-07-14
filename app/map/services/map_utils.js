angular.module('sorelcomApp').service('MapUtil', function MapUtil($rootScope, $compile, API){
  var that = this;

  API.get('amenities').then(
    function success(data){
      that.icons = [];
      for(group in data.categoryGroups)
        for(category in data.categoryGroups[group].categories)
          that.icons[data.categoryGroups[group].categories[category].name] = L.AwesomeMarkers.icon({prefix:'fa', icon: data.categoryGroups[group].categories[category].icon.name, markerColor: data.categoryGroups[group].categories[category].icon.color});
    }
  );

  function makePopup(type, properties){
    var html = '<div class="popup-box">';
    html += '<h4>' + properties.name + '</h4>';
    html += '<button class="btn blue" ui-sref="'+((type==='LineString')?'trail':'poi')+'({id: \'' + properties.id + '\'})">Details</button>';
    html += '</div>';
    return $compile(angular.element(html))($rootScope.$new());
  }

  this.loadPois = function(geojson){
    console.log(geojson);
    return L.geoJson(geojson, {
      onEachFeature: function(feature, layer){
          layer.bindPopup(makePopup(feature.geometry.type, feature.properties)[0]);
      },
      pointToLayer: function(feature, latlng){
          if(feature.properties.category in that.icons){
              return L.marker(latlng, { icon: that.icons[feature.properties.category] });
          }
          return L.marker(latlng, { icon: that.icons['Custom'] });
      }
    });
  };
});
