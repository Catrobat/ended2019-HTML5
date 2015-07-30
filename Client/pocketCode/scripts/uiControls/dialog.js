/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../core.js" />
'use strict';


/**
 * dialog dialog types
 * @type {{DEFAULT: string, WARNING: string, ERROR: string}}
 */
PocketCode.DialogType = {
    DEFAULT: 0,
    WARNING: 1,
    ERROR: 2,
};

PocketCode.Ui.Dialog = (function () {
    Dialog.extends(SmartJs.Ui.Control, false);

    //cntr
    function Dialog(type, caption) {//, headerText, bodyText, footerText) {
        SmartJs.Ui.Control.call(this, 'div');

        this._createLayout();

        this._type = type || PocketCode.DialogType.DEFAULT;
        this.type = this._type;

        if (caption) {
            this.caption = caption;
        }
        //if (!type)
        //    type = PocketCode.DialogType.DEFAULT;
        //this.type = type;

        //if (headerText === '')
        //    throw new Error('Empty dialog Header Text');
        //if (bodyText === '')
        //    throw new Error('Empty dialog Body Text');
        //if (footerText === '')
        //    throw new Error('Empty dialog Footer Text');

        //events
        this._onButtonClicked = new SmartJs.Event.Event(this);
    }

    //properties
    Object.defineProperties(Dialog.prototype, {
        type: {
            get: function () {
                return this._type;
            },
            set: function (value) {
                switch (value) {
                    case PocketCode.DialogType.DEFAULT:
                        this._dom.className = 'pc-dialog pc-dialogDefaultBorder';
                        break;
                    case PocketCode.DialogType.WARNING:
                        this._dom.className = 'pc-dialog pc-dialogWarningBorder';
                        break;
                    case PocketCode.DialogType.ERROR:
                        this._dom.className = 'pc-dialog pc-dialogErrorBorder';
                        break;
                    default:
                        throw new Error('invalid argument: dialog type');
                }
                this._type = value;
            },
        },
        caption: {
            get: function () {
                return this._captionTextNode.text;
            },
            set: function (value) {
                if (typeof value !== 'string')
                    throw new error('invalid argument: caption: expected type = string');
                this._captionTextNode.text = value;
            },
        },
        bodyInnerHTML: {
            get: function () {
                return this._bodyContainer.innerHTML;
            },
            set: function (value) {
                this._bodyContainer.innerHTML = value;
            },
        },
        footerInnerHTML: {
            get: function () {
                return this._footerContainer.innerHTML;
            },
            set: function (value) {
                this._footerContainer.innerHTML = value;
            },
        },
    });

    //events
    Object.defineProperties(Dialog.prototype, {
        onButtonClicked: {
            get: function () {
                return this._onButtonClicked;
            },
        }
    });

    //methods
    Dialog.prototype.merge({
        _createLayout: function() {
            //add header, body and footer:

            // ---- HEADER ----
            var dialogHeaderRow = document.createElement('div');
            dialogHeaderRow.className = 'pc-webLayoutRow';
            var dialogHeader = document.createElement('div');
            dialogHeader.className = 'pc-dialogHeader';
            this._captionTextNode = new SmartJs.Ui.TextNode('');
            if (caption)
                this.caption = caption;

            //dialogHeader.innerHTML = headerText;
            dialogHeaderRow.appendChild(dialogHeader);
            // ---- ------ ----

            // ---- BODY ----
            var dialogBodyRow = document.createElement('div');
            dialogBodyRow.className = 'pc-webLayoutRow';
            this._bodyContainer = document.createElement('div');
            this._bodyContainer.className = 'pc-dialogBody';
            //this._bodyContainer.innerHTML = bodyText;
            dialogBodyRow.appendChild(this._bodyContainer);
            // ---- ---- ----

            // ---- FOOTER ----
            var dialogFooterRow = document.createElement('div');
            dialogFooterRow.className = 'pc-webLayoutRow';
            this._footerContainer = document.createElement('div');
            this._footerContainer.className = 'pc-dialogFooter';
            //this._footerContainer.innerHTML = footerText;
            dialogFooterRow.appendChild(this._footerContainer);
            // ---- ------ ----

            // add elements to dialogContainer div
            this._dom.appendChild(dialogHeaderRow);
            this._dom.appendChild(dialogBodyRow);
            this._dom.appendChild(dialogFooterRow);
        }
    });

    return Dialog;
})();

