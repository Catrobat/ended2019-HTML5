/// <reference path="../core.js" />
'use strict';

PocketCode.CanvasController = (function () {
    PlayerPageController.extends(PocketCode.Mvc.CoreController, false);

    function CanvasController() {
        this._view = new PocketCode.Ui.PlayerViewport(300,300);
        this._renderingItems = [];
        for (var i = 1; i < 300; i++)
        {
            var color = '#'+Math.floor(Math.random()*16777215).toString(16);
            this._renderingItems.push(new fabric.Circle({stroke:'',opacity:0.5, selectable:false, radius: Math.random()*15, fill: color, top: Math.random()*450, left: Math.random()*300 }));
        }
    }


    //properties
    Object.defineProperties(CanvasController.prototype, {
        axisVisible: {
            get: function () {
                return this._axesVisible;
            }
            //enumerable: false,
            //configurable: true,
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
    });

    // methods
    CanvasController.prototype.merge({
        render: function() {

        },

        downloadCanvas: function(scale) {
            this._view.fabricCanvas.toDataURL({multiplier:scale});
        }


    });

    return CanvasController;
})();
