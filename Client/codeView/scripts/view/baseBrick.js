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

        for (var key in content) {
            if(key == 'content') { //todo: falsche abfrge?
                this._createAndAppend(content[key], this); //todo param parent???
            }
        }
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
        showIndents: function(bool) {

        },

        //to override in derived classes
        _drawBackground: function() {
            //use: brickTpe, commentedOut, ...
        },

        _createAndAppend: function(content, parent) {

            parent._background = new SmartJs.Ui.ContainerControl({className : 'pc-brickBgContainer'}); //position: absolute
            parent.appendChild(parent._background);

            //todo change content parse
            for (var key in content) {
                var obj = content[key];

                switch (obj.type) {
                    case 'text':
                        parent._textNode = new PocketCode.Ui.I18nTextNode(obj.i18n);
                        parent._background._appendChild(parent._textNode);
                        break;
                    case 'lf':
                        parent._textNode = new PocketCode.Ui.I18nTextNode("\n");
                        parent._background._appendChild(parent._textNode);
                        break;
                    case 'formula':
                        parent._btnFormula = new PocketCode.Ui.Button(obj.value, { className: 'pc-formulaBtn' });
                        parent._background._appendChild(parent._btnFormula); //todo: className??
                        break;
                    case 'select':
                        parent._btnSelect = new PocketCode.Ui.Button(obj.value, { className: 'pc-SelectBtn' });
                        parent._background._appendChild(parent._btnSelect);
                        break;
                }
            }
        },
    });

    return BaseBrick;
});