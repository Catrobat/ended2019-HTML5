/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../core.js" />
/// <reference path="../ui.js" />
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
    Dialog.extends(PocketCode.Ui.I18nControl, false);

    //cntr
    function Dialog(type, caption) {
        PocketCode.Ui.I18nControl.call(this, 'div', { className: 'pc-webOverlay' });

        //settings
        this._minHeight = 200;
        this._marginTopBottom = 15;

        //private controls
        this._header = new SmartJs.Ui.ContainerControl({ className: 'pc-dialogHeader' });
        this._captionTextNode = new SmartJs.Ui.TextNode();
        this._header.appendChild(this._captionTextNode);

        this._body = new SmartJs.Ui.ContainerControl({ className: 'pc-dialogBody' });
        this._footer = new SmartJs.Ui.ContainerControl({ className: 'pc-dialogFooter dialogFooterSingleButton' });

        this._createLayout();

        this._type = type || PocketCode.DialogType.DEFAULT;
        this.type = this._type;

        if (caption) {
            this.caption = caption;
        }

        this._onResize.addEventListener(new SmartJs.Event.EventListener(this._resizeHandler, this));
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
                        this._header.className = 'pc-dialogHeader';
                        break;
                    case PocketCode.DialogType.WARNING:
                        this._header.className = 'pc-dialogHeader pc-dialogWarning';
                        break;
                    case PocketCode.DialogType.ERROR:
                        this._header.className = 'pc-dialogHeader pc-dialogError';
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
                return this._body._dom.innerHTML;
            },
            set: function (value) {
                this._body._dom.innerHTML += value;
                this._resizeHandler();  //validate layout 
            },
        },
    });

    //methods
    Dialog.prototype.merge({
        _createLayout: function () {
            var background = document.createElement('div');
            background.className = 'pc-overlay';
            this._dom.appendChild(background);

            var layout = document.createElement('div');
            layout.className = 'pc-webLayout';
            this._dom.appendChild(layout);

            var layoutRow = document.createElement('div');
            layoutRow.className = 'pc-webLayoutRow';
            layout.appendChild(layoutRow);

            var col = document.createElement('div');
            col.className = 'pc-dialogCol';
            layoutRow.appendChild(col);

            var center = document.createElement('div');
            center.className = 'pc-centerCol';
            layoutRow.appendChild(center);

            col = document.createElement('div');
            col.className = 'pc-dialogCol';
            layoutRow.appendChild(col);

            var dialog = document.createElement('div');
            dialog.className = 'pc-dialog';
            center.appendChild(dialog);

            dialog.appendChild(this._header._dom);
            dialog.appendChild(this._body._dom);
            dialog.appendChild(this._footer._dom);
        },
        _resizeHandler: function (e) {
            var availableHeight = this.height - (this._header.height + this._footer.height + 2 * this._marginTopBottom);
            var minHeight = this._minHeight - (this._header.height + this._footer.height);
            if (availableHeight > minHeight)
                this._body.style.maxHeight = availableHeight + 'px';
            else
                this._body.style.maxHeight = minHeight + 'px';
        },
        addButton: function (button) {
            if (!(button instanceof PocketCode.Ui.Button))
                throw new Error('invalid argument: button: expected type PocketCode.Ui.Button');

            var count = this._footer._dom.children.length;
            if (count > 1)
                throw new Error('add button: there are currently 2 buttons supported at max');

            this._footer.appendChild(button);
            if (count == 1)
                this._footer.replaceClassName('dialogFooterSingleButton', 'dialogFooterTwoButtons');
        },
    });

    return Dialog;
})();

