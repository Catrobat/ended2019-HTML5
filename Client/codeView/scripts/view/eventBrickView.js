
PocketCode.View.EventBrickView = (function(){
    EventBrickView.extends(PocketCode.View.BaseBrick, false);

    function EventBrickView(commentedOut) {
        PocketCode.View.BaseBrick.call(this, PocketCode.View.BrickType.EVENT, commentedOut);

        this._bricks = new SmartJs.Ui.Control('ul', {className: ''});
        this._appendChild(this._bricks);
        this._redraw(); //commentedOut or Indent
    }

//properties
    Object.defineProperties(EventBrickView.prototype, {
    });

//methods
    EventBrickView.prototype.merge({
        /* override */
        _drawBackground: function() {
            //use: brickTpe, commentedOut, ...
        },
        _redraw: function() {
            //
        },
    });

    return EventBrickView;
});