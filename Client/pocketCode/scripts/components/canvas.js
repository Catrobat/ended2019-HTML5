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
			if(sprite._layer > this.sprites.length){
				this.sprites[sprite._layer] = sprite;
			} else {
				this.sprites.splice(sprite._layer,0,sprite);
				this._addaptLayerAttr();
			}
		}, 
		
		overwriteSprite(sprite){
			this.sprites[sprite._layer] = sprite;
		},
		
		clickedSprite: function(sprite){
			console.log(sprite.get('id'), sprite.get('name'), sprite._originalElement.id, sprite._originalElement.name);
			//TODO
		},
		
		getSpriteById: function(id){
			for(var i = 0; i < this.sprites.length; i++){
				if(this.sprites[i].id == id){
					return this.sprites[i];
				}
			}
		},
		
		updateLayers: function(id, newLayer){
			var spriteOpts = this.getSpriteById(id);
			
			//remove element at old index
			this.sprites.splice(spriteOpts._layer,1);
			
			//insert element at new index)
			spriteOpts._layer = newLayer;
			this.sprites.splice(newLayer,0,spriteOpts);
			this._addaptLayerAttr();
			
		},
		
		_addaptLayerAttr: function(){
			for(var i=0; i<this.sprites.length; i++){
				if(this.sprites[i]._layer != i){
					this.sprites[i]._layer = i;
				}
			} 
		},
		
		getSpriteOnCanvas: function(id){
			// find Sprite on Canvas
			var drawnSprites = this._canvas.getObjects();
			
			for(var i = 0; i<drawnSprites.length; i++){
				if(drawnSprites[i].get('id') == id){
					return drawnSprites[i];
				}
			}
		},
		
		//expected: {id: xxx, changes: [{ property: xxx, value: xxx}]}
		renderSpriteChange: function(renderingItem){
			var spriteOnCanvas = this.getSpriteOnCanvas(renderingItem.id);
			var spriteInList = this.getSpriteById(renderingItem.id);
			var properties2set = [];
			for(var i = 0; i < renderingItem.changes.length; i++){
				
				switch (renderingItem.changes[i].property){
					case "_positionX": 
						spriteInList._positionX = renderingItem.changes[i].value;
						break;
					case "_positionY":
						spriteInList._positionY = renderingItem.changes[i].value;
						break;
					case "_direction":
						spriteInList._direction = renderingItem.changes[i].value;
						break;
					case "_transparency":
						spriteInList._transparency = renderingItem.changes[i].value;
						break;
					case "_visible":
						spriteInList._visible = renderingItem.changes[i].value;
						break;
					case "_brightness":
						//TODO
						break;
					case "_layer":
						this.updateLayers(renderingItem.id, renderingItem.changes[i].value);
						break;
				}
			}
			
			this.render();
			this.overwriteSprite(spriteInList);
			
		},
		
		render: function(){
			this._canvas.clear();
			for (var i=0; i< this.sprites.length; i++){
				
				var currentLook = new Sprite(this.sprites[i]._currentLook,{
					centeredRotation: true,
					centeredsize: true,
					perPixelTargetFind: true,
					
					//coordinates have to be adapted either here or at another level
					top: this.sprites[i]._positionX,
					left: this.sprites[i]._positionY,
					
					angle:this.sprites[i]._direction - 90,
					opacity: +(1 - this.sprites[i]._transparency / 100).toFixed(2),
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