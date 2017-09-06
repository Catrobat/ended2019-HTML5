'use strict';

PocketCode.View.EventBrick = (function () {
    EventBrick.extends(PocketCode.View.BaseBrick, false);

    function EventBrick(commentedOut, content) {
        PocketCode.View.BaseBrick.call(this, PocketCode.View.BrickType.EVENT, commentedOut, content, true);

        this._bricks = new SmartJs.Ui.HtmlTag('ul');//, { className: '' });
        this._appendChild(this._bricks);
        this._createAndAppend(content.endContent);
    }

    //properties
    Object.defineProperties(EventBrick.prototype, {
        isExecuting: {
            set: function (value) {
                //TODO: add highlighting to script block
            },
        },
    });

    //methods
    EventBrick.prototype.merge({
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

    return EventBrick;
})();
