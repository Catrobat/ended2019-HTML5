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
        this._lockScreenWhenStarted = false;
        this._axesVisible = false;

        //bind events
        this._view.onToolbarButtonClick.addEventListener(new SmartJs.Event.EventListener(this._buttonClickHandler, this));
        this._view.onStartClicked.addEventListener(new SmartJs.Event.EventListener(function (e) { this._buttonClickHandler(e.merge({ command: PocketCode.Ui.PlayerBtnCommand.START })); }, this));
        this._view.onExitClicked.addEventListener(new SmartJs.Event.EventListener(function (e) { this._buttonClickHandler(e.merge({ command: PocketCode.Ui.PlayerBtnCommand.BACK })); }, this));
        this._playerViewportController.onUserAction.addEventListener(new SmartJs.Event.EventListener(this._onUserActionHandler, this));

        this._playerViewportController.setProjectScreenSize(200, 320);
        if (!SmartJs.Device.isMobile || history.length == 0)
            this._view.backButtonDisabled = true;

        this._gameEngine = undefined;

        //events
        this._onButtonClick = new SmartJs.Event.Event(this);
    }

    //events
    Object.defineProperties(PlayerPageController.prototype, {
        onButtonClick: {
            get: function () {
                return this._onButtonClick;
            },
        },
    });

    //properties
    Object.defineProperties(PlayerPageController.prototype, {
        menu: {
            set: function (menu) {
                this._view.menu = menu;
            },
        },
        lockScreen:{
            set:function(lock){
                this._lockScreenWhenStarted = !!lock;
            },
        },
        projectDetails: {
            set: function (json) {
                this._view.showStartScreen(json.title, json.baseUrl + json.thumbnailUrl);
            },
        },
        project: {
            set: function (value) {
                if (!(value instanceof PocketCode.GameEngine))
                    throw new Error('invalid argumenent: project');
                if (value === this._gameEngine)
                    return;
                if (this._gameEngine) {
                    //unbind existing project
                    this._gameEngine.onLoadingProgress.removeEventListener(new SmartJs.Event.EventListener(this._projectLoadingProgressHandler, this));
                    //this._gameEngine.onScenesInitialized.removeEventListener(new SmartJs.Event.EventListener(this._scenesInitializedHandler, this));
                    this._gameEngine.onBeforeProgramStart.removeEventListener(new SmartJs.Event.EventListener(this._beforeProjectStartHandler, this));
                    this._gameEngine.onSceneChange.removeEventListener(new SmartJs.Event.EventListener(this._sceneChangedHandler, this));
                    this._gameEngine.onProgramExecuted.removeEventListener(new SmartJs.Event.EventListener(this._projectExecutedHandler, this));
                    this._gameEngine.onSpriteUiChange.removeEventListener(new SmartJs.Event.EventListener(this._uiUpdateHandler, this));
                    this._gameEngine.onVariableUiChange.removeEventListener(new SmartJs.Event.EventListener(this._varUpdateHandler, this));
                    this._gameEngine.dispose();
                }
                this._gameEngine = value;
                this._gameEngine.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(this._projectLoadingProgressHandler, this));
                //this._gameEngine.onScenesInitialized.addEventListener(new SmartJs.Event.EventListener(this._scenesInitializedHandler, this));
                this._gameEngine.onBeforeProgramStart.addEventListener(new SmartJs.Event.EventListener(this._beforeProjectStartHandler, this));
                this._gameEngine.onSceneChange.addEventListener(new SmartJs.Event.EventListener(this._sceneChangedHandler, this));
                this._gameEngine.onProgramExecuted.addEventListener(new SmartJs.Event.EventListener(this._projectExecutedHandler, this));
                this._gameEngine.onSpriteUiChange.addEventListener(new SmartJs.Event.EventListener(this._uiUpdateHandler, this));
                this._gameEngine.onVariableUiChange.addEventListener(new SmartJs.Event.EventListener(this._varUpdateHandler, this));
                //this._gameEngine.onCameraUsageChange.addEventListener(new SmartJs.Event.EventListener(this._cameraChangedHandler, this));
            },
        },
    });

    //methods
    PlayerPageController.prototype.merge({
        pauseOrHistoryBack:function(){
            if (this._gameEngine.executionState != PocketCode.ExecutionState.RUNNING || this._gameEngine.executionState != PocketCode.ExecutionState.PAUSED_USERINTERACTION)
                return;
            if (SmartJs.Device.isMobile)
                history.back();
            else
                this._pauseProject();
        },
        _pauseProject: function () {
            if (this._gameEngine && this._gameEngine.pauseProject())   //may be undefined when triggered on onVisibilityChange
                this._view.executionState = PocketCode.ExecutionState.PAUSED;
        },
        /* override */
        loadViewState: function (viewState, dialogsLength) {
            PocketCode.PageController.prototype.loadViewState.call(this, viewState, dialogsLength);   //to handle dialogs
            //set UI based on viewState
            if (viewState === PocketCode.ExecutionState.PAUSED) {
                if (this._gameEngine.executionState == PocketCode.ExecutionState.RUNNING || this._gameEngine.executionState == PocketCode.ExecutionState.PAUSED_USERINTERACTION)
                    this._pauseProject();
                else    //loaded onExecuted event
                    viewState = PocketCode.ExecutionState.STOPPED;
            }
            else {
                this._gameEngine.stopProject();
            }
            this._view.executionState = viewState;
        },
        /* override */
        actionOnGlobalError: function () {
            this._view.disabled = true;
        },

        //project handler
        _projectLoadingProgressHandler: function (e) {
            this._view.setLoadingProgress(e.progress);
        },
        enableView: function () {
            this._view.disabled = false;
        },
        _beforeProjectStartHandler: function (e) {    //on start event dispatched by gameEngine
            this._playerViewportController.clearViewport();
            this._view.hideStartScreen();
        },
        _sceneChangedHandler: function (e) {    //on start event dispatched by gameEngine
            //this event will occur on: load, start scene, continue scene, add/remove clone, ..
            var screenSize = e.screenSize;
            this._playerViewportController.setProjectScreenSize(screenSize.width, screenSize.height);
            this._playerViewportController.renderingSprites = e.renderingSprites;
            this._playerViewportController.renderingTexts = e.renderingTexts;

            this._playerViewportController.initScene(e.id, screenSize, e.reinit);   //rerender
        },
        _projectExecutedHandler: function (e) {
            if (SmartJs.Device.isMobile)
                return history.back();

            this._view.executionState = PocketCode.ExecutionState.STOPPED;
        },
        _uiUpdateHandler: function (e) {
            this._playerViewportController.updateSprite(e.id, e.properties);
        },
        _varUpdateHandler: function (e) {
            this._playerViewportController.updateVariable(e.scopeId, e.variableId, e.value, e.viewState);
        },
        _cameraChangedHandler: function (e) {
            this._playerViewportController.updateCameraUse(e.on, e.src, e.width, e.height, e.transparency, e.orientation);
        },
        //user
        _buttonClickHandler: function (e) {
            this._onButtonClick.dispatchEvent(e);
            switch (e.command) {
                case PocketCode.Ui.PlayerBtnCommand.BACK:
                    history.back();
                    break;
                case PocketCode.Ui.PlayerBtnCommand.RESTART:
                    if (this._screenshotDialog && !this._screenshotDialog.disposed) {
                        this._dialogs.remove(this._screenshotDialog);
                        this._screenshotDialog.dispose();   //prevent several simultaneous dialogs (desktop)
                    }
                    if (SmartJs.Device.isMobile) {    //create history entry
                        var state = history.state;
                        history.replaceState(new PocketCode.HistoryEntry(state.historyIdx, state.dialogsLength, this, PocketCode.ExecutionState.PAUSED, this._dialogs.length), document.title, '');
                        history.pushState(new PocketCode.HistoryEntry(state.historyIdx + 1, state.dialogsLength, this, PocketCode.ExecutionState.RUNNING, this._dialogs.length), document.title, '');
                    }
                    this._gameEngine.restartProject(this._lockScreenWhenStarted);
                    this._view.executionState = PocketCode.ExecutionState.RUNNING;
                    this._view.screenshotButtonDisabled = false;
                    this._view.axesButtonDisabled = false;
                    break;
                case PocketCode.Ui.PlayerBtnCommand.START:
                    if (this._screenshotDialog && !this._screenshotDialog.disposed) {
                        this._dialogs.remove(this._screenshotDialog);
                        this._screenshotDialog.dispose();   //prevent several simultaneous dialogs (desktop)
                    }
                    if (SmartJs.Device.isMobile) {    //create history entry
                        var state = history.state;
                        history.replaceState(new PocketCode.HistoryEntry(state.historyIdx, state.dialogsLength, this, PocketCode.ExecutionState.PAUSED, this._dialogs.length), document.title, '');
                        history.pushState(new PocketCode.HistoryEntry(state.historyIdx + 1, state.dialogsLength, this, PocketCode.ExecutionState.RUNNING, this._dialogs.length), document.title, '');
                    }
                    if (this._view.executionState == PocketCode.ExecutionState.PAUSED)
                        this._gameEngine.resumeProject(this._lockScreenWhenStarted);
                    else
                        this._gameEngine.runProject(this._lockScreenWhenStarted);
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
        _onUserActionHandler: function (e) {
            this._gameEngine.handleUserAction(e);
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
                var state = history.state ? history.state : { historyIdx: -1, dialogsLength: 0 };
                history.replaceState(new PocketCode.HistoryEntry(state.historyIdx, state.dialogsLength, this, PocketCode.ExecutionState.PAUSED, this._dialogs.length), document.title, '');
            }
            else
                d.onDownload.addEventListener(new SmartJs.Event.EventListener(this._downloadScreenshot, this));

            d.imageSrc = imageSrc;
            this._showDialog(d);
        },
        _downloadScreenshot: function (e) {
            e.target.download();
        },
        dispose: function () {
            //this._pauseProject();
            if (this._gameEngine && !this._gameEngine._disposing && !this._gameEngine._disposed) {
                //unbind existing project
                this._gameEngine.onLoadingProgress.removeEventListener(new SmartJs.Event.EventListener(this._projectLoadingProgressHandler, this));
                this._gameEngine.onBeforeProgramStart.removeEventListener(new SmartJs.Event.EventListener(this._beforeProjectStartHandler, this));
                this._gameEngine.onSceneChange.removeEventListener(new SmartJs.Event.EventListener(this._sceneChangedHandler, this));
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
