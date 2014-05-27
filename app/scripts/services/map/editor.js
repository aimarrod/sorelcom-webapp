angular.module('sorelcomApp').service('Editor', function Editor(API, Map){
  var that = this;

  this.markPOI = function(callback){
    this.stopAction();
    this.map.off('click');
    this.tooltip = 'Click on the map to choose location';
    this.map.on('click', L.bind(function(e){
      this.stopAction();
      $rootScope.$digest();
      callback(e.latlng);
    }, this));
  };

  this.startDraw = function(){
    this.stopAction();

    Map.tooltip = 'Click on the map to start editing';
    this.editing = L.polyline([]).addTo(this.map);
    this.circle = null;
    var latlngs = this.editing.getLatLngs();
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
    if(this.circle){
      this.map.removeLayer(this.circle);
      this.circle = null;
    }
    if(this.editing){
      this.map.removeLayer(this.editing);
      this.editing = null;
    }
  };

  this.startEdit = function(){

  };

  this.startJoin = function(){


  };



  this.finishDraw = function(){
    var result = this.editing;
    this.stopAction();
    if(result.getLatLngs().length > 1)
      return result;
    return null;
  };

  this.finishEdit = function(){

  };
});
