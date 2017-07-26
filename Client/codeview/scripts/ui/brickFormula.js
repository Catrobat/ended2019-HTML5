'use strict';

PocketCode.BrickFormulaItem = (function () {
    BrickFormulaItem.extends(SmartJs.Ui.Control, false);

    function BrickFormulaItem(value, isI18n, propObject) {
        SmartJs.Ui.Control.call(this, 'span', propObject);

        if(isI18n) {
            this._textNode = new PocketCode.Ui.I18nTextNode(value);
        }
        else {
            this._textNode = new SmartJs.Ui.TextNode(value);
        }
        this._appendChild(this._textNode);
    }

    return BrickFormulaItem;
})();

PocketCode.BrickFormula = (function () {
    BrickFormula.extends(PocketCode.Ui.Button, false);

    //cntr
    function BrickFormula(i18nKey) {
        PocketCode.Ui.Button.call(this, i18nKey, { className: 'pc-brickFormula' });

        this._textNode = new PocketCode.Ui.I18nTextNode(i18nKey);
        this._removeChild(this._textNode);

        this._goThroughObject(i18nKey);
    }

    //properties
    Object.defineProperties(BrickFormula.prototype, {

    });

    //methods
    BrickFormula.prototype.merge({
        _goThroughObject: function (i18nKey) {
            switch(i18nKey.type){
                case 'OPERATOR':
                    if(i18nKey.left != undefined){
                        this._goThroughObject(i18nKey.left);
                    }

                    PocketCode.BrickFormulaItem(i18nKey.i18nKey, true);

                    if(i18nKey.right != undefined){
                        this._goThroughObject(i18nKey.right);
                    }
                    break;
                case 'FUNCTION':
                    this._addTypeFunction(i18nKey);
                    break;
                case 'NUMBER':
                    PocketCode.BrickFormulaItem(i18nKey.value, false);
                    break;
                case 'SENSOR':
                    PocketCode.BrickFormulaItem(i18nKey.i18nKey, true);
                    break;
                case 'USER_VARIABLE':
                    //todo
                    break;
                case 'USER_LIST':
                    //todo
                    break;
                case 'BRACKET':
                    //todo
                    break;
                case 'STRING':
                    //todo
                    break;
                case 'COLLISION_FORMULA':
                    //todo
                    break;
                }
        },
        _addTypeFunction: function (i18nKey) {
            if(i18nKey.left != undefined && i18nKey.right == undefined){

                PocketCode.BrickFormulaItem(i18nKey.i18nKey, true);
                PocketCode.BrickFormulaItem("(", false);

                this._goThroughObject(i18nKey.left);

                PocketCode.BrickFormulaItem(")", false);
            }
            else if(i18nKey.left != undefined && i18nKey.right != undefined){

                PocketCode.BrickFormulaItem(i18nKey.i18nKey, true);
                PocketCode.BrickFormulaItem("(", false);

                this._goThroughObject(i18nKey.left);

                PocketCode.BrickFormulaItem(",", false);

                this._goThroughObject(i18nKey.right);

                PocketCode.BrickFormulaItem(")", false);
            }
            else if(i18nKey.left == undefined && i18nKey.right == undefined){
                PocketCode.BrickFormulaItem(i18nKey.i18nKey, true);
            }
        }

    });

    return BrickFormula;
})();