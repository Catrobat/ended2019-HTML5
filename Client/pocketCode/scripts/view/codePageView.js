'use strict';

PocketCode.Ui.CodePageView = (function () {
    CodePageView.extends(PocketCode.Ui.PageView, false);

    function CodePageView() {
        PocketCode.Ui.PageView.call(this);  //even if we do not pass argument, ui is built in the constructor so we have to call the ctr to reinit
        this._header.show();
        this._footer.hide();
    }

    return CodePageView;
})();
