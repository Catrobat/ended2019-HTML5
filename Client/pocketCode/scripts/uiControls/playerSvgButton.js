/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../core.js" />
/// <reference path="../ui.js" />
'use strict';


PocketCode.Ui.PlayerSvgButton = (function () {
    PlayerSvgButton.extends(PocketCode.Ui.I18nControl, false);

    //cntr
    function PlayerSvgButton(icon, text) {
        PocketCode.Ui.I18nControl.call(this, 'button');

        this._createLayout();

        //events
        this._onButtonClicked = new SmartJs.Event.Event(this);
    }

    //properties
    Object.defineProperties(PlayerSvgButton.prototype, {
        icon: {
            get: function () {

            },
            set: function (value) {

            },
        },
        text: {
            get: function () {

            },
            set: function (value) {

            },
        },
    });

    //events
    Object.defineProperties(PlayerSvgButton.prototype, {
        onButtonClicked: {
            get: function () {
                return this._onButtonClicked;
            },
        },
    });

    //methods
    PlayerSvgButton.prototype.merge({
        _createLayout: function () {

        },
    });

    return PlayerSvgButton;
})();

