L.Control.Button = L.Control.extend({
  options: {
    position: 'topleft'
  },
  initialize: function (options) {
    this._button = {};
    this.setButton(options);
  },
 
  onAdd: function (map) {
    this._map = map;
    this._container = L.DomUtil.create('div', 'leaflet-control-button');
    
    this._update();
    return this._container;
  },
 
  onRemove: function (map) {
  },
 
  setButton: function (options) {
    var button = {
      'onClick': options.onClick,           //callback function
      'maxWidth': options.maxWidth || 70, 
      'hidden': false    //number
    };
 
    this._button = button;
    this._update();
  },
  
  destroy: function () {
  	this._button = {};
  	this._update();
  },
  
  
  _update: function () {
    if (!this._map) {
      return;
    }
 
    this._makeButton(this._button);
 
  },
 
  _makeButton: function (button) {
    var newButton = L.DomUtil.create('div', 'leaflet-bar', this._container);    
    this._icon = L.DomUtil.create('a', 'icon fa fa-chevron-left', newButton);

 
    L.DomEvent
      .addListener(newButton, 'click', L.DomEvent.stop)
      .addListener(newButton, 'click', button.onClick,this)
      .addListener(newButton, 'click', this._clicked,this);
    L.DomEvent.disableClickPropagation(newButton);
    return newButton;
  },
  
  _clicked: function () {  //'this' refers to button
    if(this._button.hidden){
      L.DomUtil.removeClass(this._icon, 'fa-chevron-right');
      L.DomUtil.addClass(this._icon, 'fa-chevron-left');
    } else {
      L.DomUtil.removeClass(this._icon, 'fa-chevron-left');
      L.DomUtil.addClass(this._icon, 'fa-chevron-right');
    }
    this._button.hidden = !this._button.hidden;
  }
 
});