'use strict';

PocketCode.CodeView.Ui.BrickDebugButton = (function () {
    BrickDebugButton.extends(PocketCode.Ui.Button, false);

    //cntr
    function BrickDebugButton(i18nKey) {
        PocketCode.Ui.Button.call(this, i18nKey, { className: 'pc-brickDebugButton' });

    }

    //properties
    Object.defineProperties(BrickDebugButton.prototype, {

    });

    //methods
    BrickDebugButton.prototype.merge({

    });

    return BrickDebugButton;
})();
