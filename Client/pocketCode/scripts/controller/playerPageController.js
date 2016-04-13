/// <reference path="../core.js" />
/// <reference path="../ui/dialog.js" />
/// <reference path="../view/playerPageView.js" />
'use strict';

PocketCode.PlayerPageController = (function () {
    PlayerPageController.extends(PocketCode.PageController, false);

    function PlayerPageController() {
        //set defautl values and update as soon as project is loaded
        //this._screenHeight = 160;
        //this._screenWidth = 100;

        //var viewportView = new PocketCode.Ui.PlayerViewportView(this._screenWidth, this._screenHeight); //TODO: shouldn't the controller get these settings?
        PocketCode.PageController.call(this, new PocketCode.Ui.PlayerPageView());//this._playerViewportController.view));
        this._playerViewportController = new PocketCode.PlayerViewportController();//viewportView);
        this._view.insertAt(0, this._playerViewportController.view);
        this._axesVisible = false;
        //this._viewportScaling = 1;

        //bind events
        this._view.onToolbarButtonClicked.addEventListener(new SmartJs.Event.EventListener(this._buttonClickedHandler, this));
        this._view.onStartClicked.addEventListener(new SmartJs.Event.EventListener(function (e) { this._buttonClickedHandler(e.merge({ command: PocketCode.Ui.PlayerBtnCommand.START })); }, this));
        this._view.onExitClicked.addEventListener(new SmartJs.Event.EventListener(function (e) { this._buttonClickedHandler(e.merge({ command: PocketCode.Ui.PlayerBtnCommand.BACK })); }, this));
        //this._playerViewportController.onScalingChanged.addEventListener(new SmartJs.Event.EventListener(this._scalingChangedHandler, this));
        this._playerViewportController.onSpriteClicked.addEventListener(new SmartJs.Event.EventListener(this._spriteClickedHandler, this));
        SmartJs.Ui.Window.onVisibilityChange.addEventListener(new SmartJs.Event.EventListener(this._visibilityChangeHandler, this));
        //this._view = new PocketCode.Ui.PlayerPageView();
        //this._view.appendChild(this._playerViewportController.view);

        this._playerViewportController.setProjectScreenSize(200, 320);
        if (!SmartJs.Device.isMobile || history.length == 0)
            this._view.backButtonDisabled = true;

        //test
        //this._view.screenshotButtonDisabled = true;
        //this._view.executionState = PocketCode.ExecutionState.RUNNING;
        //this._playerViewportController.showAxes();
        //this._playerViewportController.hideAxes();
        //this._playerViewportController.showAxes();

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

        //this._onNavigateBack = new SmartJs.Event.Event(this);
        //this._escKeyHandlerRef = undefined;//this._addDomEventListener(document, 'keyup', this._escKeyHandler);
        //this._load();
    }

    //properties
    Object.defineProperties(PlayerPageController.prototype, {
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
                    //this._gameEngine.onLoad.removeEventListener(new SmartJs.Event.EventListener(this._projectLoadHandler, this));
                    this._gameEngine.onBeforeProgramStart.removeEventListener(new SmartJs.Event.EventListener(this._beforeProjectStartHandler, this));
                    //this._gameEngine.onProgramStart.removeEventListener(new SmartJs.Event.EventListener(this._projectStartHandler, this));
                    this._gameEngine.onProgramExecuted.removeEventListener(new SmartJs.Event.EventListener(this._projectExecutedHandler, this));
                    this._gameEngine.onSpriteUiChange.removeEventListener(new SmartJs.Event.EventListener(this._uiUpdateHandler, this));
                    this._gameEngine.onVariableUiChange.removeEventListener(new SmartJs.Event.EventListener(this._varUpdateHandler, this));
                    //this._playerViewportController.onSpriteClicked.removeEventListener(new SmartJs.Event.EventListener(this._spriteClickedHandler, this));
                }
                this._gameEngine = value;
                this._gameEngine.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(this._projectLoadingProgressHandler, this));
                //this._gameEngine.onLoad.addEventListener(new SmartJs.Event.EventListener(this._projectLoadHandler, this));
                this._gameEngine.onBeforeProgramStart.addEventListener(new SmartJs.Event.EventListener(this._beforeProjectStartHandler, this));
                //this._gameEngine.onProgramStart.addEventListener(new SmartJs.Event.EventListener(this._projectStartHandler, this));
                this._gameEngine.onProgramExecuted.addEventListener(new SmartJs.Event.EventListener(this._projectExecutedHandler, this));
                this._gameEngine.onSpriteUiChange.addEventListener(new SmartJs.Event.EventListener(this._uiUpdateHandler, this));
                this._gameEngine.onVariableUiChange.addEventListener(new SmartJs.Event.EventListener(this._varUpdateHandler, this));
                //this._playerViewportController.onSpriteClicked.addEventListener(new SmartJs.Event.EventListener(this._spriteClickedHandler, this));
            },
        },
    });

    ////events
    //Object.defineProperties(PlayerPageController.prototype, {
    //    onNavigateBack: {
    //        get: function () { return this._onNavigateBack; },
    //        //enumerable: false,
    //        //configurable: true,
    //    },
    //});

    //methods
    PlayerPageController.prototype.merge({
        /* override */
        loadViewState: function (viewState, dialogsLength) {
            PocketCode.PageController.prototype.loadViewState.call(this, viewState, dialogsLength);   //to handle dialogs
            //set UI based on viewState
            if (viewState === PocketCode.ExecutionState.PAUSED) {
                if (this._gameEngine.executionState == PocketCode.ExecutionState.RUNNING)
                    this._pauseProject();
                //else: paused already
            }
            else {  //if(viewState === PocketCode.ExecutionState.STOPPED)
                this._gameEngine.stopProject();
            }
            this._view.executionState = viewState;
        },
        /* override */
        actionOnGlobalError: function() {
            this._view.disabled = true;
        },
        //view
        //_viewHideHandler: function () {
        //onHide -> pause()
        //},
        //_escKeyHandler: function(e) {
        //    if (e.keyCode == 27) {
        //        console.log('esc pressed');
        //    }
        //},
        //browser
        _visibilityChangeHandler: function (e) {
            //console.log('pause: ' + Date.now()+' ' + e.visible);
            if (e.visible == false)
                this._pauseProject();
        },
        //project handler
        _projectLoadingProgressHandler: function (e) {
            this._view.updateLoadingProgress(e.progress);
            //console.log('project loading progress: ' + e.progress);//JSON.stringify(e.progress) + ', ' + JSON.stringify(e.file));
        },
        initOnLoad: function () {
            var screenSize = this._gameEngine.projectScreenSize;
            this._playerViewportController.setProjectScreenSize(screenSize.width, screenSize.height);
            //console.log('project loaded');// + JSON.stringify(e));
            // TODO create renderingImages from gameEngine.spritesAsPropertyList
            this._playerViewportController.initRenderingImages(this._gameEngine.spritesAsPropertyList);
            this._playerViewportController.initRenderingVariables(this._gameEngine.getVariablesAsPropertyList());
            this._view.disabled = false;
        },
        _beforeProjectStartHandler: function (e) {    //on start event dispatched by gameEngine
            this._view.hideStartScreen();
            //console.log('project start: ');// + JSON.stringify(e));
        },
        //_projectStartHandler: function (e) {
        //    this._playerViewportController.render();    //initial rendering of all sprites
        //    //^^ maybe the visual effect is better if we do not render on start? really necessary? -> remove handlers if so: removed: rendered on initial resize anyway
        //},
        _projectExecutedHandler: function (e) {
            if (SmartJs.Device.isMobile)
                return history.back();

            this._view.executionState = PocketCode.ExecutionState.STOPPED;
            //console.log('project executed (detected)');
        },
        _uiUpdateHandler: function (e) {
            this._playerViewportController.updateSprite(e.id, e.properties);
        //    try {
        //       // console.log('ui update: { spriteId: ' + e.id + ', properties: ' + JSON.stringify(e.properties) + ' }');
        //    }
        //    catch (e) {
        //        //just to make sure recursive parse will not throw an error -> //TODO:
        //    }
        },
        _varUpdateHandler: function(e) {
            this._playerViewportController.updateVariable(e.id, e.properties);
        },
        //user
        _buttonClickedHandler: function (e) {
            switch (e.command) {
                case PocketCode.Ui.PlayerBtnCommand.BACK:
                    history.back();//this._onNavigateBack.dispatchEvent();
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
                    break;
                case PocketCode.Ui.PlayerBtnCommand.PAUSE:
                    this._pauseProject();
                    break;
                case PocketCode.Ui.PlayerBtnCommand.SCREENSHOT:
                    //this._view.hideStartScreen();
                    this._pauseProject();
                    var dataUrl = this._playerViewportController.takeScreenshot();
                    this._showScreenshotDialog(dataUrl);
                    break;
                case PocketCode.Ui.PlayerBtnCommand.AXES:
                    if (!this._axesVisible) {
                        //this._view.hideStartScreen();
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
        //_startButtonClickedHandler: function(e){
        //    this._buttonClickedHandler(e.merge({command: PocketCode.Ui.PlayerBtnCommand.START}));
        //},
        _spriteClickedHandler: function (e) {
            //TODO: get id + dispatch event in gameEngine
            this._gameEngine.handleSpriteTap(e.id);
        },
        _pauseProject: function () {
            if (this._gameEngine && this._gameEngine.pauseProject())   //may be undefined when triggered on onVisibilityChange
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
        _showScreenshotDialog: function (imageSrc) {
            var d = new PocketCode.Ui.ScreenshotDialog();
            if (this._screenshotDialog && !this._screenshotDialog.disposed)
                this._screenshotDialog.dispose();   //prevent several simultaneous dialogs (desktop)
            this._screenshotDialog = d;
            d.onCancel.addEventListener(new SmartJs.Event.EventListener(function (e) {
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
            //download screenshot (as in screenshotdialog.download() or by setting window.location.href?)
            e.target.download();
        },
        dispose: function () {
            //this._pauseProject();
            SmartJs.Ui.Window.onVisibilityChange.removeEventListener(new SmartJs.Event.EventListener(this._visibilityChangeHandler, this));
            if (this._gameEngine && !this._gameEngine._disposing && !this._gameEngine._disposed) {
                //unbind existing project
                this._gameEngine.onLoadingProgress.removeEventListener(new SmartJs.Event.EventListener(this._projectLoadingProgressHandler, this));
                //this._gameEngine.onLoad.removeEventListener(new SmartJs.Event.EventListener(this._projectLoadHandler, this));
                this._gameEngine.onBeforeProgramStart.removeEventListener(new SmartJs.Event.EventListener(this._beforeProjectStartHandler, this));
                //this._gameEngine.onProgramStart.removeEventListener(new SmartJs.Event.EventListener(this._projectStartHandler, this));
                this._gameEngine.onProgramExecuted.removeEventListener(new SmartJs.Event.EventListener(this._projectExecutedHandler, this));
                this._gameEngine.onSpriteUiChange.removeEventListener(new SmartJs.Event.EventListener(this._uiUpdateHandler, this));
                this._gameEngine.onVariableUiChange.removeEventListener(new SmartJs.Event.EventListener(this._varUpdateHandler, this));
                this._gameEngine = undefined;
            }
            this._playerViewportController.onSpriteClicked.removeEventListener(new SmartJs.Event.EventListener(this._spriteClickedHandler, this));
            //this._playerViewportController.dispose();
            PocketCode.PageController.prototype.dispose.call(this);
        },
    });

    return PlayerPageController;
})();
