'use strict';

PocketCode.Ui.CodePageView = (function () {
    CodePageView.extends(PocketCode.Ui.PageView, false);

    function CodePageView() {
        PocketCode.Ui.PageView.call(this);  //even if we do not pass argument, ui is built in the constructor so we have to call the ctr to reinit
        this._header.show();
        this._footer.hide();
        this._capture = "CodeView";
    }


    //properties
    Object.defineProperties(CodePageView.prototype, {
        _capture: {  //to keep the original viewport size when the mobile keyboard shows up
            set: function (text) {
                var t = document.createTextNode(text);
                this._childs[0].__container._dom.appendChild(t);
            },
            get: function () {
                return this._childs[0].__container._dom.innerHTML;
            },
        },
    });

    return CodePageView;
})();
