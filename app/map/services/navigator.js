angular.module('sorelcomApp').service('Explorer', function Explorer($rootScope, $q, API, Map, $compile){
  var that = this;

  this.init = function(){
    Map.map.on('moveend', showView);
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
    if(that.canceler)
      that.canceler.resolve();
    that.clean();
    Map.map.off('moveend', showView);
  }

  this.clean = function(){
      if(this.explorerData){
          Map.map.removeLayer(this.explorerData.layer);
          this.explorerData = null;
      }
  };

  function showView(geojson){
    if(!that.categories)
      return;
    var query = { bbox: Map.map.getBounds().toBBoxString() }
    if(!canViewRoutes())
      query.type = 'Point of Interest';

    that.canceler = $q.defer();

    API.withHttpConfig({timeout: that.canceler}).get('within', query).then(
        loadGeoJSON
    );
  };

  function canViewRoutes(){
    return Map.map.getZoom() > 6;
  };

  function makePopup(type, properties){
    var html = '<div class="popup-box">';
    if(properties.name)
      html += '<h3>' + properties.name + '</h3>';
    if(properties.description)
      html += '<p>' + properties.description + '</p>';
    if(properties.difficulty)
      html += '<p> <strong>Difficulty:</strong> ' + properties.difficulty + '</p>';
    html += '<button class="btn blue" ui-sref="web.'+((type==='LineString')?'trail':'poi')+'({id: \'' + properties.id + '\'})">Details</button>';
    html += '<div>';
    return $compile(angular.element(html))($rootScope.$new());
  }

  function loadGeoJSON(geojson){
    that.clean();
    that.explorerData = { layer: L.layerGroup(), data: [] };
    that.explorerData.layer.addTo(Map.map);
    L.geoJson(geojson, {
      onEachFeature: function(feature, layer){
        if(feature.geometry.type === 'LineString')
            feature.properties.type = 'Trail';
          else
            feature.properties.type = 'Point of Interest';
          that.explorerData.data.push(feature.properties);
          layer.bindPopup(makePopup(feature.geometry.type, feature.properties)[0]);
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
