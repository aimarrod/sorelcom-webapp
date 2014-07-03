angular.module('sorelcomApp').service('Modal', function Modal($modal){

  this.importGPX = function(){
    var modal = $modal.open({
      templateUrl: 'partials/modals/import.html',
      controller: 'GPXLoadCtrl',
    });
    return modal.result;
  };

  this.loadGPX = function(){
    var modal = $modal.open({
      templateUrl: 'partials/modals/load.html',
      controller: 'GPXLoadCtrl',
    });
    return modal.result;
  };

  this.selectTrack = function(geojson){
    var modal = $modal.open({
      templateUrl: 'partials/modals/select_track.html',
      controller: 'SelectTrackCtrl',
    });
    return modal.result;
  };

  this.create = function(geojson){
    var modal = $modal.open({
        templateUrl: 'partials/modals/create.html',
        controller: 'CreateModalCtrl',
        resolve: { geojson: function () { return geojson; } }
    });
    return modal.result;
  };

  this.chooseImportMode = function(){
    var modal = $modal.open({
      templateUrl: 'partials/modals/choose.html',
      controller: 'ChooseCtrl',
    });
    return modal.result;
  };

  this.login = function(){
    var modal = $modal.open({
      templateUrl: 'partials/modals/login.html',
      controller: 'LoginCtrl',
    });
    return modal.result;
  }

});
