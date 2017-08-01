'use strict';

/**
 * Created by alexandra on 25.06.17.
 */
/**
 * Created by alexandra on 25.06.17.
 */
PocketCode.View.IfThenElseBrickView = (function () {
    IfThenElseBrickView.extends(PocketCode.View.BaseBrick, false);

    function IfThenElseBrickView(commentedOut, elseVisible, content) {
        PocketCode.View.BaseBrick.call(this, PocketCode.View.BrickType.CONTROL, commentedOut, content);

        this._elseVisible = elseVisible || true;

        this._ifBricks = new SmartJs.Ui.HtmlTag('ul');//, { className: '' });
        this._appendChild(this._ifBricks);

        this._elsePath = new SmartJs.Ui.ContainerControl();//{ className: 'pc-elsePath' });
        this._createAndAppend(content.elseContent, this._elsePath);
        this._elseBricks = new SmartJs.Ui.HtmlTag('ul');//, { className: 'pc-elsePath' });
        this._elsePath.appendChild(this._elseBricks);
        this._appendChild(this._elsePath);
        this._createAndAppend(content.endContent);
    }

    //properties
    Object.defineProperties(IfThenElseBrickView.prototype, {
        elseVisible: {
            get: function () {
                return this._elseVisible;
            },
            set: function (bool) {
                this._elseVisible = bool;
                if (bool)
                    this._elsePath.show();
                else
                    this._elsePath.hide();
                
                this._redraw();
            }
        }
    });

    //methods
    IfThenElseBrickView.prototype.merge({
        /* override */
        _drawBackground: function () {
            PocketCode.View.BaseBrick.prototype._drawBackground.call(this); //TODO
            //use: brickTpe, commentedOut, ...
        },
        //_addContent: function (content) {

        //    this._ifBricks = new SmartJs.Ui.Control('ul', { className: '' });
        //    this._appendChild(this._ifBricks);

        //    //this._createAndAppend(content.elseContent, this);
        //    this._createAndAppend(content.elseContent, this);

        //    this._elseBricks = new SmartJs.Ui.Control('ul', { className: '' });
        //    this._appendChild(this._elseBricks);

        //    this._createAndAppend(content.endContent);
        //},
    });

    return IfThenElseBrickView;
})();
