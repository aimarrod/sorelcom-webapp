
L.Control.Draw.Load = L.Control.extend({
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
      'load': options.load,
      'save': options.save,           //callback function
      'maxWidth': options.maxWidth || 70, 
      'hidden': false,
      'loadIcon': options.loadIcon,
      'saveIcon': options.saveIcon
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

    var toolbar = L.DomUtil.create('div', 'leaflet-bar', this._container);    
    var topButton = L.DomUtil.create('a', 'icon fa fa-'+button.loadIcon, toolbar);
    topButton.title = "Load one resource";
    var bottomButton = L.DomUtil.create('a', 'icon fa fa-'+button.saveIcon, toolbar);
    bottomButton.title = "Save changes";
 
    L.DomEvent
      .addListener(topButton, 'click', L.DomEvent.stop)
      .addListener(topButton, 'click', button.load, this)
    L.DomEvent.disableClickPropagation(topButton);
    
    L.DomEvent
      .addListener(bottomButton, 'click', L.DomEvent.stop)
      .addListener(bottomButton, 'click', button.save, this)
    L.DomEvent.disableClickPropagation(bottomButton);

    return toolbar;
  },
  
  _clicked: function () {  //'this' refers to button

  }
 
});