'use strict';

PocketCode.Ui.CodePageView = (function () {
    CodePageView.extends(PocketCode.Ui.PageView);

    function CodePageView() {
        //PocketCode.Ui.PageView.call(this);  //even if we do not pass argument, ui is built in the constructor so we have to call the ctr to reinit
        //this._header.show();
        this._footer.hide();
        this.caption = 'this is a very long caption textthis is a very long caption textthis is a very long caption text';

        this._menu = new PocketCode.CodeView.Ui.Menu();
        this._header.appendChild(this._menu);
    }

    //properties
    //Object.defineProperties(CodePageView.prototype, {
    //});

    //methods
    CodePageView.prototype.merge({
        /* override */
        verifyResize: function () {
            this._menu.verifyResize();  //menu is positioned absolute
            PocketCode.Ui.PageView.prototype.verifyResize.call(this);
        },
    });

    return CodePageView;
})();
