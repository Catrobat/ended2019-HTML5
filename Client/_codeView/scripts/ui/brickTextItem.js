'use strict';

PocketCode.CodeView.Ui.BrickTextItem = (function () {
    BrickTextItem.extends(SmartJs.Ui.Control, false);

    function BrickTextItem(value, isI18n, propObject) {
        SmartJs.Ui.Control.call(this, 'span', propObject);

        if (isI18n) {
            this._textNode = new PocketCode.Ui.I18nTextNode(value);
        }
        else {
            this._textNode = new SmartJs.Ui.TextNode(value);
        }
        this._appendChild(this._textNode);
    }

    return BrickTextItem;
})();

