'use strict';
/**
 * Created by alexandra on 25.06.17.
 */
PocketCode.View = PocketCode.View || {};

PocketCode.View.BrickType = {
    EVENT: {
        name: 'Event',  //TODO: add some colors, effects (gradients), .. we need for drawing bricks
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

PocketCode.View.BaseBrick = (function(){
    BaseBrick.extends(SmartJs.Ui.Control, false);

    function BaseBrick(type, commentedOut, content) {
        SmartJs.Ui.Control.call(this, 'li', {className: 'pc-brick pc-brickType' + type.name});

        this._brickType = type;
        this._commentedOut = commentedOut;

        this._createAndAppend(content.content);

        this._background = new SmartJs.Ui.ContainerControl({ className: 'pc-brickBgContainer' }); //position: absolute
        this._appendChild(this._background);
        this._drawBackground();
    }

    //properties
    Object.defineProperties(BaseBrick.prototype, {
        commentedOut: {
            get: function() {
                return this._commentedOut;
            },
            set: function(value) {
                this._commentedOut = value;
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

        showIndents: function(bool) {

        },

        //to override in derived classes
        _drawBackground: function() {
            //use: brickTpe, commentedOut, ...
        },

        _createAndAppend: function(content) {

            var container = new SmartJs.Ui.ContainerControl({ className: 'pc-brickHeader' });

            var item;
            for (var i = 0, l= content.length; i < l; i++) {
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
                        item = new PocketCode.CodeView.Ui.BrickSelect(obj.value);
                        item.onClick.addEventListener(new SmartJs.Event.EventListener(this._selectOnClickHandler, this));
                        container.appendChild(item);
                        break;
                }
            }
            this._appendChild(container);
        }
    });

    return BaseBrick;
})();
