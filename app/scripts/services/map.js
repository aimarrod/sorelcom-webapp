angular.module('sorelcomApp').service('Map', function SharedMap($rootScope, API){
    var that = this;

    this.initMap = function(id){

        var baseLayers = {
            'OpenStreetMap': L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                noWrap: true
            }),
            'OpenCycleMap': L.tileLayer('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                noWrap: true
            })
        };

        this.map = L.map(id, {
            layers: [baseLayers.OpenStreetMap],
            minZoom: 3,
            worldCopyJump: true
        });

        L.control.layers(baseLayers, null, {position: 'topleft'}).addTo(this.map);

        this.map.locate({ setView: true, maxZoom: 15 });
    };

    this.setLayer = function(layer, geojson){
        this.cleanMap();
        this.layerData = this._getLayerData(geojson, false);
        this.layer = layer;
        this.map.addLayer(layer);
        //Center map view
        if(layer instanceof L.Marker) this.map.setView(layer.getLatLng(), 13);
        else this.map.fitBounds(layer.getBounds());
    };

    this.addOverlays = function(layer, geojson){
        if(this.overlays){
            this.map.removeLayer(this.overlays);
            this.overlays = null;
        }

        this.overlaysData = this._getLayerData(geojson, true);
        this.overlays = layer;
        this.map.addLayer(this.overlays);
    }

    this.transitionEditor = function(){
        this.cleanOverlays();
        if(!this.layer) return false;

        this.map.removeLayer(this.layer);

        /* Layer is polyline and not already editable */
        if(this.layer instanceof L.Polyline && !this.layer._markers){
            this._makeEditable(this.layer);
            return true;
        }

        /* Layer is layergroup (from geojson probably) */
        if(this.layer instanceof L.LayerGroup){
            var layers = this.layer.getLayers();
            for(var key in layers){
                if(layers[key] instanceof L.Polyline){
                    this._makeEditable(layers[key]);
                    return true;
                }
            }
        }
    };

    this.transitionExplore = function(){
        if(this.layer instanceof L.Polyline && this.layer._markers){
            this.layer.removeFrom(this.map);
            this.layer = L.polyline(this.layer.getLatLngs());
            this.layer.addTo(this.map);
            return true;
        }

        return false;
    }

    /** Helper to remove overlays from the map */
    this.cleanOverlays = function(){
        if(this.overlays){
            this.map.removeLayer(this.overlays);
            this.overlays = null;
        }
        this.overlaysData = null;
    }

    /** Helper to remove the current layer from the map */
    this.cleanLayer = function(){
        if(this.layer){
            if(this.layer instanceof L.Polyline && this.layer._markers)
                this.layer.removeFrom(this.map);
            else
                this.map.removeLayer(this.layer);

            this.layer = null;
        }
        this.layerData = null;
    }

    this.cleanMap = function(){
        this.cleanLayer();
        this.cleanOverlays();
    }

    this._getLayerData = function(geojson, array){
        if(geojson.type === "FeatureCollection"){
            var layerData = [];
            for(var i = 0, len = geojson.features.length; i < len; i++)
                layerData.push(geojson.features[i].properties);
            return layerData;
        } else {
            if(array)
                return [geojson.properties];
            else
                return geojson.properties;
        }
    }

    this._makeEditable = function(layer){
        this.layer = makePolylineEditor(layer.getLatLngs());
        this.layer.addTo(this.map);
    };

    this.resetEvents = function(){
        this.map.off('click');
    };
    /** ----------------- EDITOR FUNCTIONS -----------------*/

    this.markPOI = function(callback){
        this.stopAction();
        this._markPOI(callback);
    }

    this.initDraw = function(){
        this.stopAction();
        this._initDraw();
    }

    this._markPOI = function(callback){
        this.map.off('click');
        this.tooltip = 'Click on the map to choose location';
        this.map.on('click', L.bind(function(e){
            this.stopAction();
            $rootScope.$digest();
            callback(e.latlng);
        }, this));
    };

    this._initDraw = function(){
        this.tooltip = 'Click on the map to start editing';
        this.editing = L.polyline([]).addTo(this.map);
        this.circle = null;
        var latlngs = this.editing.getLatLngs();
        var that = this;

        this.map.on('click', function(e){
            if(latlngs.length > 0 && e.latlng.distanceTo(latlngs[latlngs.length-1]) > 500) return;
            that.editing.addLatLng(e.latlng);
            that.editing.redraw();

            if(!that.circle){
                that.circle = L.circle(latlngs[latlngs.length-1], 500, {weight: 1, color: 'green'}).addTo(that.map);
                $rootScope.$apply(function(){
                    that.tooltip = '<p>Click inside the <strong class="yellow-text">circle</strong> to add a point.</p> \
                        <p>Press <strong class="green-text">submit</strong> to finish editing</p> \
                        <p>Press <strong class="red-text">Cancel</strong> to cancel the edition</p>';
                });
            } else {
                that.circle.setLatLng(latlngs[latlngs.length-1])
                that.circle.redraw();
            }
        });
    }

    this.stopAction = function(){
        this.tooltip = null;
        this.map.off('click');
        if(this.circle)
            this.map.removeLayer(this.circle);
            this.circle = null;
        if(this.editing)
            this.map.removeLayer(this.editing);
            this.editing = null;
    };

    this.finishDraw = function(){
        var result = this.editing;
        this.stopAction();
        if(result.getLatLngs().length > 1)
            return result;
        return null;
    };
});

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

angular.module('sorelcomApp').service('Editor', function Editor(API, Map){
  var that = this;

  
});
