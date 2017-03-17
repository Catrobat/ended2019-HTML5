/// <reference path="../core.js" />
/// <reference path="../ui/dialog.js" />
/// <reference path="../view/playerPageView.js" />
/// <reference path="../../../player/scripts/ui/playerMenu.js" />
'use strict';

PocketCode.CodePageController = (function () {
    CodePageController.extends(PocketCode.PageController, false);

    function CodePageController() {

        PocketCode.PageController.call(this, new PocketCode.Ui.CodePageView());
        this._codeViewportController = new PocketCode.CodeViewportController();
        this._view.insertAt(0, this._codeViewportController.view);
        this._axesVisible = false;

        this._codeViewportController.setProjectScreenSize(200, 320);

        this._gameEngine = undefined;
    }

    //properties
    Object.defineProperties(CodePageController.prototype, {
        project: {
            set: function (value) {
                //console.log("setting project");
                if (!(value instanceof PocketCode.GameEngine))      //TODO: change this as soon as project is available
                    throw new Error('invalid argumenent: project');
                if (value === this._gameEngine)
                    return;
                if (this._gameEngine) { //TODO: shouldn't we dispose an existing project before loading another?
                    this._gameEngine.dispose();
                }
                this._gameEngine = value;
            },
        },
    });

    //methods
    CodePageController.prototype.merge({
        enableView: function () {
            this._view.disabled = false;
        },
        //user
        _onUserActionHandler: function (e) {
            this._gameEngine.handleUserAction(e);
        },
        dispose: function () {
            //this._pauseProject();
            if (this._gameEngine && !this._gameEngine._disposing && !this._gameEngine._disposed) {
                this._gameEngine = undefined;
            }
            this._codeViewportController.onUserAction.removeEventListener(new SmartJs.Event.EventListener(this._onUserActionHandler, this));
            PocketCode.PageController.prototype.dispose.call(this);
        },
    });

    return CodePageController;
})();
