angular.module('sorelcomApp').service('Map', function Map(API){
    var that = this;

    this.state = {
      sidebarOpen: false,
      showButtons: false
    };

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

});
