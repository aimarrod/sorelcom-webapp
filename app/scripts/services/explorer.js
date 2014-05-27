angular.module('sorelcomApp').service('Explorer', function Explorer($rootScope, $q, API, Map){
  var that = this;

  this.init = function(){
    Map.map.on('moveend', _showView);
    API.get('amenities').then(
      function success(data){
        that.categories = data.categoryGroups;
        that.icons = {};
        for(group in data.categoryGroups)
          for(category in data.categoryGroups[group].categories)
            that.icons[data.categoryGroups[group].categories[category].name] = L.AwesomeMarkers.icon({prefix:'fa', icon: data.categoryGroups[group].categories[category].icon.name, markerColor: data.categoryGroups[group].categories[category].icon.color});

        if(Map.map.getZoom())
          Map.map.fire('moveend');
      }
    );
  };

  this.destroy = function(){
    if(this.canceler)
      this.canceler.resolve();
    this.clean();
    Map.map.off('moveend', visualize);
  }

  this.clean = function(){
      if(this.explorerData){
          Map.map.removeLayer(this.explorerData.layer);
          this.explorerData = null;
      }
  };

  var _showView = function(geojson){
    if(!that.categories)
      return;
    var query = { bbox: Map.map.getBounds().toBBoxString() }
    if(!_canViewRoutes())
      query.type = 'POI';

    that.canceler = $q.defer();

    API.withHttpConfig({timeout: that.canceler}).get('within', query).then(
        _loadGeoJSON
    );
  };

  var _canViewRoutes = function(){
    return Map.map.getZoom() > 6;
  };

  var _loadGeoJSON = function(geojson){
    that.clean();
    that.explorerData = { layer: L.layerGroup(), data: [] };
    that.explorerData.layer.addTo(Map.map);
    L.geoJson(geojson, {
      onEachFeature: function(feature, layer){
        if(feature.geometry.type === 'LineString')
            feature.properties.type = 'Track';
          else
            feature.properties.type = 'POI';
          that.explorerData.data.push(feature.properties);
      },
      pointToLayer: function(feature, latlng){
          if(feature.properties.category in that.icons){
              return L.marker(latlng, { icon: that.icons[feature.properties.category] });
          }
          return L.marker(latlng, { icon: that.icons['Custom'] });
      },
      style: function(feature){
        if(feature.properties.difficulty !== undefined){
          if(feature.properties.difficulty === 0)
            return { color: 'grey' };
          else if(feature.properties.difficulty < 26)
            return { color: 'green' };
          else if(feature.properties.difficulty < 51)
            return { color: 'blue' };
          else if((feature.properties.difficulty < 76))
            return { color: 'orange' };
          else
            return { color: 'red' };
        }
        return {};
        }
    }).addTo(that.explorerData.layer);
  };

});
