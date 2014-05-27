angular.module('sorelcomApp').service('Tooltip', function Tooltip($rootScope){

  this.setText = function(text){
    this.text = text;
    if(!$rootScope.$$phase) {
      $rootScope.$digest();
    }
  };

  this.clear = function(){
    this.text = null;
    if(!$rootScope.$$phase) {
      $rootScope.$digest();
    }
  };
  
});
