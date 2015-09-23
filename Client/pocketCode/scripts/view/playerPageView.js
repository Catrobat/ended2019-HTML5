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
        if (SmartJs.Device.isIOs || SmartJs.Device.isFirefoxOS) //devices with no hardware back button
            this._toolbar = new PocketCode.Ui.PlayerToolbar(PocketCode.Ui.PlayerToolbarSettings.MOBILE_IOS);
        else if (SmartJs.Device.isMobile)
            this._toolbar = new PocketCode.Ui.PlayerToolbar(PocketCode.Ui.PlayerToolbarSettings.MOBILE);
        else {
            this._toolbar = new PocketCode.Ui.PlayerToolbar(PocketCode.Ui.PlayerToolbarSettings.DESKTOP);
            //this._toolbar.hide();
        }
        this.appendChild(this._toolbar);

        this._startScreen = new PocketCode.Ui.PlayerStartScreen();
        this.appendChild(this._startScreen);
        this._startScreen.hide();

        this.disabled = true;
    }

    //properties
    Object.defineProperties(PlayerPageView.prototype, {
        executionState: {
            set: function (value) {
                this._toolbar.executionState = value;
            },
        },
        disabled: {
            set: function (value) {
                this._toolbar.disabled = value;
                this._startScreen.startEnabled = !value;
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
        onStartClicked: {
            get: function () {
                return this._startScreen.onStartClicked;
            },
        },
    });

    //methods
    PlayerPageView.prototype.merge({
        showStartScreen: function (title, thumbnailUrl) {
            this._startScreen.title = title;
            this._startScreen.previewImage = thumbnailUrl;
            this._startScreen.setProgress(0);
            this._startScreen.show();
        },
        hideStartScreen:function() {
            this._startScreen.hide();
        },
        updateLoadingProgress: function (progress) {
            this._startScreen.setProgress(progress);
        },
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
