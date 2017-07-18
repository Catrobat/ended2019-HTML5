'use strict';

PocketCode.Physics.Ui = {

    DebugCanvas: (function () {
        DebugCanvas.extends(PocketCode.Ui.Canvas, false);

        function DebugCanvas(args) {
            PocketCode.Ui.Canvas.call(this, args);

        }


        return DebugCanvas;
    })(),

};
