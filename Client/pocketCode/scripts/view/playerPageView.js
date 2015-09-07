/// <reference path="../core.js" />
/// <reference path="../components/gameEngine.js" />
/// <reference path="../ui/playerStartScreen.js" />
/// <reference path="../ui/playerToolbar.js" />
/// <reference path="playerViewportView.js" />
'use strict';

PocketCode.Ui.PlayerPageView = (function () {
    PlayerPageView.extends(PocketCode.Ui.PageView, false);

    function PlayerPageView() {//playerViewportView) {
        PocketCode.Ui.PageView.call(this);  //even if we do not pass argument, ui is built in the constructor so we have to call the ctr to reinit
        this._header.hide();
        this._footer.hide();

        //if (!(playerViewportView instanceof PocketCode.Ui.PlayerViewportView))
        //    throw new Error('invalid ctr argument: PlayerViewportView');
        //this.appendChild(playerViewportView);

        this._toolbar;
        if (SmartJs.Device.isIOs)
            this._toolbar = new PocketCode.Ui.PlayerToolbar(PocketCode.Ui.PlayerToolbarSettings.MOBILE_IOS);
        else if (SmartJs.Device.isMobile)
            this._toolbar = new PocketCode.Ui.PlayerToolbar(PocketCode.Ui.PlayerToolbarSettings.MOBILE);
        else {
            this._toolbar = new PocketCode.Ui.PlayerToolbar(PocketCode.Ui.PlayerToolbarSettings.DESKTOP);
            //this._toolbar.hide();
        }
        this.appendChild(this._toolbar);

        var setting = undefined;
        var menuOffset = 0;

        //test
        //this.executionState = PocketCode.ExecutionState.RUNNING;

        //if (SmartJs.Device.isIOs)
        //    setting = PocketCode.Ui.PlayerToolbarSettings.MOBILE_IOS;
        //else if (SmartJs.Device.isMobile)
        //    setting = PocketCode.Ui.PlayerToolbarSettings.MOBILE;
        //else {
        //    setting = PocketCode.Ui.PlayerToolbarSettings.DESKTOP;
        //    // menuOffset = '10%';
        //}

        //this._viewport = new PocketCode.PlayerViewportController()._view; //TODO: a controller instance in a view?
        //this._viewport.style.merge({"margin-left":menuOffset});
        //this._toolbar = new PocketCode.Ui.PlayerToolbar(setting);    //TODO: ctr settings
        this._startScreen = new PocketCode.Ui.PlayerStartScreen();
        this.appendChild(this._startScreen);
        this._startScreen.hide();
        //this._initPageLayout();
    }

    //properties
    Object.defineProperties(PlayerPageView.prototype, {
        executionState: {
            set: function (value) {
                this._toolbar.executionState = value;
            },
        },
        axesButtonChecked: {
            set: function (value) {
                this._toolbar.axesButtonChecked = value;
            },
        },
        backButtonDisabled: {
            set: function (value) {
                this._toolbar.backButtonDisabled = value;
            },
        },
        screenshotButtonDisabled: {
            set: function (value) {
                this._toolbar.screenshotButtonDisabled = value;
            },
        },
    });

    //events
    Object.defineProperties(PlayerPageView.prototype, {
        onToolbarButtonClicked: {
            get: function () {
                return this._toolbar.onButtonClicked;
            },
        },
    });

    //methods
    PlayerPageView.prototype.merge({
        //_initPageLayout: function() {
        //    //this.appendChild(this._viewport); //TODO: add a view and not the controller
        //    //this.appendChild(this._toolbar);
        //    // this.appendChild(this._startScreen);
        //},
        /* override */    //this is a test->remove this
        //show: function () {
        //    //?
        //},
    });

    return PlayerPageView;
})();
