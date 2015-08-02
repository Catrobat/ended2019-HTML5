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
    function PlayerSvgButton(icon, text, big) {
        PocketCode.Ui.I18nControl.call(this, 'button');

        this.className = 'pc-playerButton';
        if (big)
            this.addClassName('pc-menuBigButton');

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
        disabled: {
            get: function () {
                return this._dom.disabled;
            },
            set: function (value) {
                this._dom.disabled = value;
            },
        },
        checked: {
            get: function() {
                var domClasses = this._dom.className.split(/\s+/);
                var lookupClass = 'pc-playerButtonChecked';
                for (var i = 0, l = domClasses.length; i < l; i++)
                    if (domClasses[i] === lookupClass)
                        return true;

                return false;
            },
            set: function (value) {
                if (value)
                    this._dom.addClassName('pc-playerButtonChecked');
                else
                    this._dom.removeClassName('pc-playerButtonChecked');
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

