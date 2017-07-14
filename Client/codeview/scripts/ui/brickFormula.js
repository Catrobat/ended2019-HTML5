'use strict';

PocketCode.brickFormula = (function () {
    brickFormula.extends(PocketCode.Ui.Button, false);

    //cntr
    function brickFormula(i18nKey) {
        PocketCode.Ui.Button.call(this, i18nKey, { className: 'pc-brickFormula' });

    }

    //properties
    Object.defineProperties(brickFormula.prototype, {

    });

    //methods
    brickFormula.prototype.merge({

    });

    return brickFormula;
})();