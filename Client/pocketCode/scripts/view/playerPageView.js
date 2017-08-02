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


        if (SmartJs.Device.isIOs || SmartJs.Device.isFirefoxOS) //devices with no hardware back button
            this._toolbar = new PocketCode.Ui.PlayerToolbar(PocketCode.Ui.PlayerToolbarSettings.MOBILE_IOS);
        else if (SmartJs.Device.isMobile)
            this._toolbar = new PocketCode.Ui.PlayerToolbar(PocketCode.Ui.PlayerToolbarSettings.MOBILE);
        else {
            this._toolbar = new PocketCode.Ui.PlayerToolbar(PocketCode.Ui.PlayerToolbarSettings.DESKTOP);
        }

        this.appendChild(this._toolbar);
        if (PocketCode.Player.Ui.Menu) {    //only loaded for player
            this._menu = new PocketCode.Player.Ui.Menu();
            if (SmartJs.Device.isMobile)
                this.appendChild(this._menu);
            else //desktop
                this.onResize.addEventListener(new SmartJs.Event.EventListener(function () { this._menu.verifyResize(); }, this));
        }
        this._startScreen = new PocketCode.Ui.PlayerStartScreen();
        this.appendChild(this._startScreen);
        this._startScreen.hide();

        this.disabled = true;

        this._onExit = new SmartJs.Event.Event(this);
    }

    //properties
    Object.defineProperties(PlayerPageView.prototype, {
        menu: {
            get: function () {
                return this._menu;
            },
        },
        executionState: {
            get: function () {
                return this._toolbar.executionState;
            },
            set: function (value) {
                this._toolbar.executionState = value;
                if (SmartJs.Device.isMobile) {
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
        onToolbarButtonClicked: {
            get: function () {
                return this._toolbar.onButtonClicked;
            },
        },
        onMenuAction: {
            get: function () {
                if (this._menu)
                    return this._menu.onMenuAction;
                else
                    return new SmartJs.Event.Event(this);   //create event object if no menu is defined
            },
        },
        onMenuOpen: {
            get: function () {
                if (this._menu)
                    return this._menu.onOpen;
                else
                    return new SmartJs.Event.Event(this);   //create event object if no menu is defined
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
                this._startScreen.previewImage = 'https://share.catrob.at/images/default/screenshot.png';
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
        closeMenu: function () {
            this._menu.close();
        },
    });

    return PlayerPageView;
})();
