'use strict';

PocketCode.CodeView.Ui.BrickFormula = (function () {
    BrickFormula.extends(PocketCode.Ui.Button, false);

    //cntr
    function BrickFormula(i18nKey) {
        PocketCode.Ui.Button.call(this, i18nKey, { className: 'pc-brickFormulaItem' });

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
            switch (i18nKey.type) {
                case 'OPERATOR':
                    if (i18nKey.left != undefined) {
                        this._goThroughObject(i18nKey.left);
                    }

                    PocketCode.BrickTextItem(i18nKey.i18nKey, true);

                    if (i18nKey.right != undefined) {
                        this._goThroughObject(i18nKey.right);
                    }
                    break;
                case 'FUNCTION':
                    this._addTypeFunction(i18nKey);
                    break;
                case 'NUMBER':
                    PocketCode.BrickTextItem(i18nKey.value, false);
                    break;
                case 'SENSOR':
                    PocketCode.BrickTextItem(i18nKey.i18nKey, true);
                    break;
                case 'USER_VARIABLE':
                    //todo variable id
                    PocketCode.BrickTextItem("\"", false);
                    PocketCode.BrickTextItem(i18nKey.objRef.name, false);
                    this._goThroughObject(i18nKey.right);
                    PocketCode.BrickTextItem("\"", false);
                    break;
                case 'USER_LIST':
                    //todo list  id
                    PocketCode.BrickTextItem("*", false);
                    PocketCode.BrickTextItem(i18nKey.objRef.name, false);
                    PocketCode.BrickTextItem("*", false);
                    break;
                case 'BRACKET':
                    PocketCode.BrickTextItem("(", false);
                    this._goThroughObject(i18nKey.right);
                    PocketCode.BrickTextItem(")", false);
                    break;
                case 'STRING':
                    PocketCode.BrickTextItem(i18nKey.value, false);
                    break;
                case 'COLLISION_FORMULA':
                    PocketCode.BrickTextItem("formula_editor_function_collision", true);
                    PocketCode.BrickTextItem("(", false);
                    var sprite_id = i18nKey.objRef.id;
                    var scene = null; //todo: get scene
                    var sprite_name = scene.getSpriteById(sprite_id);
                    PocketCode.BrickTextItem(sprite_name.name, false);
                    PocketCode.BrickTextItem(")", false);
                    break;
            }
        },
        _addTypeFunction: function (i18nKey) {
            if (i18nKey.left != undefined && i18nKey.right == undefined) {

                PocketCode.BrickTextItem(i18nKey.i18nKey, true);
                PocketCode.BrickTextItem("(", false);

                this._goThroughObject(i18nKey.left);

                PocketCode.BrickTextItem(")", false);
            }
            else if (i18nKey.left != undefined && i18nKey.right != undefined) {

                PocketCode.BrickTextItem(i18nKey.i18nKey, true);
                PocketCode.BrickTextItem("(", false);

                this._goThroughObject(i18nKey.left);

                PocketCode.BrickTextItem(",", false);

                this._goThroughObject(i18nKey.right);

                PocketCode.BrickTextItem(")", false);
            }
            else if (i18nKey.left == undefined && i18nKey.right == undefined) {
                PocketCode.BrickTextItem(i18nKey.i18nKey, true);
            }
        }

    });

    return BrickFormula;
})();
