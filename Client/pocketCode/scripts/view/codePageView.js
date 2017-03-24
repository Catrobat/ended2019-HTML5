'use strict';

PocketCode.Ui.CodePageView = (function () {
    CodePageView.extends(PocketCode.Ui.PageView);

    function CodePageView() {
        //PocketCode.Ui.PageView.call(this);  //even if we do not pass argument, ui is built in the constructor so we have to call the ctr to reinit
        //this._header.show();
        this._footer.hide();
        this.caption = 'this is a very long caption textthis is a very long caption textthis is a very long caption text';

        this._menu = new PocketCode.CodeView.Ui.Menu();
        this._menu.addToDom(this._dom);
    }


    //properties
    Object.defineProperties(CodePageView.prototype, {
    });

    return CodePageView;
})();
