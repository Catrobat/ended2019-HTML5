/// <reference path="../core.js" />
/// <reference path="../view/playerPageView.js" />
'use strict';

PocketCode.PlayerPageController = (function () {
    PlayerPageController.extends(PocketCode.BaseController, false);

    function PlayerPageController() {
        //set defautl values and update as soon as project is loaded
        //this._screenHeight = 160;
        //this._screenWidth = 100;
        this._axesVisible = false;

        //var viewportView = new PocketCode.Ui.PlayerViewportView(this._screenWidth, this._screenHeight); //TODO: shouldn't the controller get these settings?
        this._playerViewPort = new PocketCode.PlayerViewportController();//viewportView);
        PocketCode.BaseController.call(this, new PocketCode.Ui.PlayerPageView(this._playerViewPort.view));

        //bind events
        this.view.onToolbarButtonClicked.addEventListener(new SmartJs.Event.EventListener(this._buttonClickedHandler, this));
        //this._view = new PocketCode.Ui.PlayerPageView();
        //this._view.appendChild(this._playerViewPort.view);

        //test
        this._playerViewPort.setProjectScreenSize(200, 320);
        //this._playerViewPort.showAxes();
        //this._playerViewPort.hideAxes();
        //this._playerViewPort.showAxes();

        //this._view.onHide.addEventListener(new SmartJs.Event.EventListener(this._viewHideHandler, this)); //TODO: onHide event = undefined

        //TODO: loading libs? 
        this._gameEngine = new PocketCode.GameEngine(); //TODO: get screen size and update UI

        this._statusDict = {    //TODO: check if necessary
            //init: 'init',
            stopped: 'stopped',
            playing: 'playing',
            paused: 'paused'
        };
        this._status = 'init';
        //this._error = undefined;


        //TODO:
        //SmartJs.Ui.Window.onVisibilityChange.addEventListener(new SmartJs.Event.EventListener(this.doSomething like pause, this));

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
        _buttonClickedHandler: function(e) {
            switch (e.command) {
                case PocketCode.Ui.PlayerBtnCommand.BACK:
                    alert();
                    break;
                case PocketCode.Ui.PlayerBtnCommand.RESTART:
                    alert();
                    break;
                case PocketCode.Ui.PlayerBtnCommand.PLAY:
                    alert();
                    break;
                case PocketCode.Ui.PlayerBtnCommand.PAUSE:
                    alert();
                    break;
                case PocketCode.Ui.PlayerBtnCommand.SCREENSHOT:
                    alert();
                    break;
                case PocketCode.Ui.PlayerBtnCommand.AXES:
                    if (!this._axesVisible) {
                        this._playerViewPort.showAxes();
                        this.view.axesButtonChecked = true;
                        this._axesVisible = true;
                    }
                    else {
                        this._playerViewPort.hideAxes();
                        this.view.axesButtonChecked = false;
                        this._axesVisible = false;
                    }
                    break;
                default:
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
