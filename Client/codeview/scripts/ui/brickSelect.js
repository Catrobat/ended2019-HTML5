'use strict';

PocketCode.BrickSelect = (function () {
    BrickSelect.extends(PocketCode.Ui.Button, false);

    //cntr
    function BrickSelect(i18nKey) {
        PocketCode.Ui.Button.call(this, i18nKey, { className: 'pc-brickSelect' });

    }

    //properties
    Object.defineProperties(BrickSelect.prototype, {

    });

    //methods
    BrickSelect.prototype.merge({

    });

    return BrickSelect;
})();