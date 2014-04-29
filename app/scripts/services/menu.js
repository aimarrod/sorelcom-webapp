angular.module('sorelcomApp')
  .service('Menu', function Menu(Track, Note, POI) {
  	
    this.menu = [{
		  'title':'Tracks',
		  'resource':Track,
      'icon':'user'
	  }, {
      	'title':'Points of interest',
      	'resource':POI,
      	'icon':'map-marker'
    }, {
      	'title':'Notes',
      	'resource':Note,
      	'icon':'tags'
    }];

    this.active = this.menu[0];

    this.activate = function(index){
    		if(index < this.menu.length && index >= 0)
	    		active = this.menu[index]
    }

    this.list = function(){
    		return this.active.resource.query();
    }
    
    this.next = function(){
      var index = this.menu.indexOf(this.active);
      this.active = this.menu[(index + 1) % menu.length];
    }
    	
    this.isActive = function(entry){
    	return entry === this.active;
  	}
    	
    this.getResource = function(){
    	return this.active.resource;
    }
  });
