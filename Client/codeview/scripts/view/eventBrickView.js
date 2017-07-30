'use strict';

PocketCode.View.EventBrickView = (function () {
    EventBrickView.extends(PocketCode.View.BaseBrick, false);

    function EventBrickView(commentedOut, content) {
        PocketCode.View.BaseBrick.call(this, PocketCode.View.BrickType.EVENT, commentedOut, content);

        this._addContent(content);

        this._redraw(); //commentedOut or Indent
    }

    //properties
    Object.defineProperties(EventBrickView.prototype, {
    });

    //methods
    EventBrickView.prototype.merge({
        /* override */
        _drawBackground: function () {
            //use: brickTpe, commentedOut, ...
        },
        _redraw: function () {
            //
        },
        _addContent: function (content) {

            this._bricks = new SmartJs.Ui.Control('ul', { className: '' });
            this._appendChild(this._bricks);

            this._createAndAppend(content.endContent);

        }
    });

    return EventBrickView;
})();
