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

        this._currentHistoryIdx = undefined;
        this._dialogs = [];
        //this._viewOnShow = this._view.onShow;
        //this._viewOnHide = this._view.onHide;
    }

    //properties
    Object.defineProperties(PageController.prototype, {
        currentHistoryIdx: {
            set: function (idx) {
                this._currentHistoryIdx = idx;
            },
        },
    });
    
    //methods
    PageController.prototype.merge({
        loadViewState: function (viewState, dialogsLength) {
            //should be overridden in any page that supports view states
            var dialogs = this._dialogs;
            for (var i = dialogsLength, l = dialogs.length - 1; i < l; l--) {
                dialogs[l].dispose();
                dialogs.pop();
            }
        },
        _showDialog: function (dialog) {
            if (!(dialog instanceof PocketCode.Ui.Dialog))
                throw new Error('invalid argument: dialog');

            this._dialogs.push(dialog);
            if (SmartJs.Device.isMobile)    //create history entry
                history.pushState(new PocketCode.HistoryEntry(state.historyIdx + 1, state.dialogsLength, this, PocketCode.ExecutionState.RUNNING, this._dialogs.length), document.title, '');

            this._view.appendChild(dialog);
        },
        execDialogDefaultOnEsc: function () {
            var l = this._dialogs.length;
            if (l > 0)
                this._dialogs[l - 1].execDefaultBtnAction();
        },
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

