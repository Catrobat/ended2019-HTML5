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
        DESKTOP: { orientation: 'h', position: 'lo', hideable: false, animatedShowHide: false, hideOnStart: false, showOnGesture: false },
        MOBILE: { orientation: 'v', position: 'bi', hideable: true, animatedShowHide: true, hideOnStart: false, showOnGesture: false },
        MOBILE_IOS: { orientation: 'v', position: 'bi', hideable: true, animatedShowHide: true, hideOnStart: true, showOnGesture: true },
    },

    PlayerEventArguments: {
        BACK: { command: 2, },
        RESTART: { command: 3, },
        PLAY: { command: 4, },
        PAUSE: { command: 5, },
        SCREENSHOT: { command: 6, },
        AXES: { command: 7, },
    },

    PlayerToolbar: (function () {
        PlayerToolbar.extends(PocketCode.Ui.I18nControl, false);

        function PlayerToolbar(settings) {
            var div = document.createElement('div');
            var innerContainer = div;

            if (settings.position == 'bi') { //with green background
                innerContainer = this._createMenuBackground(div);
            }

            if (settings.position == 'lo' || settings.position == 'bi') {
                this._createMenuButtons(innerContainer);
            }
            else
                throw new Error('Unsupported setting: position');

            //base ctr is called after creating the menus base container
            PocketCode.Ui.I18nControl.call(this, div);

            this.executionState = PocketCode.ExecutionState.STOPPED;
            this.onResize.addEventListener(new SmartJs.Event.EventListener(this._resizeHandler, this));
            //events
            this._onButtonClicked = new SmartJs.Event.Event(this);
        }

        //properties
        Object.defineProperties(PlayerToolbar.prototype, {
            executionState: {
                set: function (value) {
                    this._executionState = value;
                    this._updateExecutionState();
                },
            }
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
            hide: function() {
                this.hideBrowseProjectsButton();
                SmartJs.Ui.Control.prototype.hide.call(this);
            },
            showBrowseProjectsButton: function () {
                //shows a button "browse other projects" to be called on project onExecuted event
            },
            hideBrowseProjectsButton: function() {

            },
            _createMenuBackground: function (container) {
                return container;   //TODO: 
                //returns inner container where the buttons have to be placed in
            },
            _createMenuButtons: function(container) {

            },
            _updateExecutionState: function () {
                //show text start/resume and button start or Pause
            },
            _resizeHandler: function (args) {

            },
        });

        return PlayerToolbar;
    })(),

});

