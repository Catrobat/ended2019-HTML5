'use strict';

PocketCode.brickSelect = (function () {
    brickSelect.extends(PocketCode.Ui.Button, false);

    //cntr
    function brickSelect(i18nKey) {
        PocketCode.Ui.Button.call(this, i18nKey, { className: 'pc-brickSelect' });

    }

    //properties
    Object.defineProperties(brickSelect.prototype, {

    });

    //methods
    brickSelect.prototype.merge({

    });

    return brickSelect;
})();