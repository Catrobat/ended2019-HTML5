'use strict';

PocketCode.View.EventBrickView = (function () {
    EventBrickView.extends(PocketCode.View.BaseBrick, false);

    function EventBrickView(commentedOut, content) {
        PocketCode.View.BaseBrick.call(this, PocketCode.View.BrickType.EVENT, commentedOut, content, true);

        this._bricks = new SmartJs.Ui.Control('ul');//, { className: '' });
        this._appendChild(this._bricks);
        this._createAndAppend(content.endContent);
    }

    //properties
    Object.defineProperties(EventBrickView.prototype, {
        isExecuting: {
            set: function (value) {
                //TODO: add highlighting to script block
            },
        },
    });

    //methods
    EventBrickView.prototype.merge({
        /* override */
        _drawBackground: function () {
            PocketCode.View.BaseBrick.prototype._drawBackground.call(this); //TODO
            //use: brickTpe, commentedOut, ...
        },
        //_addContent: function (content) {

        //    this._bricks = new SmartJs.Ui.Control('ul', { className: '' });
        //    this._appendChild(this._bricks);

        //    this._createAndAppend(content.endContent);

        //},
    });

    return EventBrickView;
})();
