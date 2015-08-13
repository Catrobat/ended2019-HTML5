/// <reference path="../core.js" />
/// <reference path="../components/gameEngine.js" />
/// <reference path="../ui/playerStartScreen.js" />
/// <reference path="../ui/playerToolbar.js" />
/// <reference path="../controller/programViewportController.js" />
'use strict';

PocketCode.Ui.PlayerPageView = (function () {
    PlayerPageView.extends(PocketCode.Ui.PageView);

    function PlayerPageView() {

        this._header.hide();
        this._footer.hide();

        this._viewport = new PocketCode.PlayerViewportController(); //TODO: a controller instance in a view?
        //this._toolbar = new PocketCode.Ui.PlayerToolbar();    //TODO: ctr settings
        this._startScreen = new PocketCode.Ui.PlayerStartScreen();

        this._initPageLayout();
    }

    PlayerPageView.prototype.merge({
        _initPageLayout: function() {
            //this.appendChild(this._viewport); //TODO: add a view and not the controller
            //this.appendChild(this._toolbar);
            this.appendChild(this._startScreen);
        },
        /* override */    //this is a test->remove this
        show: function () {
            //?
        },
    });

    return PlayerPageView;
})();
