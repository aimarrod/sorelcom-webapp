L.Control.Editor = L.Control.extend({});

L.Control.Editor.Selector = L.Control.extend({
  options: {
    position: 'bottomright'
  },
  initialize: function (options) {
    this._button = {};
    this.setControls(options);
  },
 
  onAdd: function (map) {
    this._map = map;
    this._container = L.DomUtil.create('div', '');
    this._addControlButtons();
    this._panel = L.DomUtil.create('div','leaflet-control-panel', this._container);
    this._panel.appendChild(this._panelContent[0]);
    L.DomEvent.disableClickPropagation(this._panel);


    return this._container;
  },
 
  onRemove: function (map) {
  },
 
  setControls: function (options) {
    this._next = options.next;
    this._prev = options.prev;
    this._panelContent = options.panelContent;
  },
  
  destroy: function () {
  	this._update();
  },

  addElement: function(key, element){
    this._makeButton(key);
  },

  _update: function () {
    if (!this._map) {
      return;
    } 
  },

  _addControlButtons: function(){
    this._toolbar = L.DomUtil.create('div', 'leaflet-control', this._container);
    this._arrows = L.DomUtil.create('div','leaflet-bar', this._toolbar);
    this._edit = L.DomUtil.create('div','leaflet-bar voffset3', this._toolbar);
    
    var upBtn = L.DomUtil.create('a', 'icon fa fa-chevron-up', this._arrows);
    var downBtn = L.DomUtil.create('a', 'icon fa fa-chevron-down', this._arrows);
    var editBtn = L.DomUtil.create('a', 'icon fa fa-edit', this._edit);

    
    L.DomEvent
      .addListener(upBtn, 'click', L.DomEvent.stop)
      .addListener(upBtn, 'click', this._next, this)
    L.DomEvent.disableClickPropagation(upBtn);


    L.DomEvent
      .addListener(downBtn, 'click', L.DomEvent.stop)
      .addListener(downBtn, 'click', this._prev, this)
    L.DomEvent.disableClickPropagation(downBtn);

    L.DomEvent
      .addListener(downBtn, 'click', L.DomEvent.stop)
      .addListener(downBtn, 'click', this._prev, this)
    L.DomEvent.disableClickPropagation(downBtn);
  },
  
  _clicked: function () {  //'this' refers to button

  }
 
});