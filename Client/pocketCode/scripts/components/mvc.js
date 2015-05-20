/// <reference path="../core.js" />
'use strict';

PocketCode.Mvc = {
    CoreView: (function () {
        CoreView.extends(SmartJs.Ui.Control, false);

        function CoreView(propObject) {
            SmartJs.Ui.Control.call(this, 'div', propObject);
            //this._dom = view;

            this._onHide = new SmartJs.Event.Event(this);
            //this._viewOnHide = this._view.onHide;
        }

        //events
        Object.defineProperties(CoreView.prototype, {
            onHide: {
                get: function () { return this._onHide; },
                //enumerable: false,
                //configurable: true,
            },
        });

        //methods
        CoreView.prototype.merge({
            //show: function() {
            //	//this._view.show();
            //},
            /* override */
            hide: function () {
                SmartJs.Ui.Control.prototype.hide.call(this);	//call super method
                this._onHide.dispatchEvent();
            },

        });

        return CoreView;
    })(),

    CoreController: (function () {

        function CoreController(view) {
            this._view = view;

            //this._viewOnShow = this._view.onShow;
            //this._viewOnHide = this._view.onHide;
        }

        CoreController.prototype.merge({
            showView: function () {
                this._view.show();
            },
            hideView: function () {
                this._view.hide();
            },
            updateViewState: function (viewState) { },
        });

        return CoreController;
    })(),
};

