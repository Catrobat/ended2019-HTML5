/// <reference path="../core.js" />
'use strict';

PocketCode.PlayerPageController = (function () {
    PlayerPageController.extends(PocketCode.Mvc.CoreController, false);

    function PlayerPageController() {
        PocketCode.Mvc.CoreController.call(this, new PocketCode.PlayerPageView());
        this._view.onHide.addEventListener(new SmartJs.Event.EventListener(this._viewHideHandler, this));

        //TODO: loading libs? this._gameEngine = new PocketCode.GameEngine();
        this._statusDict = {
            //init: 'init',
            stopped: 'stopped',
            playing: 'playing',
            paused: 'paused',
        };
        this._status = 'init';
        //this._error = undefined;

        this._onNavigateBack = new SmartJs.Event.Event(this);
        this._escKeyHandlerRef = undefined;//this._addDomEventListener(document, 'keyup', this._escKeyHandler);
        this._load();
    }

    //events
    Object.defineProperties(PlayerPageController.prototype, {
        onNavigateBack: {
            get: function () { return this._onNavigateBack; },
            //enumerable: false,
            //configurable: true,
        },
    });

    //methods
    PlayerPageController.prototype.merge({
        _viewHideHandler: function () {
            //onHide -> pause()
        },
        _escKeyHandler: function(e) {
            if (e.keyCode == 27) {
                console.log('esc pressed');
            }
        },
        /* override */
        updateViewState: function (viewState) {

        },
        _load: function () {

        },
        loadProject: function (jsonProject) {
            //this._gameEngine.loadProject(jsonProject);
        },
    });

    return PlayerPageController;
})();
