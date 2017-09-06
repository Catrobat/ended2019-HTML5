'use strict';

/**
 * Created by alexandra on 25.06.17.
 */
/**
 * Created by alexandra on 25.06.17.
 */
PocketCode.View.LoopBrick = (function () {
    LoopBrick.extends(PocketCode.View.BaseBrick, false);

    function LoopBrick(commentedOut, content, isEndBrick) {
        PocketCode.View.BaseBrick.call(this, PocketCode.View.BrickType.CONTROL, commentedOut, content, isEndBrick);

        this._bricks = new SmartJs.Ui.HtmlTag('ul');//, { className: '' });
        this._appendChild(this._bricks);
        this._createAndAppend(content.endContent);
    }

    //properties
    Object.defineProperties(LoopBrick.prototype, {
    });

    //methods
    LoopBrick.prototype.merge({
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

    return LoopBrick;
})();
