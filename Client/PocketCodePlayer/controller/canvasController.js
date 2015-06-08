/// <reference path="../core.js" />
'use strict';

PocketCode.CanvasController = (function () {
    CanvasController.extends(PocketCode.Mvc.CoreController, false);

    function CanvasController(sprites) {
        this._view = new PocketCode.Ui.PlayerViewport(300,300);
        this._renderingItems = [];

        for (var i = 0; i < sprites.length; i++)
        {
            var sprite = sprites[i];
            var ritem = new PocketCode.RenderingItem(sprite._currentLook,{
                name: sprite.name,
                id: sprite.id,
                top: sprite._positionX,
                left: sprite._positionY,
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

        for (var i = 1; i < 300; i++)
        {
            var color = '#'+Math.floor(Math.random()*16777215).toString(16);
            this._renderingItems.push(new fabric.Circle({stroke:'',opacity:0.5, selectable:false, radius: Math.random()*15, fill: color, top: Math.random()*450, left: Math.random()*300 }));
        }

        this._view.fabricCanvas.renderAll();

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
        }


    });

    return CanvasController;
})();
