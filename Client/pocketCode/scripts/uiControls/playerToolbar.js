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
        BACK: 2,//{ command: 2, },
        RESTART: 3,//{ command: 3, },
        PLAY: 4,//{ command: 4, },
        PAUSE: 5,//{ command: 5, },
        SCREENSHOT: 6,//{ command: 6, },
        AXES: 7,//{ command: 7, },
    },

    PlayerToolbar: (function () {
        PlayerToolbar.extends(PocketCode.Ui.I18nControl, false);

        function PlayerToolbar(settings) {
            if (!settings || !settings.orientation)
                throw new Error('invalif argument: cntr settings');

            PocketCode.Ui.I18nControl.call(this, 'div', { className: 'pc-playerMenu' + settings.orientation.toUpperCase() + ' pc-overlay' });

            //internal settings (for scaling)
            this._defaultHeight = 455;  //all buttons at 10px font-size
            this._defaultWidth = 371;

            if (settings.position == 'bi') { //with green background
                this._overlay = new SmartJs.Ui.Control('div', { className: 'pc-playerMenuOverlay' });
                this._overlayBtn = new SmartJs.Ui.Control('div', { className: 'pc-playerMenuPlayOverlay' });
                this._overlayBtn._dom.appendChild(document.createElement('div'));

                this._appendChild(this._overlay);
                this._appendChild(this._overlayBtn);
            }

            this._menuContainer = new SmartJs.Ui.ContainerControl('div', { className: 'pc-playerMenuContainer' });
            if (settings.position == 'lo') {
                //TODO: check for bug: this._menuContainer.addClassName('pc-playerMenuOutside');
                this._menuContainer.className + 'pc-playerMenuContainer pc-playerMenuOutside';
            }
            this._menuContainerAlign = new SmartJs.Ui.ContainerControl('div', { className: 'pc-alignedCell' });
            this._menuContainer.appendChild(this._menuContainerAlign);
            this._appendChild(this._menuContainer);

            //btns
            this._backButton = new PocketCode.Ui.PlayerSvgButton(PocketCode.Ui.SvgImageString.BACK, 'Back');
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
            this._screenshotButton.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) { this.onButtonClicked.dispatchEvent({ command: PocketCode.Ui.PlayerBtnCommand.SCREENSHOT }); }, this));
            this._menuContainerAlign.appendChild(this._screenshotButton);
            this._axesButton = new PocketCode.Ui.PlayerSvgButton(PocketCode.Ui.SvgImageString.AXES, 'Axes');
            this._axesButton.onClick.addEventListener(new SmartJs.Event.EventListener(function (e) { this.onButtonClicked.dispatchEvent({ command: PocketCode.Ui.PlayerBtnCommand.AXES }); }, this));
            this._menuContainerAlign.appendChild(this._axesButton);

            this.executionState = PocketCode.ExecutionState.STOPPED;
            this.onResize.addEventListener(new SmartJs.Event.EventListener(this._resizeHandler, this));
            //events
            this._onButtonClicked = new SmartJs.Event.Event(this);
        }

        //properties
        Object.defineProperties(PlayerToolbar.prototype, {
            executionState: {
                set: function (value) {
                    //this._executionState = value;
                    //this._updateExecutionState();
                    switch (value) {
                        case PocketCode.ExecutionState.RUNNING:
                            this._playButton.hide();
                            this._pauseButton.show();
                            break;
                        default:
                            this._playButton.show();
                            this._pauseButton.hide();
                            break;
                    }
                },
            },
            axesButtonChecked: {
                set: function (value) {
                    this._axesButton.checked = value;
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
            /* override */
            hide: function() {
                //this.hideBrowseProjectsButton();
                SmartJs.Ui.Control.prototype.hide.call(this);
            },
            /* override */
            show: function() {
                //this.hideBrowseProjectsButton();
                SmartJs.Ui.Control.prototype.hide.call(this);
            },
            //showBrowseProjectsButton: function () {
            //    //shows a button "browse other projects" to be called on project onExecuted event
            //},
            //hideBrowseProjectsButton: function() {

            //},
            //_createMenuBackground: function (container) {
            //    return container;   //TODO: 
            //    //returns inner container where the buttons have to be placed in
            //},
            //_createMenuButtons: function(container) {

            //},
            //_updateExecutionState: function () {

            //    //show text start/resume and button start or Pause
            //},
            _resizeHandler: function (args) {

            },
        });

        return PlayerToolbar;
    })(),

});

