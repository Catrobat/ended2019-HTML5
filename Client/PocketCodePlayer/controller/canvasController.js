/// <reference path="../core.js" />
'use strict';

PocketCode.CanvasController = (function () {
    CanvasController.extends(PocketCode.Mvc.CoreController, false);

    function CanvasController(ge) {
        this._view = new PocketCode.Ui.PlayerViewport(300, 300);
        this._renderingItems = [];
        this._initialized = false;
        ge.onSpriteChange.addEventListener(new SmartJs.Event.EventListener(this._spriteChanged, this));
        this._backgroundOffset = ge.backgroundOffset;
    }

    //properties
    Object.defineProperties(CanvasController.prototype, {
        axisVisible: {
            get: function () {
                return this._axesVisible;
            }
            //enumerable: false,
            //configurable: true,
        },
        renderingItems :
        {
            set: function(sprites) {
                if (!(sprites instanceof Array))
                    throw new SmartJs.Error.InvalidArgumentException(sprites, Array);
                // clear all sprites , then create
                this.clearCanvas();
                this._renderingItems = sprites;
            },

            get: function() {
                return this._renderingItems;
            }
        },
        view :
        {
            get: function() {
                return this._view;
            }
        },
        initialized: {
            get: function () {
                return this._initialized;
            }
            //enumerable: false,
            //configurable: true,
        },

    });

    // events
    Object.defineProperties(CanvasController.prototype, {
        onResize: {
            get: function () {
                console.log('onres');
                return this._onResize;
            }
        },
        //enumerable: false,
        //configurable: true,
        onRotate: {
            get: function () {
                console.log('onrotate');
                return this._onResize;
            }
        },
        //enumerable: false,
        //configurable: true,
        onSpriteChange: {
            get: function () {
                console.log('onspritechange');
                return this._onResize;
            }
        },
        onSpriteClicked: {
            get: function() {
                return this._view.onSpriteClicked;
            }
        }
        //enumerable: false,
        //configurable: true,
    });

    // methods
    CanvasController.prototype.merge({

        _spriteChanged: function(e) {
            if (!this._initialized)
                return;

            if (e.properties == undefined)
            return;

            if ('layer' in e.properties) {
                // TODO REFRESH RENDERING ITEMS
                var ritem = this._getSpriteOnCanvas(e.id);
                var idx = this._renderingItems.indexOf(ritem);
                var new_idx = 0;
                var layer = e.properties['layer'];
                if (layer == idx) // TODO + offset
                    return;

                if (layer > this._renderingItems.length)
                    new_idx = this._renderingItems.length;
                else if (layer < this._renderingItems.length)
                    new_idx = 0;
                else
                    new_idx = layer;

                // TODO LAYER + offset
                this._renderingItems.splice(idx, 1);
                this._renderingItems.splice(new_idx, 0,ritem);
            }

            else {
                var sprite = this._getSpriteOnCanvas(e.id);
                if (sprite == undefined) {
                    console.log('sprite ', e.id, ' not found');
                    return;
                }

                for (var prop in e.properties) {
                    sprite[prop] = e.properties[prop];
                }

                this._view.render();
            }
        },

        _getSpriteOnCanvas: function(id){
            var drawnSprites = this._renderingItems;
            for(var i = 0; i < drawnSprites.length; i++){
                if(drawnSprites[i].get('id') == id){
                    return drawnSprites[i];
                }
            }
            return undefined;
        },

        _createRenderingItem: function(pcSprite) {
            var sprite = new PocketCode.RenderingItem(pcSprite._currentLook, {
                name: pcSprite.name,
                id: pcSprite.id,
                x: pcSprite._positionX,
                y: pcSprite._positionY,
                visible: true, //sprite._visible,
                angle: pcSprite._direction,
                opacity: pcSprite._transparency
                //width: 25,
                //height:25
            });
            sprite.scale(pcSprite._size/100*this._zoomfactor);
            return sprite;

        },

        downloadCanvas: function(scale) {
            return this._view.fabricCanvas.toDataURL({multiplier:scale});
        },

        // init method, should be called after resources are loaded to
        // add sprites to canvas and start rendering
        init: function (sprites) {
            for (var i = 0; i < sprites.length; i++)
            {
                var sprite = sprites[i];
                var item = this._createRenderingItem(sprite);
                // scale item size, otherwise original w x h
                item.width /= 10;
                item.height /= 10;

                this._renderingItems.push(item);
            }

            this._view.renderingObjects = this._renderingItems;
            this._initialized = true;
            this._view.render();
        },

        toggleAxes: function () {
            var v = this._view;
            var shown = v._axesVisible;
            if (shown)
                v.hideAxes();
            else
                v.showAxes();
        },

        clearCanvas: function () {
            this._renderingItems = [];
            this._view.clear();
        },

        /**
         * will be called when a change to a sprite should be made on the canvas
         * expects an object in the format of {id: {int}, changes: [{ property: {String}, value: {float}]}
         * @param {object} renderingItem: has to be in the format of {id: {int}, changes: [{ property: {String}, value: {float}]}
		 */
        /*
        renderSpriteChange: function(renderingItem){
            // changes are made directly to the item inside the list, so the
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
                    /*case "_layer":
                     this._updateLayers(renderingItem.id, renderingItem.changes[i].value);
                     break;
                }
            }
            this._view.render();
        }*/

    });

    return CanvasController;
})();
