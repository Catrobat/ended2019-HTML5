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

        this._dom.className = 'pc-playerButton';
        if (!icon)
            throw new Error('invalid argument: icon');
        //this._icon = icon;
        this._textNode = new SmartJs.Ui.TextNode(text);
        var span = document.createElement('span');
        span.appendChild(this._textNode);
        this._dom.appedChild(icon);
        this._dom.appedChild(span);
        //this._createLayout();

        //events
        this._onClick = new SmartJs.Event.Event(this);
        this._addDomListener(this, 'click', this._clickHandler)
    }

    //properties
    Object.defineProperties(PlayerSvgButton.prototype, {
        //icon: {
        //    get: function () {
        //        return this._icon;
        //    },
        //    set: function (value) {
        //        this._icon = value;

        //    },
        //},
        text: {
            get: function () {
                return this._textNode.text;
            },
            set: function (value) {
                this._textNode.text = value;
            },
        },
    });

    //events
    Object.defineProperties(PlayerSvgButton.prototype, {
        onClick: {
            get: function () {
                return this._onClick;
            },
        },
    });

    //methods
    PlayerSvgButton.prototype.merge({
        _clickHandler: function (e) {
            this._onClick.dispatchEvent(e);
        },
    });

    return PlayerSvgButton;
})();

