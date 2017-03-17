/// <reference path="../core.js" />
/// <reference path="../ui/dialog.js" />
/// <reference path="../view/playerPageView.js" />
/// <reference path="../../../player/scripts/ui/playerMenu.js" />
'use strict';

PocketCode.CodePageController = (function () {
    CodePageController.extends(PocketCode.PageController, false);

    function CodePageController() {

        PocketCode.PageController.call(this, new PocketCode.Ui.CodePageView());
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
                this._initProject();
            },
        },
    });

    //methods
    CodePageController.prototype.merge({
        _initProject: function() {
            //TODO:
            alert('project loaded- time to create a code view');
        },
        //enableView: function () {
        //    this._view.disabled = false;
        //},
        /* override */
        dispose: function () {
            if (this._gameEngine && !this._gameEngine._disposing && !this._gameEngine._disposed) {
                this._gameEngine = undefined;
            }
            PocketCode.PageController.prototype.dispose.call(this);
        },
    });

    return CodePageController;
})();
