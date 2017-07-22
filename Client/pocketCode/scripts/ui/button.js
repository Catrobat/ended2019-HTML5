/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../core.js" />
/// <reference path="../ui.js" />
'use strict';

PocketCode.Ui.Button = (function () {
    Button.extends(SmartJs.Ui.Control, false);

    //cntr
    function Button(i18nKey, args) {
        SmartJs.Ui.Control.call(this, 'button', args);

        this._textNode = new PocketCode.Ui.I18nTextNode(i18nKey);
        this._appendChild(this._textNode);

        //events
        this._onClick = new SmartJs.Event.Event(this);
        this._addDomListener(this._dom, 'click', this._clickHandler);
        this._btnListener = this._addDomListener(this._dom, 'touchstart', function (e) { }, { cancelBubble: true, stopPropagation: false, systemAllowed: true });   //allow system events to show css (pressed) on buttons
        //this._addDomListener(this._dom, 'touchend', this._clickHandler, { cancelBubble: true });//function (e) { this._dom.click(); });
    }

    //properties
    Object.defineProperties(Button.prototype, {
        text: {
            get: function () {
                return this._textNode.text;
            },
            //set: function (value) {
            //    this._textNode.text = value;
            //},
        },
        i18nKey: {
            set: function (i18n) {
                this._textNode.i18n = i18n;
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
            this._dom.blur();
            this._onClick.dispatchEvent();
        },
    });

    return Button;
})();


PocketCode.Ui.PlayerSvgButton = (function () {
    PlayerSvgButton.extends(PocketCode.Ui.Button, false);

    //cntr
    function PlayerSvgButton(icon, i18nKey, big, menuButton) {
        PocketCode.Ui.Button.call(this, i18nKey, { className: 'pc-playerButton' });

        if (!icon)
            throw new Error('invalid argument: icon');
        if (big)
            this.addClassName('pc-menuBigButton');
        if(menuButton) {
            this.removeClassName('pc-playerButton');
            this.addClassName('pc-webButton');
        }

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

