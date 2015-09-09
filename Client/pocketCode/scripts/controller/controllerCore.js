/// <reference path="../core.js" />
/// <reference path="../ui.js" />
'use strict';

PocketCode.BaseController = (function () {
    BaseController.extends(SmartJs.Core.EventTarget);

    function BaseController(view) {
        if (!(view instanceof SmartJs.Ui.Control))
            throw new Error('invalid argument: view: expected instance SmartJs.Ui.Control');
        this._view = view;

        //this._viewOnShow = this._view.onShow;
        //this._viewOnHide = this._view.onHide;
    }

    //properties
    Object.defineProperties(BaseController.prototype, {
        view: {
            get: function () {
                return this._view;
            },
        },
    });

    //methods
    BaseController.prototype.merge({
        showView: function () {
            this._view.show();
        },
        hideView: function () {
            this._view.hide();
        },
        updateViewState: function (viewState) { },  //TODO: ???
        dispose: function () {
            //use SmartJs.Ui.Control dispose to dispose view, as dispose() was overridden
            SmartJs.Ui.Control.prototype.dispose.call(this._view);
        },
    });

    return BaseController;
})();

PocketCode.PageController = (function () {
    PageController.extends(PocketCode.BaseController, false);

    function PageController(view) {
        if (!(view instanceof PocketCode.Ui.PageView))
            throw new Error('invalid argument: view: expected type PageView');
        PocketCode.BaseController.call(this, view);

        //this._viewOnShow = this._view.onShow;
        //this._viewOnHide = this._view.onHide;
    }

    PageController.prototype.merge({
        //showView: function () {
        //    this._view.show();
        //},
        //hideView: function () {
        //    this._view.hide();
        //},
        //updateViewState: function (viewState) { },
        //dispose: function () {
        //    this._view.dispose(); //the view can already be disposed or will calling the base class
        //    SmartJs.Ui.Control.prototype.dispose.call(this);
        //},
    });

    return PageController;
})();

