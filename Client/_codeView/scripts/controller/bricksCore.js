/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="../components/formula.js" />
'use strict';

PocketCode.BaseBrick = (function () {
    BaseBrick.extends(PocketCode.BaseController, false);

    function BaseBrick(view, model, commentedOut) {
        PocketCode.BaseController.call(this, view);
        this._model = model; //brickmodel for databinding
        this._commentedOut = commentedOut;
        //TODO definition speichern
    }

    //properties
    Object.defineProperties(BaseBrick.prototype, {
    });

    //methods
    BaseBrick.prototype.merge({
    });

    return BaseBrick;
})();

PocketCode.UnsupportedBrick = (function () {
    UnsupportedBrick.extends(PocketCode.BaseBrick, false);

    function UnsupportedBrick(model) {
        var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.UNSUPPORTED, true);
        PocketCode.BaseBrick.call(this, view, model, true);
    }
    return UnsupportedBrick;
})();
