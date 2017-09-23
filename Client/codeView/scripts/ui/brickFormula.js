'use strict';

PocketCode.CodeView.Ui.BrickFormula = (function () {
    BrickFormula.extends(PocketCode.Ui.Button, false);

    //cntr
    function BrickFormula(i18nKey) {
        PocketCode.Ui.Button.call(this, '', { className: 'pc-brickFormulaItem' });

        //this._textNode = new PocketCode.Ui.I18nTextNode('');
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

                    var item = new PocketCode.CodeView.Ui.BrickTextItem(i18nKey.i18nKey, true);
                    this._appendChild(item);

                    if (i18nKey.right != undefined) {
                        this._goThroughObject(i18nKey.right);
                    }
                    break;
                case 'FUNCTION':
                    this._addTypeFunction(i18nKey);
                    break;
                case 'NUMBER':
                    var item = new PocketCode.CodeView.Ui.BrickTextItem(i18nKey.value, false);
                    this._appendChild(item);
                    break;
                case 'SENSOR':
                    var item = new PocketCode.CodeView.Ui.BrickTextItem(i18nKey.i18nKey, true);
                    this._appendChild(item);
                    break;
                case 'USER_VARIABLE':
                    //todo variable id
                    var item = new PocketCode.CodeView.Ui.BrickTextItem("\"", false);
                    this._appendChild(item);
                    var id = i18nKey.objRef.id;
                    item = new PocketCode.CodeView.Ui.BrickTextItem(id, false); //todo VariableName instead of id
                    this._appendChild(item);
                    if(i18nKey.right != undefined){
                        this._goThroughObject(i18nKey.right);
                    }
                    item = new PocketCode.CodeView.Ui.BrickTextItem("\"", false);
                    this._appendChild(item);
                    break;
                case 'USER_LIST':
                    //todo list  id
                    var item = new PocketCode.CodeView.Ui.BrickTextItem("*", false);
                    this._appendChild(item);
                    var id = i18nKey.objRef.id;
                    item = new PocketCode.CodeView.Ui.BrickTextItem(id, false); //todo ListName instead of id
                    this._appendChild(item);
                    item = new PocketCode.CodeView.Ui.BrickTextItem("*", false);
                    this._appendChild(item);
                    break;
                case 'BRACKET':
                    var item = new PocketCode.CodeView.Ui.BrickTextItem("(", false);
                    this._appendChild(item);
                    this._goThroughObject(i18nKey.right);
                    item = new PocketCode.CodeView.Ui.BrickTextItem(")", false);
                    this._appendChild(item);
                    break;
                case 'STRING':
                    var item = new PocketCode.CodeView.Ui.BrickTextItem(i18nKey.value, false);
                    this._appendChild(item);
                    break;
                case 'COLLISION_FORMULA':
                    var item = new PocketCode.CodeView.Ui.BrickTextItem("formula_editor_function_collision", true);
                    this._appendChild(item);
                    item = new PocketCode.CodeView.Ui.BrickTextItem("(", false);
                    this._appendChild(item);
                    var sprite_id = i18nKey.objRef.id;
                    //var scene = null; //todo: get scene
                    //var sprite_name = scene.getSpriteById(sprite_id);
                    //item = new PocketCode.CodeView.Ui.BrickTextItem(sprite_name.name, false);
                    item = new PocketCode.CodeView.Ui.BrickTextItem(sprite_id, false);
                    this._appendChild(item);
                    item = new PocketCode.CodeView.Ui.BrickTextItem(")", false);
                    this._appendChild(item);
                    break;
            }
        },
        _addTypeFunction: function (i18nKey) {
            if (i18nKey.left != undefined && i18nKey.right == undefined) {

                var item = new PocketCode.CodeView.Ui.BrickTextItem(i18nKey.i18nKey, true);
                this._appendChild(item);
                item = new PocketCode.CodeView.Ui.BrickTextItem("(", false);
                this._appendChild(item);

                this._goThroughObject(i18nKey.left);

                item = new PocketCode.CodeView.Ui.BrickTextItem(")", false);
                this._appendChild(item);
            }
            else if (i18nKey.left != undefined && i18nKey.right != undefined) {

                var item = new PocketCode.CodeView.Ui.BrickTextItem(i18nKey.i18nKey, true);
                this._appendChild(item);
                item = new PocketCode.CodeView.Ui.BrickTextItem("(", false);
                this._appendChild(item);

                this._goThroughObject(i18nKey.left);

                item = new PocketCode.CodeView.Ui.BrickTextItem(",", false);
                this._appendChild(item);

                this._goThroughObject(i18nKey.right);

                item = new PocketCode.CodeView.Ui.BrickTextItem(")", false);
                this._appendChild(item);
            }
            else if (i18nKey.left == undefined && i18nKey.right == undefined) {
                var item = new PocketCode.CodeView.Ui.BrickTextItem(i18nKey.i18nKey, true);
                this._appendChild(item);
            }
        }

    });

    return BrickFormula;
})();
