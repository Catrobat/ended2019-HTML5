/// <reference path="../core.js" />
/// <reference path="../ui/dialog.js" />
/// <reference path="../view/playerPageView.js" />
/// <reference path="../../../player/scripts/ui/playerMenu.js" />
'use strict';

PocketCode.PlayerPageController = (function () {
    PlayerPageController.extends(PocketCode.PageController, false);

    function PlayerPageController() {

        PocketCode.PageController.call(this, new PocketCode.Ui.PlayerPageView());
        this._playerViewportController = new PocketCode.PlayerViewportController();
        this._view.insertAt(0, this._playerViewportController.view);
        this._axesVisible = false;

        //bind events
        this._view.onToolbarButtonClicked.addEventListener(new SmartJs.Event.EventListener(this._buttonClickedHandler, this));
        this._view.onMenuAction.addEventListener(new SmartJs.Event.EventListener(this._menuActionHandler, this));
        this._view.onMenuOpen.addEventListener(new SmartJs.Event.EventListener(this._pauseProject, this));
        this._view.onStartClicked.addEventListener(new SmartJs.Event.EventListener(function (e) { this._buttonClickedHandler(e.merge({ command: PocketCode.Ui.PlayerBtnCommand.START })); }, this));
        this._view.onExitClicked.addEventListener(new SmartJs.Event.EventListener(function (e) { this._buttonClickedHandler(e.merge({ command: PocketCode.Ui.PlayerBtnCommand.BACK })); }, this));
        this._playerViewportController.onUserAction.addEventListener(new SmartJs.Event.EventListener(this._onUserActionHandler, this));
        SmartJs.Ui.Window.onVisibilityChange.addEventListener(new SmartJs.Event.EventListener(this._visibilityChangeHandler, this));

        this._playerViewportController.setProjectScreenSize(200, 320);
        if (!SmartJs.Device.isMobile || history.length == 0)
            this._view.backButtonDisabled = true;

        //this._view.onHide.addEventListener(new SmartJs.Event.EventListener(this._viewHideHandler, this)); //TODO: onHide event = undefined

        //TODO: loading libs? 
        this._gameEngine = undefined;

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

        //this._onNavigateBack = new SmartJs.Event.Event(this);
        //this._escKeyHandlerRef = undefined;//this._addDomEventListener(document, 'keyup', this._escKeyHandler);
        //this._load();
    }

    //properties
    Object.defineProperties(PlayerPageController.prototype, {
        menu: {
            get: function () {
                return this._view.menu;
            },
        },
        projectDetails: {
            set: function (json) {
                this._view.showStartScreen(json.title, json.baseUrl + json.thumbnailUrl);
            },
        },
        project: {
            set: function (value) {
                if (!(value instanceof PocketCode.GameEngine))      //TODO: change this as soon as project is available
                    throw new Error('invalid argumenent: project');
                if (value === this._gameEngine)
                    return;
                if (this._gameEngine) { //TODO: shouldn't we dispose an existing project before loading another?
                    //unbind existing project
                    this._gameEngine.onLoadingProgress.removeEventListener(new SmartJs.Event.EventListener(this._projectLoadingProgressHandler, this));
                    //this._gameEngine.onScenesInitialized.removeEventListener(new SmartJs.Event.EventListener(this._scenesInitializedHandler, this));
                    this._gameEngine.onBeforeProgramStart.removeEventListener(new SmartJs.Event.EventListener(this._beforeProjectStartHandler, this));
                    this._gameEngine.onProgramExecuted.removeEventListener(new SmartJs.Event.EventListener(this._projectExecutedHandler, this));
                    this._gameEngine.onSpriteUiChange.removeEventListener(new SmartJs.Event.EventListener(this._uiUpdateHandler, this));
                    this._gameEngine.onVariableUiChange.removeEventListener(new SmartJs.Event.EventListener(this._varUpdateHandler, this));
                    this._gameEngine.dispose();
                }
                this._gameEngine = value;
                this._gameEngine.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(this._projectLoadingProgressHandler, this));
                //this._gameEngine.onScenesInitialized.addEventListener(new SmartJs.Event.EventListener(this._scenesInitializedHandler, this));
                this._gameEngine.onBeforeProgramStart.addEventListener(new SmartJs.Event.EventListener(this._beforeProjectStartHandler, this));
                this._gameEngine.onProgramExecuted.addEventListener(new SmartJs.Event.EventListener(this._projectExecutedHandler, this));
                this._gameEngine.onSpriteUiChange.addEventListener(new SmartJs.Event.EventListener(this._uiUpdateHandler, this));
                this._gameEngine.onVariableUiChange.addEventListener(new SmartJs.Event.EventListener(this._varUpdateHandler, this));
            },
        },
    });

    //methods
    PlayerPageController.prototype.merge({
        /* override */
        loadViewState: function (viewState, dialogsLength) {
            PocketCode.PageController.prototype.loadViewState.call(this, viewState, dialogsLength);   //to handle dialogs
            //set UI based on viewState
            if (viewState === PocketCode.ExecutionState.PAUSED) {
                if (this._gameEngine.executionState == PocketCode.ExecutionState.RUNNING)
                    this._pauseProject();
            }
            else {
                this._gameEngine.stopProject();
            }
            this._view.executionState = viewState;
        },
        /* override */
        actionOnGlobalError: function() {
            this._view.disabled = true;
        },

        //browser
        _visibilityChangeHandler: function (e) {
            if (e.visible == false)
                this._pauseProject();
        },
        //project handler
        _projectLoadingProgressHandler: function (e) {
            this._view.setLoadingProgress(e.progress);
        },
        //_scenesInitializedHandler: function(e) {
        //    //console.log( this._playerViewportController._view );
        //    this._playerViewportController.initCanvas(e.ids);
        //    //this._view.initCanvasScenes(e.ids);
        //},
        initOnLoad: function (sceneIds) {
            var screenSize = this._gameEngine.projectScreenSize;
            this._playerViewportController.setProjectScreenSize(screenSize.width, screenSize.height);
            this._playerViewportController.initCanvas(e.ids);
            this._playerViewportController.renderingImages = this._gameEngine.renderingImages;  //TODO: assign onBeforeStart? -> changing when scenes are changed
            this._playerViewportController.renderingTexts = this._gameEngine.renderingTexts;    //TODO:
            this._view.disabled = false;
        },
        _beforeProjectStartHandler: function (e) {    //on start event dispatched by gameEngine
            if (e.reinit)
                this.initOnLoad(e.sceneIds);
            this._view.hideStartScreen();
        },
        _projectExecutedHandler: function (e) {
            if (SmartJs.Device.isMobile)
                return history.back();

            this._view.executionState = PocketCode.ExecutionState.STOPPED;
        },
        _uiUpdateHandler: function (e) {
            this._playerViewportController.updateSprite(e.id, e.properties);
        },
        _varUpdateHandler: function(e) {
            this._playerViewportController.updateVariable(e.id, e.properties);
        },
        //user
        _buttonClickedHandler: function (e) {
            this._view.closeMenu();
            switch (e.command) {
                case PocketCode.Ui.PlayerBtnCommand.BACK:
                    history.back();
                    break;
                case PocketCode.Ui.PlayerBtnCommand.RESTART:
                    if (SmartJs.Device.isMobile) {    //create history entry
                        var state = history.state;
                        history.replaceState(new PocketCode.HistoryEntry(state.historyIdx, state.dialogsLength, this, PocketCode.ExecutionState.PAUSED, this._dialogs.length), document.title, '');
                        history.pushState(new PocketCode.HistoryEntry(state.historyIdx + 1, state.dialogsLength, this, PocketCode.ExecutionState.RUNNING, this._dialogs.length), document.title, '');
                    }
                    this._gameEngine.restartProject();
                    this._view.executionState = PocketCode.ExecutionState.RUNNING;
                    this._view.screenshotButtonDisabled = false;
                    this._view.axesButtonDisabled = false;
                    break;
                case PocketCode.Ui.PlayerBtnCommand.START:
                    if (SmartJs.Device.isMobile) {    //create history entry
                        var state = history.state;
                        history.replaceState(new PocketCode.HistoryEntry(state.historyIdx, state.dialogsLength, this, PocketCode.ExecutionState.PAUSED, this._dialogs.length), document.title, '');
                        history.pushState(new PocketCode.HistoryEntry(state.historyIdx + 1, state.dialogsLength, this, PocketCode.ExecutionState.RUNNING, this._dialogs.length), document.title, '');
                    }
                    this._gameEngine.runProject();
                    this._view.executionState = PocketCode.ExecutionState.RUNNING;
                    this._view.screenshotButtonDisabled = false;
                    this._view.axesButtonDisabled = false;
                    break;
                case PocketCode.Ui.PlayerBtnCommand.PAUSE:
                    this._pauseProject();
                    break;
                case PocketCode.Ui.PlayerBtnCommand.SCREENSHOT:
                    this._pauseProject();
                    var dataUrl = this._playerViewportController.takeScreenshot();
                    this._showScreenshotDialog(dataUrl);
                    break;
                case PocketCode.Ui.PlayerBtnCommand.AXES:
                    if (!this._axesVisible) {
                        this._playerViewportController.showAxes();
                        this._view.axesButtonChecked = true;
                        this._axesVisible = true;
                    }
                    else {
                        this._playerViewportController.hideAxes();
                        this._view.axesButtonChecked = false;
                        this._axesVisible = false;
                    }
                    break;
                default:
            }
        },
        _menuActionHandler: function (e) {
            switch (e.command) {
                case PocketCode.Player.MenuCommand.FULLSCREEN:
                    this._playerViewportController.zoomToFit = e.checked;
                    break;
                case PocketCode.Player.MenuCommand.LANGUAGE_CHANGE:
                    PocketCode.I18nProvider.loadDictionary(e.languageCode);
                    break;
                case PocketCode.Player.MenuCommand.TERMS_OF_USE:
                    var win = window.open('https://share.catrob.at/pocketcode/termsOfUse', '_blank');
                    if (win)    //browser has allowed new tab
                        win.focus();
                    break;
                case PocketCode.Player.MenuCommand.IMPRINT:
                    var win = window.open('http://developer.catrobat.org/imprint', '_blank');
                    if (win)    //browser has allowed new tab
                        win.focus();
                    break;
                case PocketCode.Player.MenuCommand.HELP:
                    var win = window.open('https://share.catrob.at/pocketcode/help', '_blank');
                    if (win)    //browser has allowed new tab
                        win.focus();
                    break;
            }
        },
        _onUserActionHandler: function (e) {
            this._gameEngine.handleUserAction(e);
        },
        _pauseProject: function () {
            if (this._gameEngine && this._gameEngine.pauseProject())   //may be undefined when triggered on onVisibilityChange
                this._view.executionState = PocketCode.ExecutionState.PAUSED;
        },
        _showScreenshotDialog: function (imageSrc) {
            var d = new PocketCode.Ui.ScreenshotDialog();
            if (this._screenshotDialog && !this._screenshotDialog.disposed) {
                this._dialogs.remove(this._screenshotDialog);
                this._screenshotDialog.dispose();   //prevent several simultaneous dialogs (desktop)
            }
            this._screenshotDialog = d;
            d.onCancel.addEventListener(new SmartJs.Event.EventListener(function (e) {
                this._dialogs.remove(e.target);
                e.target.dispose();
                if (SmartJs.Device.isMobile)
                    history.back();
            }, this));
            if (SmartJs.Device.isMobile) {
                var state = history.state;
                history.replaceState(new PocketCode.HistoryEntry(state.historyIdx, state.dialogsLength, this, PocketCode.ExecutionState.PAUSED, this._dialogs.length), document.title, '');
            }
            else
                d.onDownload.addEventListener(new SmartJs.Event.EventListener(this._downloadScreenshot, this));

            d.imageSrc = imageSrc;
            this._showDialog(d);
        },
        _downloadScreenshot: function(e) {
            e.target.download();
        },
        dispose: function () {
            //this._pauseProject();
            SmartJs.Ui.Window.onVisibilityChange.removeEventListener(new SmartJs.Event.EventListener(this._visibilityChangeHandler, this));
            if (this._gameEngine && !this._gameEngine._disposing && !this._gameEngine._disposed) {
                //unbind existing project
                this._gameEngine.onLoadingProgress.removeEventListener(new SmartJs.Event.EventListener(this._projectLoadingProgressHandler, this));
                this._gameEngine.onBeforeProgramStart.removeEventListener(new SmartJs.Event.EventListener(this._beforeProjectStartHandler, this));
                this._gameEngine.onProgramExecuted.removeEventListener(new SmartJs.Event.EventListener(this._projectExecutedHandler, this));
                this._gameEngine.onSpriteUiChange.removeEventListener(new SmartJs.Event.EventListener(this._uiUpdateHandler, this));
                this._gameEngine.onVariableUiChange.removeEventListener(new SmartJs.Event.EventListener(this._varUpdateHandler, this));
                this._gameEngine = undefined;
            }
            this._playerViewportController.onUserAction.removeEventListener(new SmartJs.Event.EventListener(this._onUserActionHandler, this));
            PocketCode.PageController.prototype.dispose.call(this);
        },
    });

    return PlayerPageController;
})();
