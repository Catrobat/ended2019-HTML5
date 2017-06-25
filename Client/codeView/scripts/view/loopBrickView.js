/**
 * Created by alexandra on 25.06.17.
 */
/**
 * Created by alexandra on 25.06.17.
 */
PocketCode.View.LoopBrickView = (function(){
    LoopBrickView.extends(PocketCode.View.BaseBrick, false);

    function LoopBrickView(commentedOut) {
        PocketCode.View.BaseBrick.call(this, PocketCode.View.BrickType.CONTROL, commentedOut);

        this._bricks = new SmartJs.Ui.Control('ul', {className: ''});
        this._appendChild(this._bricks);
        this._redraw(); //commentedOut or Indent
    }

//properties
    Object.defineProperties(LoopBrickView.prototype, {
    });

//methods
    LoopBrickView.prototype.merge({
        /* override */
        _drawBackground: function() {
            //use: brickTpe, commentedOut, ...
        },
        _redraw: function() {
            //
        },
    });

    return LoopBrickView;
});