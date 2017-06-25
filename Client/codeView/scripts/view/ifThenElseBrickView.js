/**
 * Created by alexandra on 25.06.17.
 */
/**
 * Created by alexandra on 25.06.17.
 */
PocketCode.View.IfThenElseBrickView = (function(){
    IfThenElseBrickView.extends(PocketCode.View.BaseBrick, false);

    function IfThenElseBrickView(commentedOut, elseVisible) {
        PocketCode.View.BaseBrick.call(this, PocketCode.View.BrickType.CONTROL, commentedOut);

        this._elseVisible = elseVisible || true;
        this._ifBricks = new SmartJs.Ui.Control('ul', {className: ''});
        this._elseBricks = new SmartJs.Ui.Control('ul', {className: ''});

        this._appendChild(this._ifBricks);
        this._appendChild(this._elseBricks);
        this._redraw();
    }

//properties
    Object.defineProperties(IfThenElseBrickView.prototype, {
        elseVisible: {
            get: function () {
                return this._elseVisible;
            },
            set: function (bool) {
                this._elseVisible = bool;
                //TODO  redraw
            }
        }
    });

//methods
    IfThenElseBrickView.prototype.merge({
        /* override */
        _drawBackground: function() {
            //use: brickTpe, commentedOut, ...
        },
        _redraw: function() {
            //commentedOut or Indent, show elseBricks
        },
    });

    return IfThenElseBrickView;
});