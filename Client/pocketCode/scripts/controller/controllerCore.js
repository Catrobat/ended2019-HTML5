/// <reference path="../core.js" />
/// <reference path="../ui.js" />
'use strict';

PocketCode.BaseController = (function () {

    function BaseController(view) {
        if (!(view instanceof SmartJs.Ui.Control))
            throw new Error('invalid argument: view: expected instance SmartJs.Ui.Control');
        this._view = view;

        //this._viewOnShow = this._view.onShow;
        //this._viewOnHide = this._view.onHide;
    }

    BaseController.prototype.merge({
        showView: function () {
            this._view.show();
        },
        hideView: function () {
            this._view.hide();
        },
        updateViewState: function (viewState) { },  //TODO: ???
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
    });

    return PageController;
})();

