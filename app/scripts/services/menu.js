angular.module('sorelcomApp')
  .factory('Menu', function Auth(Track, Note, POI) {
  	var menu = 	[{
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

    var active = menu[0];

    return {
    	activate: function(index){
    		if(index < menu.length && index >= 0)
	    		active = menu[index]
    	},
    	list: function(){
    		return active.resource.query();
    	},
    	menu: function(){
    		return menu;
    	},
    	isActive: function(entry){
    		return entry===active;
    	},
    	getResource: function(){
    		return active.resource;
    	}
    }
  });
