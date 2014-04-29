angular.module('sorelcomApp').service('SharedMap', function SharedMap(Track, Note, POI){
    this.initMap = function initMap(id){

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
    }

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
    }
});
