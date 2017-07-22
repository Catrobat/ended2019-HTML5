'use strict';
/**
 * Created by alexandra on 25.06.17.
 */
PocketCode.View = PocketCode.View || {};

PocketCode.View.BrickType = {
    EVENT: 0,
    CONTROL: 1,
    MOTION: 2,
    SOUND: 3,
    LOOK: 4,
    PEN: 5,
    DATA: 6,
    USER: 7,
}

PocketCode.View.BaseBrick = (function(){
    BaseBrick.extends(SmartJs.Ui.Control, false);

    function BaseBrick(type, commentedOut, content) {
        SmartJs.Ui.Control.call(this, 'li', {className: 'pc-brick pc-brickType' + type});

        this._brickType = type;
        this._commentedOut = commentedOut;

        this._createAndAppend(content.content);

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

            this._background = new SmartJs.Ui.ContainerControl({className : 'pc-brickBgContainer'}); //position: absolute
            this._appendChild(this._background);

            var item;
            for (var i = 0, l= content.length; i < l; i++) {
                var obj = content[i];

                switch (obj.type) {
                    case 'text':
                        item = new PocketCode.Ui.I18nTextNode(obj.i18n);
                        this._background._appendChild(item);
                        break;
                    case 'lf':
                        item = new SmartJs.Ui.Control('br');
                        this._background._appendChild(item);
                        break;
                    case 'formula':
                        item = new PocketCode.brickFormula(obj.value);
                        item.onClick.addEventListener(new SmartJs.Event.EventListener(this._formulaOnClickHandler, this));
                        this._background._appendChild(item);
                        break;
                    case 'select':
                        item = new PocketCode.brickSelect(obj.value);
                        item.onClick.addEventListener(new SmartJs.Event.EventListener(this._selectOnClickHandler, this));
                        this._background._appendChild(item);
                        break;
                }
            }
        }
    });

    return BaseBrick;
})();