'use strict';

PocketCode.CodeView.Ui.BrickDropdown = (function () {
    BrickDropdown.extends(PocketCode.Ui.Button, false);

    //cntr
    function BrickDropdown(i18nKey) {
        PocketCode.Ui.Button.call(this, i18nKey, { className: 'pc-brickDropdownItem' });

    }

    //properties
    Object.defineProperties(BrickDropdown.prototype, {

    });

    //methods
    BrickDropdown.prototype.merge({

    });

    return BrickDropdown;
})();
