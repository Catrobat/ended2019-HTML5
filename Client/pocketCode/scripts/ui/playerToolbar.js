/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-components.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../core.js" />
'use strict';

PocketCode.Ui.merge({

    /*
    orientation: h = horizontal, v = vertical
    position: lo = left & outside, bi = bottom & inside
    hideable: indicated if the menu is hidden when starting the game or on other events (e.g. back button, ..)
    hideOnStart: indicates if the menu is shown by default and moved out (animation) during start = for IOS devices (no back button)
    showOnGesture: indicates if the menu is bound to a page event to show it based on gesture events = for IOS devices (no back button)
    */
    PlayerToolbarSettings: {
        DESKTOP: { orientation: 'v', position: 'lo', hideable: false, animatedShowHide: false, hideOnStart: false, showOnGesture: false },
        MOBILE: { orientation: 'h', position: 'bi', hideable: true, animatedShowHide: true, hideOnStart: false, showOnGesture: false },
        MOBILE_IOS: { orientation: 'v', position: 'bi', hideable: true, animatedShowHide: true, hideOnStart: true, showOnGesture: true },
    },

    PlayerBtnCommand: {
        BACK: 2,
        RESTART: 3,
        PLAY: 4,
        PAUSE: 5,
        SCREENSHOT: 6,
        AXES: 7,
    },

    PlayerToolbar: (function () {
        PlayerToolbar.extends(PocketCode.Ui.I18nControl, false);

        function PlayerToolbar(settings) {
            if (!settings || !settings.orientation)
                throw new Error('invalid argument: constructor settings');
            this._settings = settings;

            PocketCode.Ui.I18nControl.call(this, 'div', { className: 'pc-playerMenu' + settings.orientation.toUpperCase() });// + ' pc-overlay' });
            //this._inactiveOverlay = new SmartJs.Ui.Control('div', { className: 'pc-overlay' });
            this._appendChild(new SmartJs.Ui.Control('div', { className: 'pc-overlay' }));//this._inactiveOverlay);

            //internal settings (for scaling)
            this._defaultHeight = 550;  //all buttons at 10px font-size (vertical)
            this._defaultWidth = 374;   //(horizontal)

            if (settings.position == 'bi') { //with green background
                this._overlay = new SmartJs.Ui.Control('div', { className: 'pc-playerMenuOverlay' });
                this._overlayBtn = new SmartJs.Ui.ContainerControl({ className: 'pc-playerMenuPlayOverlay' });
                this._overlayBtn._dom.appendChild(document.createElement('div'));

                if (settings.showOnGesture) {
                    var touchArea = this._overlayBtn._dom;
                    this._addDomListener(touchArea, 'touchstart', this._openMenuTabbedHandler);
                    this._addDomListener(touchArea, 'mousedown', this._openMenuClickedHandler);
                }
                this._appendChild(this._overlay);
                this._appendChild(this._overlayBtn);
            }

            this._menuContainer = new SmartJs.Ui.ContainerControl({ className: 'pc-playerMenuContainer' });
            if (settings.position == 'lo') {
                this._menuContainer.addClassName('pc-playerMenuOutside');
            }
            this._appendChild(this._menuContainer);
            this._menuContainerAlign = new SmartJs.Ui.ContainerControl({ className: 'pc-alignedCell' });
            this._menuContainer.appendChild(this._menuContainerAlign);

            //buttons
            this._backButton = new PocketCode.Ui.PlayerSvgButton(PocketCode.Ui.SvgImageString.BACK, 'Back');
            this._backButtonDisabled = false;
            this._backButton.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) { this.onButtonClicked.dispatchEvent({ command: PocketCode.Ui.PlayerBtnCommand.BACK }); }, this));
            this._menuContainerAlign.appendChild(this._backButton);
            this._restartButton = new PocketCode.Ui.PlayerSvgButton(PocketCode.Ui.SvgImageString.RESTART, 'Restart');
            this._restartButton.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) { this.onButtonClicked.dispatchEvent({ command: PocketCode.Ui.PlayerBtnCommand.RESTART }); }, this));
            this._menuContainerAlign.appendChild(this._restartButton);
            this._playButton = new PocketCode.Ui.PlayerSvgButton(PocketCode.Ui.SvgImageString.PLAY, 'Play', true);
            this._playButton.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) { this.onButtonClicked.dispatchEvent({ command: PocketCode.Ui.PlayerBtnCommand.PLAY }); }, this));
            this._menuContainerAlign.appendChild(this._playButton);
            this._pauseButton = new PocketCode.Ui.PlayerSvgButton(PocketCode.Ui.SvgImageString.PAUSE, 'Pause', true);
            this._pauseButton.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) { this.onButtonClicked.dispatchEvent({ command: PocketCode.Ui.PlayerBtnCommand.PAUSE }); }, this));
            this._menuContainerAlign.appendChild(this._pauseButton);
            this._screenshotButton = new PocketCode.Ui.PlayerSvgButton(PocketCode.Ui.SvgImageString.SCREENSHOT, 'Screenshot');
            this._screenshotButtonDisabled = false;
            this._screenshotButton.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) { this.onButtonClicked.dispatchEvent({ command: PocketCode.Ui.PlayerBtnCommand.SCREENSHOT }); }, this));
            this._menuContainerAlign.appendChild(this._screenshotButton);
            this._axesButton = new PocketCode.Ui.PlayerSvgButton(PocketCode.Ui.SvgImageString.AXES, 'Axes');
            this._axesButton.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) { this.onButtonClicked.dispatchEvent({ command: PocketCode.Ui.PlayerBtnCommand.AXES }); }, this));
            this._menuContainerAlign.appendChild(this._axesButton);

            this.executionState = PocketCode.ExecutionState.STOPPED;
            this._onResize.addEventListener(new SmartJs.Event.EventListener(this._resizeHandler, this)); //TODO: check if handling is necesary twice
            this._onResize.addEventListener(new SmartJs.Event.EventListener(function () { window.setTimeout(this._resizeHandler.bind(this, this), 120); }.bind(this), this));

            //events
            this._onButtonClicked = new SmartJs.Event.Event(this);
        }

        //properties
        Object.defineProperties(PlayerToolbar.prototype, {
            executionState: {
                set: function (value) {
                    switch (value) {
                        case PocketCode.ExecutionState.ERROR:
                            //TODO: disable all buttons? only play + pause?
                            break;
                        case PocketCode.ExecutionState.RUNNING:
                            this._playButton.hide();
                            this._pauseButton.show();
                            this._hideOverlay();
                            break;
                        default:
                            this._pauseButton.hide();
                            this._playButton.show();
                            this._showOverlay();
                            break;
                    }
                },
            },
            /* override */
            //hidden: {
            //    get: function () {
            //        if (this._settings.position == 'lo')    //in desktop mode the toolbar is not hidden, even if the width (overlay) is set to 0
            //            return false;
            //        if (this.height === 0 || this.width === 0)
            //            return true;
            //        return false;
            //    },
            //},
            disabled: {
                set: function (value) {
                    if (typeof value !== 'boolean')
                        throw new Error('invalid argument: expected type: boolean');

                    if (this._backButtonDisabled)
                        this._backButton.disabled = true;
                    else
                        this._backButton.disabled = value;
                    this._restartButton.disabled = value;
                    this._playButton.disabled = value;
                    this._pauseButton.disabled = value;
                    if (this._screenshotButtonDisabled)
                        this._screenshotButton.disabled = true;
                    else
                        this._screenshotButton.disabled = value;
                    this._axesButton.disabled = value;
                },
            },
            axesButtonChecked: {
                set: function (value) {
                    if (typeof value !== 'boolean')
                        throw new Error('invalid argument: expected type: boolean');
                    this._axesButton.checked = value;
                },
            },
            backButtonDisabled: {
                set: function (value) {
                    if (typeof value !== 'boolean')
                        throw new Error('invalid argument: expected type: boolean');
                    this._backButtonDisabled = value;
                    this._backButton.disabled = value;
                },
            },
            screenshotButtonDisabled: {
                set: function (value) {
                    if (typeof value !== 'boolean')
                        throw new Error('invalid argument: expected type: boolean');
                    this._screenshotButtonDisabled = value;
                    this._screenshotButton.disabled = value;
                },
            },
        });

        //events
        Object.defineProperties(PlayerToolbar.prototype, {
            onButtonClicked: {
                get: function () {
                    return this._onButtonClicked;
                },
            }
        });

        //methods
        PlayerToolbar.prototype.merge({
            _openMenuTabbedHandler: function (e) {
                if (PocketCode.ExecutionState.RUNNING)
                    this.onButtonClicked.dispatchEvent({ command: PocketCode.Ui.PlayerBtnCommand.BACK });
                e.preventDefault();
            },
            _openMenuClickedHandler: function(e) {
                if (PocketCode.ExecutionState.RUNNING) {
                    if (e.button == 0) { // left click
                        this.onButtonClicked.dispatchEvent({ command: PocketCode.Ui.PlayerBtnCommand.BACK });
                        e.preventDefault();
                    }
                }
            },
            _resizeHandler: function (args) {
                //if (this.hidden)
                //    return;

                if (this._settings.orientation == 'h') {
                    var fontSize = 10 * this.width / this._defaultWidth;
                    this.style.fontSize = Math.min(fontSize, 12) + 'px';
                }
                else {
                    var fontSize = 10 * this.height / this._defaultHeight;
                    this.style.fontSize = Math.min(fontSize, 13) + 'px';
                }
            },
            _hideOverlay: function () {
                var settings = this._settings;
                if (settings.orientation == 'h')
                    this.style.height = '0px';
                else
                    this.style.width = '0px';

                if (this._overlay)
                    this._overlay.hide();

                if (this._overlayBtn) {
                    if (settings.showOnGesture)
                        this._overlayBtn.addClassName('pc-iOsClosed');
                    else
                        this._overlayBtn.hide();
                }
                        
                if (settings.position !== 'lo')
                    this._menuContainer.hide();
            },
            _showOverlay: function() {
                var settings = this._settings;
                this.style.height = '';
                this.style.width = '';

                if (this._overlay)
                    this._overlay.show();

                if (this._overlayBtn) {
                    this._overlayBtn.removeClassName('pc-iOsClosed');
                    this._overlayBtn.show();
                }
                this._menuContainer.show();
            },
            dispose: function () {
                this._onResize.dispose();
                this._backButton.onClick.removeEventListener(new SmartJs.Event.EventListener(function (e) { this.onButtonClicked.dispatchEvent({ command: PocketCode.Ui.PlayerBtnCommand.BACK }); }, this));
                this._restartButton.onClick.removeEventListener(new SmartJs.Event.EventListener(function (e) { this.onButtonClicked.dispatchEvent({ command: PocketCode.Ui.PlayerBtnCommand.RESTART }); }, this));
                this._playButton.onClick.removeEventListener(new SmartJs.Event.EventListener(function (e) { this.onButtonClicked.dispatchEvent({ command: PocketCode.Ui.PlayerBtnCommand.PLAY }); }, this));
                this._pauseButton.onClick.removeEventListener(new SmartJs.Event.EventListener(function (e) { this.onButtonClicked.dispatchEvent({ command: PocketCode.Ui.PlayerBtnCommand.PAUSE }); }, this));
                this._screenshotButton.onClick.removeEventListener(new SmartJs.Event.EventListener(function (e) { this.onButtonClicked.dispatchEvent({ command: PocketCode.Ui.PlayerBtnCommand.SCREENSHOT }); }, this));
                this._axesButton.onClick.removeEventListener(new SmartJs.Event.EventListener(function (e) { this.onButtonClicked.dispatchEvent({ command: PocketCode.Ui.PlayerBtnCommand.AXES }); }, this));

                PocketCode.Ui.I18nControl.prototype.dispose.call(this);
            },
        });

        return PlayerToolbar;
    })(),

});

