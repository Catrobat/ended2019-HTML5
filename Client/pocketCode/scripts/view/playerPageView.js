/// <reference path="../core.js" />
/// <reference path="../components/gameEngine.js" />
/// <reference path="../ui/playerStartScreen.js" />
/// <reference path="../ui/playerToolbar.js" />
/// <reference path="playerViewportView.js" />
'use strict';

PocketCode.Ui.PlayerPageView = (function () {
    PlayerPageView.extends(PocketCode.Ui.PageView, false);

    function PlayerPageView() {
        PocketCode.Ui.PageView.call(this);  //even if we do not pass argument, ui is built in the constructor so we have to call the ctr to reinit
        if (SmartJs.Device.isMobile) {
            var exitBtn = new PocketCode.Ui.PlayerSvgButton(PocketCode.Ui.SvgImageString.BACK, 'lblExit');
            exitBtn.className = 'pc-webButton pc-backButton pc-rtl';
            exitBtn.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) {
                this._onExit.dispatchEvent();
            }, this));
            this._header.appendChild(exitBtn);
            this._header.style.padding = '8px';
        }
        else
            this._header.hide();
        this._footer.hide();
        this._menu = undefined;

        if (SmartJs.Device.isIOs || SmartJs.Device.isFirefoxOS) //devices with no hardware back button
            this._toolbar = new PocketCode.Ui.PlayerToolbar(PocketCode.Ui.PlayerToolbarSettings.MOBILE_IOS);
        else if (SmartJs.Device.isMobile)
            this._toolbar = new PocketCode.Ui.PlayerToolbar(PocketCode.Ui.PlayerToolbarSettings.MOBILE);
        else {
            this._toolbar = new PocketCode.Ui.PlayerToolbar(PocketCode.Ui.PlayerToolbarSettings.DESKTOP);
        }

        this.appendChild(this._toolbar);
        this._startScreen = new PocketCode.Ui.PlayerStartScreen();
        this.appendChild(this._startScreen);
        this._startScreen.hide();

        this.disabled = true;

        this._onExit = new SmartJs.Event.Event(this);
    }

    //properties
    Object.defineProperties(PlayerPageView.prototype, {
        menu: {
            set: function (menu) {
                if (!(menu instanceof PocketCode.Ui.Menu))
                    throw new Error('invalid setter argument: menu');
                if (this._menu)
                    this.removeChild(this._menu);
                this._menu = menu;
                this.appendChild(menu);
            }
        },
        executionState: {
            get: function () {
                return this._toolbar.executionState;
            },
            set: function (value) {
                this._toolbar.executionState = value;
                if (this._menu) {   //SmartJs.Device.isMobile) {
                    switch (value) {
                        case PocketCode.ExecutionState.PAUSED:
                        case PocketCode.ExecutionState.STOPPED:
                            this._menu.show();
                            break;
                        default:
                            this._menu.hide();
                            break;
                    }
                }
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
        axesButtonDisabled: {
            set: function (value) {
                this._toolbar.axesButtonDisabled = value;
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
        onToolbarButtonClick: {
            get: function () {
                return this._toolbar.onButtonClick;
            },
        },
        onStartClicked: {
            get: function () {
                return this._startScreen.onStartClicked;
            },
        },
        onExitClicked: {
            get: function () {
                return this._onExit;
            },
        },
    });

    //methods
    PlayerPageView.prototype.merge({
        showStartScreen: function (title, thumbnailUrl) {
            this._startScreen.title = title;
            if (thumbnailUrl == "null")
                this._startScreen.previewImage = PocketCode.domain + 'images/default/screenshot.png';
            else if (thumbnailUrl)
                this._startScreen.previewImage = thumbnailUrl;

            this._startScreen.setProgress(0);
            this._startScreen.show();
        },
        hideStartScreen: function () {
            this._startScreen.hide();
            this.hideHeader();
        },
        setLoadingProgress: function (progress) {
            this._startScreen.setProgress(progress);
        },
    });

    return PlayerPageView;
})();
