/// <reference path="../core.js" />
'use strict';

PocketCode.CanvasController = (function () {
    CanvasController.extends(PocketCode.Mvc.CoreController, false);

    function CanvasController() {
        this._view = new PocketCode.Ui.PlayerViewport(300,300);
        this._renderingItems = [];

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
        sprites :
        {
            set: function(sprites) {
                // TODO invalid arg exception if no array (instanceof)
                if (!(sprites instanceof Array))
                    throw new SmartJs.Error.InvalidArgumentException(sprites, Array);
                // clear all sprites , then create
            }
        }

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

        downloadCanvas: function(scale) {
            return this._view.fabricCanvas.toDataURL({multiplier:scale});
        },

        init: function (sprites) {
            for (var i = 0; i < sprites.length; i++)
            {
                var sprite = sprites[i];
                var ritem = new PocketCode.RenderingItem(sprite._currentLook,{
                    name: sprite.name,
                    id: sprite.id,
                    top: sprite._positionY,
                    left: sprite._positionX,
                    visible: true, //sprite._visible,
                    angle: sprite._direction,
                    opacity: sprite._transparency,
                    //width: 25,
                    //height:25
                });
                // change item size, otherwise original w x h
                ritem.width /= 10;
                ritem.height /= 10;

                this._renderingItems.push(ritem);
                //ritem.render(this._view._context);
                this._view.fabricCanvas.add(this._renderingItems[i]);
            }

            this._view.renderingObjects = this._renderingItems;
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
            this._view.renderingObjects = [];
            this._view.clear();
        }


    });

    return CanvasController;
})();
