﻿﻿/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
'use strict';

PocketCode.Canvas = (function(){
	function Canvas(htmlCanvasId, zoomfactor){
		this._canvas = new fabric.Canvas(htmlCanvasId, {selection: false, skipTargetFind: false, renderOnAddRemove: false, stateful: false});
		
		this._zoomfactor = zoomfactor;
        this._onSpriteClicked = new SmartJs.Event.Event(this);
        this._showAxes = false;

        //add listener to element selected event
        var _self = this;
        this._canvas.on('mouse:down', function(e) {
        	if(typeof e.target != 'undefined'){
        		console.log(e.target.id);
        		_self._onSpriteClicked.dispatchEvent({id: e.target.id});
        	}
        });
        
        this._canvas.on('after:render', function(e) {
        	if(_self._showAxes){
        		_self._drawAxes();
        	}
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
	        showAxes: {
	        	get: function() {
	        		return this._showAxes;
	        	},
	        	set: function(flag){
	        		this._showAxes = flag;
	        		this.render();
	        	}
	        }
	    });
	 
	 Object.defineProperties(Canvas.prototype, {
	        onSpriteClicked: {
	            get: function () { return this._onSpriteClicked; },
	        },
	 });
	
	Canvas.prototype.merge({
		
		/**
		 * adds a pocket code sprite to the canvas 
		 * note: sprite will not be rendered - if requested call render() after this method
		 * @param {PocketCode.Model.Sprite} pcSprite 
		 */
		addSprite: function(pcSprite){
			var sprites = this._canvas.getObjects();
			
			// is new sprite on top of all other elements
			if(pcSprite._layer >= sprites.length){
				this._canvas.add(this._createCanvasSprite(pcSprite));
			} else {
				sprites.splice(pcSprite._layer,0,this._createCanvasSprite(pcSprite));
			}
		}, 
		
		/**
		 * updates the layer of the sprites on the canvas  
		 * @param {int} id: id of the sprite that shall change its layer
		 * @param {int} newLayer: integer of the new layer of the respective sprite 
		 */
		_updateLayers: function(id, newLayer){
			
			var sprite2change = this._getSpriteOnCanvas(id);
			var sprites = this._canvas.getObjects();
			
			//remove element at old index
			sprites.splice(sprites.indexOf(sprite2change),1);
			
			//insert element at new index)
			sprites.splice(newLayer,0,sprite2change);
			
		},
		
		
		/**
		 * finds the respective sprite on the canvas via its id  
		 * @param {int} id: id of the sprite to find 
		 */
		_getSpriteOnCanvas: function(id){
			var drawnSprites = this._canvas.getObjects();
			
			for(var i = 0; i<drawnSprites.length; i++){
				if(drawnSprites[i].get('id') == id){
					return drawnSprites[i];
				}
			}
		},
		
		/**
		 * will be called when a change to a sprite should be made on the canvas
		 * expects an object in the format of {id: {int}, changes: [{ property: {String}, value: {float}]}
		 * @param {object} renderingItem: has to be in the format of {id: {int}, changes: [{ property: {String}, value: {float}]}
		 */
		renderSpriteChange: function(renderingItem){
			var spriteOnCanvas = this._getSpriteOnCanvas(renderingItem.id);
			for(var i = 0; i < renderingItem.changes.length; i++){
				
				switch (renderingItem.changes[i].property){
					case "_positionX": 
						spriteOnCanvas.setTop(renderingItem.changes[i].value);
						break;
					case "_positionY":
						spriteOnCanvas.setLeft(renderingItem.changes[i].value);
						break;
					case "_direction":
						spriteOnCanvas.setAngle(renderingItem.changes[i].value);
						break;
					case "_transparency":
						spriteOnCanvas.setOpacity(renderingItem.changes[i].value);
						break;
					case "_visible":
						spriteOnCanvas.setVisible(renderingItem.changes[i].value);
						break;
					case "_brightness":
						spriteOnCanvas.applyBrightness(renderingItem.changes[i].value);
						break;
					case "_layer":
						this._updateLayers(renderingItem.id, renderingItem.changes[i].value);
						break;
				}
			}
			this._canvas.renderAll();
		},
		
		/**
		 * creates a new object of type CanvasSprite which extends fabric.js's Image Class. This object can then be added to a fabric.js Canvas  
		 * @param {PocketCode.Model.Sprite} pcSprite: sprite that shall be converted into an object that can be added to the canvas 
		 */
		_createCanvasSprite: function(pcSprite){
			var sprite = new CanvasSprite(pcSprite._currentLook,{
				name: pcSprite.name,
				id: pcSprite.id,
				top: pcSprite._positionX,
				left: pcSprite._positionY,
				visible: pcSprite._visible,
				angle: pcSprite._direction,
				opacity: pcSprite._transparency,
			});
			
			sprite.scale(pcSprite._size/100*this._zoomfactor);
			
			if(pcSprite._brightness != 100){
				sprite.applyBrightness(pcSprite._brightness);
			}
			
			return sprite;
		},
		
		/**
		 * renders the canvas
		 */
		render: function(){
			this._canvas.renderAll();
		},
		
		/**
		 * sets the zoomfactor
		 * @param {float} zoomfactor
		 */
		setZoomfactor: function(zoomfactor){
			this._zoomfactor = zoomfactor;
		},
		
		/**
		 * draws axes on the canvas
		 */
		_drawAxes: function(){
			this._canvas.getContext('2d').moveTo(this._canvas.getWidth()/2, 0);
			this._canvas.getContext('2d').lineTo(this._canvas.getWidth()/2, this._canvas.getHeight());
			
			this._canvas.getContext('2d').moveTo(0, this._canvas.getHeight()/2);
			this._canvas.getContext('2d').lineTo(this._canvas.getWidth(), this._canvas.getHeight()/2);
		    
			this._canvas.getContext('2d').strokeStyle = "#ff0000";
			this._canvas.getContext('2d').lineWidth = 5;
			
			
			this._canvas.getContext('2d').font="15px Arial";
			this._canvas.getContext('2d').fillStyle= "#ff0000";
			//center
			this._canvas.getContext('2d').fillText("0",this._canvas.getWidth()/2 + 10,this._canvas.getHeight()/2 +15);
			//width
			this._canvas.getContext('2d').fillText("-" + this._canvas.getWidth()/2, 5 ,this._canvas.getHeight()/2 +15);
			this._canvas.getContext('2d').fillText(this._canvas.getWidth()/2,this._canvas.getWidth() - 25,this._canvas.getHeight()/2 +15);
			//height
			this._canvas.getContext('2d').fillText("-" + this._canvas.getHeight()/2,this._canvas.getWidth()/2 +10, 15);
			this._canvas.getContext('2d').fillText(this._canvas.getHeight()/2,this._canvas.getWidth()/2 + 10 ,this._canvas.getHeight() -5);
			
			this._canvas.getContext('2d').stroke();
		}
		
	});
	
	return Canvas;
})();


var CanvasSprite = fabric.util.createClass(fabric.Image, {
	type: 'sprite',

	initialize: function(element, options) {
	    options || (options = { });
	
	    this.callSuper('initialize', element, options);
	    
	    this.set({
	    	id: options.id,
	    	name: options.name,
	    	
		    perPixelTargetFind: true,
			selectable: false,
			hasControls: false, 
			hasBorders: false,
			hasRotatingPoint: false,
			originX: "center",
			originY: "center",
	    });
	    
	    this.setAngle(options.angle);
	    this.setOpacity(options.opacity);
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
	  
	 setAngle: function(direction){
	  		this.angle = direction - 90;
	 },
	 
	 setOpacity: function(transparency){
		  		this.opacity = +(1 - transparency / 100).toFixed(2);
	 },
	  
	 applyBrightness: function(brightness){
		var bright = +((255/100)*(brightness - 100)).toFixed(0);
		var brightnessFilter = new fabric.Image.filters.Brightness({brightness: bright});
		 
		var overwriteFilter = false;
		for (var i = 0; i < this.filters.length; i++){
	 		if (this.filters[i].type == "Brightness"){
	 			this.filters[i] = brightnessFilter;
	 			overwriteFilter = true;
	 		}
	 	}
		 
		if (!overwriteFilter)
			 this.filters.push(brightnessFilter);
				
		var replacement = fabric.util.createImage();
		var imgEl = this._originalElement;
		var canvasEl = fabric.util.createCanvasElement();
		var  _this = this;
		      
		canvasEl.width = imgEl.width;
		canvasEl.height = imgEl.height;
		canvasEl.getContext('2d').drawImage(imgEl, 0, 0, imgEl.width, imgEl.height);
			
			
		brightnessFilter.applyTo(canvasEl);
		
		replacement.width = canvasEl.width;
		replacement.height = canvasEl.height;
		
		_this._element = replacement;
		_this._filteredEl = replacement;
		replacement.src = canvasEl.toDataURL('image/png');
				
	},
	  	  
});