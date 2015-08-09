/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../core.js" />
/// <reference path="../ui.js" />
'use strict';

PocketCode.Ui.Button = (function () {
    Button.extends(PocketCode.Ui.I18nControl, false);

    //cntr
    function Button(text, args) {
        PocketCode.Ui.I18nControl.call(this, 'button', args);

        this._textNode = new SmartJs.Ui.TextNode(text);
        this._dom.appendChild(this._textNode._dom);
        //events
        this._onClick = new SmartJs.Event.Event(this);
        this._addDomListener(this._dom, 'click', this._clickHandler);
    }

    //properties
    Object.defineProperties(Button.prototype, {
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
    });

    //events
    Object.defineProperties(Button.prototype, {
        onClick: {
            get: function () {
                return this._onClick;
            },
        },
    });

    //methods
    Button.prototype.merge({
        _clickHandler: function (e) {
            this._onClick.dispatchEvent();
        },
    });

    return Button;
})();


PocketCode.Ui.PlayerSvgButton = (function () {
    PlayerSvgButton.extends(PocketCode.Ui.Button, false);

    //cntr
    function PlayerSvgButton(icon, text, big) {
        PocketCode.Ui.Button.call(this, text, { className: 'pc-playerButton' });

        //this.className = 'pc-playerButton';
        if (big)
            this.addClassName('pc-menuBigButton');

        if (!icon)
            throw new Error('invalid argument: icon');

        this._textNode = new SmartJs.Ui.TextNode(text);
        var span = document.createElement('span');
        span.appendChild(this._textNode._dom);
        this._dom.innerHTML = icon;
        this._dom.appendChild(span);
    }

    //properties
    Object.defineProperties(PlayerSvgButton.prototype, {
        checked: {
            get: function () {
                var domClasses = this._dom.className.split(/\s+/);
                var lookupClass = 'pc-playerButtonChecked';
                for (var i = 0, l = domClasses.length; i < l; i++)
                    if (domClasses[i] === lookupClass)
                        return true;

                return false;
            },
            set: function (value) {
                if (value)
                    this.addClassName('pc-playerButtonChecked');
                else
                    this.removeClassName('pc-playerButtonChecked');
            },
        },
    });

    return PlayerSvgButton;
})();

