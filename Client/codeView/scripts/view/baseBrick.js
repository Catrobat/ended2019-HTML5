'use strict';

PocketCode.View = PocketCode.View || {};


PocketCode.View.BrickType = {
    EVENT: {
        name: 'Event',  //TODO: add some colors, effects (gradients), .. we need for drawing bricks
        //TODO gradient: '<linearGradient id="brick_1_" gradientUnits="userSpaceOnUse" x1="174" y1="59.8125" x2="174" y2="2"><stop offset="0" style="stop-color:#AF4B16"/><stop offset="0.5" style="stop-color:#CF5717"/></linearGradient>',
    },
    CONTROL: {
        name: 'Control',
    },
    MOTION: {
        name: 'Motion',
    },
    SOUND: {
        name: 'Sound',
    },
    LOOK: {
        name: 'Look',
    },
    PEN: {
        name: 'Pen',
    },
    DATA: {
        name: 'Data',
    },
    USERSCRIPT: {
        name: 'UserScript',
    },
    UNSUPPORTED: {
        name: 'Control', //'Unsupported',
    },
};

PocketCode.View.BaseBrick = (function () {
    BaseBrick.extends(SmartJs.Ui.Control, false);

    function BaseBrick(type, commentedOut, content, isEndBrick) {
        SmartJs.Ui.Control.call(this, 'li', { className: 'pc-brick pc-brick' + type.name });

        this._brickType = type;
        this._selectable = true;
        this._commentedOut = commentedOut;
        //this._isEndBrick = false;   //default
        this.isEndBrick = !!isEndBrick;    //scripts, forever-loop, stopScript/s?, ..
        this._debugButton = new PocketCode.CodeView.Ui.BrickDebugButton();
        this._appendChild(this._debugButton);

        this._createAndAppend(content.content);
        this._select = new PocketCode.Ui.I18nCheckbox('', false, { className: 'pc-checkbox pc-brickSelect' });
        this._childs[1].insertAt(0, this._select);
        this._onResize.addEventListener(new SmartJs.Event.EventListener(this._onResizeHandler, this));
    }

    //properties
    Object.defineProperties(BaseBrick.prototype, {
        selectable: {
            set: function (value) {
                this._selectable = value;
                //todo: add a public event for checked/unchecked (selected) or general serAction -> as soon as needed
            },
        },
        commentedOut: {
            get: function () {
                return this._commentedOut;
            },
            set: function (value) {
                this._commentedOut = value;
                //todo
            },
        },
        isEndBrick: {
            set: function (value) {
                this._isEndBrick = !!value;
                if (!!value)
                    this.addClassName('pc-endBrick');
                else
                    this.removeClassName('pc-endBrick');
                //todo
            },
        },
    });

    //methods
    BaseBrick.prototype.merge({
        _selectOnClickHandler: function (e) {
            //todo
        },
        _formulaOnClickHandler: function (e) {
            //todo
        },
        _onResizeHandler: function(e) {
            this._debugButton.height = this.height;
            this._drawBackground();
        },
        //showIndents: function (bool) {

        //},

        _createAndAppend: function (content, root) {
            var container = new SmartJs.Ui.ContainerControl({ className: 'pc-brickHeader' });

            var item;
            for (var i = 0, l = content.length; i < l; i++) {
                var obj = content[i];

                switch (obj.type) {
                    case 'text':
                        item = new PocketCode.CodeView.Ui.BrickTextItem(obj.i18n, true);
                        container.appendChild(item);
                        break;
                    case 'lf':
                        item = new SmartJs.Ui.Control('br');
                        container.appendChild(item);
                        break;
                    case 'formula':
                        item = new PocketCode.CodeView.Ui.BrickFormula(obj.value);
                        item.onClick.addEventListener(new SmartJs.Event.EventListener(this._formulaOnClickHandler, this));
                        container.appendChild(item);
                        break;
                    case 'select':
                        item = new PocketCode.CodeView.Ui.BrickDropdown(obj.value);
                        item.onClick.addEventListener(new SmartJs.Event.EventListener(this._selectOnClickHandler, this));
                        container.appendChild(item);
                        break;
                }
            }
            if (root instanceof SmartJs.Ui.ContainerControl)
                root.appendChild(container);
            else
                this._appendChild(container);
        },
        //to override in derived classes
        _drawBackground: function () {
            //use: brickTpe, commentedOut, ...

            //test only: check for url encoding in dataUrl: IE
            var svg = '<svg width="16" height="16" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">';
            svg += '<polygon points="2,2 5,2 5,3 3,3 3,9 9,9 9,7 10,7 10,10 2,10"/><polygon points="6.2,2 10,2 10,5.79 8.58,4.37 6.5,6.5 5.5,5.5 7.6,3.4"/>';
            svg += '</svg>';
            var background = 'url(\'data:image/svg+xml;utf8,' + svg + '\')';
            this.style.backgroundImage = background;
        },
    });

    return BaseBrick;
})();
