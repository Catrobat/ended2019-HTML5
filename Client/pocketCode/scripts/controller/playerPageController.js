/// <reference path="../core.js" />
/// <reference path="../view/playerPageView.js" />
'use strict';

PocketCode.PlayerPageController = (function () {
    PlayerPageController.extends(PocketCode.BaseController, false);

    function PlayerPageController() {
        //set defautl values and update as soon as project is loaded
        //this._screenHeight = 160;
        //this._screenWidth = 100;

        //var viewportView = new PocketCode.Ui.PlayerViewportView(this._screenWidth, this._screenHeight); //TODO: shouldn't the controller get these settings?
        PocketCode.BaseController.call(this, new PocketCode.Ui.PlayerPageView());//this._playerViewport.view));
        this._playerViewport = new PocketCode.PlayerViewportController();//viewportView);
        this._view.insertAt(0, this._playerViewport.view);
        this._axesVisible = false;
        //this._viewportScaling = 1;

        //bind events
        this._view.onToolbarButtonClicked.addEventListener(new SmartJs.Event.EventListener(this._buttonClickedHandler, this));
        //this._playerViewport.onScalingChanged.addEventListener(new SmartJs.Event.EventListener(this._scalingChangedHandler, this));
        this._playerViewport.onSpriteClicked.addEventListener(new SmartJs.Event.EventListener(this._spriteClickedHandler, this));
        SmartJs.Ui.Window.onVisibilityChange.addEventListener(new SmartJs.Event.EventListener(this._visibilityChangeHandler, this));
        //this._view = new PocketCode.Ui.PlayerPageView();
        //this._view.appendChild(this._playerViewport.view);

        this._playerViewport.setProjectScreenSize(200, 320);
        if (!SmartJs.Device.isMobile || history.length == 0)
            this._view.backButtonDisabled = true;

        //test
        //this._view.screenshotButtonDisabled = true;
        //this._view.executionState = PocketCode.ExecutionState.RUNNING;
        //this._playerViewport.showAxes();
        //this._playerViewport.hideAxes();
        //this._playerViewport.showAxes();

        //this._view.onHide.addEventListener(new SmartJs.Event.EventListener(this._viewHideHandler, this)); //TODO: onHide event = undefined

        //TODO: loading libs? 
        this._gameEngine = undefined;
        //this._gameEngine = new PocketCode.GameEngine(); //TODO: get screen size and update UI

        //this._statusDict = {    //TODO: check if necessary
        //    //init: 'init',
        //    stopped: 'stopped',
        //    playing: 'playing',
        //    paused: 'paused'
        //};
        //this._status = 'init';
        //this._error = undefined;


        //TODO:
        //SmartJs.Ui.Window.onVisibilityChange.addEventListener(new SmartJs.Event.EventListener(this.doSomething like pause, this));

        this._onNavigateBack = new SmartJs.Event.Event(this);
        //this._escKeyHandlerRef = undefined;//this._addDomEventListener(document, 'keyup', this._escKeyHandler);
        //this._load();
    }

    //properties
    Object.defineProperties(PlayerPageController.prototype, {
        project: {
            set: function (value) {
                if (!(value instanceof PocketCode.GameEngine))      //TODO: change this as soon project is available
                    throw new Error('invalid argumenent: project');
                if (value === this._gameEngine)
                    return;
                if (this._gameEngine) {
                    //unbind existing project
                    this._gameEngine.onLoadingProgress.removeEventListener(new SmartJs.Event.EventListener(this._projectLoadingProgressHandler, this));
                    this._gameEngine.onLoad.removeEventListener(new SmartJs.Event.EventListener(this._projectLoadHandler, this));
                    this._gameEngine.onBeforeProgramStart.removeEventListener(new SmartJs.Event.EventListener(this._projectStartHandler, this));
                    this._gameEngine.onProgramExecuted.removeEventListener(new SmartJs.Event.EventListener(this._projectExecutedHandler, this));
                    this._gameEngine.onSpriteChange.removeEventListener(new SmartJs.Event.EventListener(this._uiUpdateHandler, this));
                }
                this._gameEngine = value;
                this._gameEngine.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(this._projectLoadingProgressHandler, this));
                this._gameEngine.onLoad.addEventListener(new SmartJs.Event.EventListener(this._projectLoadHandler, this));
                this._gameEngine.onBeforeProgramStart.addEventListener(new SmartJs.Event.EventListener(this._projectStartHandler, this));
                this._gameEngine.onProgramExecuted.addEventListener(new SmartJs.Event.EventListener(this._projectExecutedHandler, this));
                this._gameEngine.onSpriteChange.addEventListener(new SmartJs.Event.EventListener(this._uiUpdateHandler, this));
            },
        },
    });

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
        //_viewHideHandler: function () {
            //onHide -> pause()
        //},
        //_escKeyHandler: function(e) {
        //    if (e.keyCode == 27) {
        //        console.log('esc pressed');
        //    }
        //},
        //browser
        _visibilityChangeHandler:function(e) {
            //console.log('pause: ' + Date.now()+' ' + e.visible);
            if (e.visible == false)
                this._pauseProject();
        },
        //project handler
        _projectLoadingProgressHandler: function (e) {
            console.log('project loading progress: ' + e);
        },
        _projectLoadHandler: function (e) {
            console.log('project load: ' + e);
        },
        _projectStartHandler: function (e) {
            console.log('project start: ' + e);
        },
        _projectExecutedHandler: function (e) {
            this._view.executionState = PocketCode.ExecutionState.STOPPED;
        },
        _uiUpdateHandler: function (e) {
            console.log('uiUpdate: ' + e);
        },
        //user
        _buttonClickedHandler: function(e) {
            switch (e.command) {
                case PocketCode.Ui.PlayerBtnCommand.BACK:
                    this._onNavigateBack.dispatchEvent();
                    break;
                case PocketCode.Ui.PlayerBtnCommand.RESTART:
                    this._gameEngine.restartProject();
                    this._view.executionState = PocketCode.ExecutionState.RUNNING;
                    break;
                case PocketCode.Ui.PlayerBtnCommand.PLAY:
                    this._gameEngine.runProject();
                    this._view.executionState = PocketCode.ExecutionState.RUNNING;
                    break;
                case PocketCode.Ui.PlayerBtnCommand.PAUSE:
                    this._pauseProject();
                    break;
                case PocketCode.Ui.PlayerBtnCommand.SCREENSHOT:
                    var img = this._playerViewport.takeScreenshot();
                    this._showScreenshotDialog(img);
                    break;
                case PocketCode.Ui.PlayerBtnCommand.AXES:
                    if (!this._axesVisible) {
                        this._playerViewport.showAxes();
                        this._view.axesButtonChecked = true;
                        this._axesVisible = true;
                    }
                    else {
                        this._playerViewport.hideAxes();
                        this._view.axesButtonChecked = false;
                        this._axesVisible = false;
                    }
                    break;
                default:
            }
        },
        _spriteClickedHandler: function(e) {
            //TODO: get id + dispatch event in gameEngine
        },
        _pauseProject: function () {
            if (this._gameEngine)   //may be undefined when triggered on onVisibilityChange
                this._gameEngine.pauseProject();
            this._view.executionState = PocketCode.ExecutionState.PAUSED;
        },
        /* override */
        //updateViewState: function (viewState) {
        //    //TODO: ??
        //},
        //_load: function () {

        //},
        //loadProject: function (jsonProject) {
        //    //this._gameEngine.loadProject(jsonProject);
        //},
        _showScreenshotDialog: function (image) {
            alert('todo: show screenshot dialog');
        },
        dispose: function () {
            this._pauseProject();
            SmartJs.Ui.Window.onVisibilityChange.removeEventListener(new SmartJs.Event.EventListener(this._visibilityChangeHandler, this));
            if (this._gameEngine) {
                //unbind existing project
                this._gameEngine.onLoadingProgress.removeEventListener(new SmartJs.Event.EventListener(this._projectLoadingProgressHandler, this));
                this._gameEngine.onLoad.removeEventListener(new SmartJs.Event.EventListener(this._projectLoadHandler, this));
                this._gameEngine.onBeforeProgramStart.removeEventListener(new SmartJs.Event.EventListener(this._projectStartHandler, this));
                this._gameEngine.onProgramExecuted.removeEventListener(new SmartJs.Event.EventListener(this._projectExecutedHandler, this));
                this._gameEngine.onSpriteChange.removeEventListener(new SmartJs.Event.EventListener(this._uiUpdateHandler, this));
                this._gameEngine = undefined;
            }
            this._playerViewport.onSpriteClicked.removeEventListener(new SmartJs.Event.EventListener(this._spriteClickedHandler, this));
            //this._playerViewport.dispose();
            PocketCode.BaseController.prototype.dispose.call(this);
        },
    });

    return PlayerPageController;
})();
