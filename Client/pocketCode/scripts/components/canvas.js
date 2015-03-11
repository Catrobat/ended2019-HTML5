﻿﻿/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
'use strict';

PocketCode.Canvas = (function(){
	function Canvas(htmlCanvasId, zoomfactor){
		this._canvas = new fabric.Canvas(htmlCanvasId);
		
		this._zoomfactor = zoomfactor;
		this.sprites = [];
        this._onSpriteClicked = new SmartJs.Event.Event(this);

        //add listener to element selected event
        var _self = this;
        this._canvas.on('object:selected', function(e) {
//			  this.clickedSprite.bind(this, e.target);
        	_self._onSpriteClicked.dispatchEvent({id: e.target.id});
        });
	}
	
	 Object.defineProperties(Canvas.prototype, {
	    	canvas: {
	            get: function () {
	                return this._canvas;
	            },
	        },
	        zoomfactor: {
	            get: function () {
	                return this._zoomfactor;
	            },
	        },
	    });
	 
	 Object.defineProperties(Canvas.prototype, {
	        onSpriteClicked: {
	            get: function () { return this._onSpriteClicked; },
	            //enumerable: false,
	            //configurable: true,
	        },
	 });
	
	Canvas.prototype.merge({
		
		addSprite: function(sprite){
			this.sprites[sprite._layer] = sprite;
		}, 
		
		clickedSprite: function(sprite){
			console.log(sprite.get('id'), sprite.get('name'), sprite._originalElement.id, sprite._originalElement.name);
			//TODO
		},
		
		//TODO - need to be tested
		getSpriteByID: function(id, layer){
			if (this.sprites[_layer].id == id){
				return this.sprites[layer];
			} else {
				for(var i = 0; i < this.sprites.length; i++){
					if(this.sprites[i].id == id){
						return this.sprites[i];
					}
				}
			}
		},
		
		updateLayers: function(renderingItem){
			var spriteOpts = this.getSpriteByID(renderingItem.id, renderingItem.layer);
			
			//remove element at old index
			this.sprites.splice(spriteOpts.layer,1);
			
			//insert element at new index)
			spriteOpts.layer = renderingItem.layer;
			this.sprites.splice(renderingItem.layer,0,spriteOpts);
			
		},
		
		//renderingItem might not be used - properties are always form of a list
		renderSpriteChange: function(renderingItem){
			
			var drawnSprits = this._canvas.getObjects();
			var sprite2Change = null;
			
			for(var i = 0; i<drawnSprites.size(); i++){
				if(drawnSprites[i].get('id') == renderingItem.id){
					sprite2Change = drawnSprites[i];
				}
			}
			
			if(renderingItem.property == 'layer'){
				this.updateLayers();
			} else {
				sprite2Change.set(renderingItem.property, renderingItem.value);
			}
			
			this._canvas.renderAll();
		},
		
		render: function(){
			this._canvas.clear();
			for (var i=0; i< this.sprites.length; i++){
				
				var currentLook = new Sprite(this.sprites[i]._currentLook,{
					centeredRotation: true,
					centeredsize: true,
					perPixelTargetFind: true,
					top: this.sprites[i]._positionX,
					left: this.sprites[i]._positionY,
					angle:this.sprites[i]._direction,
//					flipX: this.sprites[i]._flipH,
//					flipY: this.sprites[i]._flipV,
					opacity: this.sprites[i]._transparency/100,
//					opacity: 1,
					visible: this.sprites[i]._visible,
					originX: "center",
					originY: "center",
					name: this.sprites[i].name,
					id: this.sprites[i].id,
				});
				
				currentLook.scale(this.sprites[i]._size/100*this._zoomfactor);
				
				//TODO
//				currentLook.filters.push(new fabric.Image.filters.Brightness({brightness: this.sprites[i]._brightness}));
				currentLook.filters.push(new fabric.Image.filters.Brightness({brightness: 1}));
				currentLook.applyFilters(this._canvas.renderAll.bind(this._canvas));
				
				currentLook._originalElement.id = this.sprites[i].id;
				currentLook._originalElement.name = this.sprites[i].name;
				
				this._canvas.add(currentLook);
			}
		},
		
		glideTo: function(layer,xPos, yPos, dur){
			this._canvas.getObjects()[layer].animate({left: xPos, top: yPos}, {
			      duration: dur,
			      onChange: this._canvas.renderAll.bind(this._canvas),
			      });
		},
		
		setZoomfactor: function(zoomfactor){
			this._zoomfactor = zoomfactor;
		}
		
	});
	
	return Canvas;
})();


var Sprite = fabric.util.createClass(fabric.Image, {
	type: 'sprite',

	initialize: function(element, options) {
	    options || (options = { });
	
	    this.callSuper('initialize', element, options);
	    this.set('id', options.id || '');
	    this.set('name', options.name || '');
	  },
	  
	  toObject: function() {
		    return fabric.util.object.extend(this.callSuper('toObject'), {
		      id: this.get('id'),
		      name: this.get('name'),
		    });
		  },

	  _render: function(ctx) {
		    this.callSuper('_render', ctx);
	  }, 
	  	  
	});