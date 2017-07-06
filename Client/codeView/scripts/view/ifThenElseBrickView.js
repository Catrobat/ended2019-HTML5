'use strict';

/**
 * Created by alexandra on 25.06.17.
 */
/**
 * Created by alexandra on 25.06.17.
 */
PocketCode.View.IfThenElseBrickView = (function(){
    IfThenElseBrickView.extends(PocketCode.View.BaseBrick, false);

    function IfThenElseBrickView(commentedOut, elseVisible, content) {
        PocketCode.View.BaseBrick.call(this, PocketCode.View.BrickType.CONTROL, commentedOut, content);  //todo content -> only content

        this._elseVisible = elseVisible || true;

        this._addContent(content);

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
        _addContent: function (content) {

            this._ifBricks = new SmartJs.Ui.Control('ul', {className: ''});
            this._elseBricks = new SmartJs.Ui.Control('ul', {className: ''});

            for (var key in content) {
                if(key != 'content') {
                    PocketCode.View.BaseBrick._createAndAppend(content[key], this); //todo param parent
                }
            }

            this._insertAt(1, this._ifBricks);
            this._insertAt(3, this._elseBricks);
        }
    });

    return IfThenElseBrickView;
});