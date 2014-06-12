angular.module('sorelcomApp').service('Editor', function Editor($rootScope, API, Map, Tooltip, Modal){
  var that = this;

  that.markPOI = function(){
    that.stopTask();

    Tooltip.setText('Click on the map to choose location');
    Map.map.on('click', function(e){
      that.stopTask();
      Modal.create(L.marker(e.latlng).toGeoJSON());
    });
  };

  that.startDraw = function(){
    that.stopTask();

    Tooltip.setText('Click on the map to start editing');
    Map.state.showButtons = true;

    var editor = L.Polyline.PolylineEditor([[45.2750072361, 13.7187695503],[45.2750072361, 13.7187695503]], {maxMarkers: 100});
    that.editing = L.polyline([]).addTo(Map.map);
    var latlngs = that.editing.getLatLngs();

    Map.map.on('click', function(e){
      //Cannot allow to input too separated points on a route
      if(latlngs.length > 0 && e.latlng.distanceTo(latlngs[latlngs.length-1]) > 500) return;
      that.editing.addLatLng(e.latlng);
      that.editing.redraw();
      if(!that.circle){
        that.circle = L.circle(latlngs[latlngs.length-1], 500, {weight: 1, color: 'green'}).addTo(Map.map);
        Tooltip.setText('<p>Click inside the <strong class="yellow-text">circle</strong> to add a point.</p> \
          <p>Press <strong class="green-text">submit</strong> to finish editing</p> \
          <p>Press <strong class="red-text">Cancel</strong> to cancel the edition</p>');
      } else {
        that.circle.setLatLng(latlngs[latlngs.length-1])
        that.circle.redraw();
      }
    });
  };

  this.startEdit = function(geojson) {
    that.editing = L.Polyline.PolylineEditor(L.GeoJSON.coordsToLatLngs(geojson.geometry.coordinates), {maxMarkers: 500});
    that.editing.addTo(Map.map);
    Map.map.fitBounds(that.editing.getBounds());
    Map.state.showButtons = true;
  };

  this.stopTask = function(){
    Tooltip.clear();
    Map.map.off('click');
    Map.state.showButtons = false;
    if(that.circle){
      Map.map.removeLayer(that.circle);
      that.circle = null;
    }
    if(that.editing){
      if(that.editing._markers) /** Remove editable polyline */
        that.editing.removeFrom(Map.map);
      else /** Remove regular polyline */
        Map.map.removeLayer(that.editing);
      that.editing = null;
    }
  };

  this.startJoin = function(){

  };

  this.finishTask = function(){
    var result = that.editing;
    that.stopTask();
    if(result.getLatLngs().length > 1)
      return result;
    return null;
  };
});
