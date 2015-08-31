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

        var setting = undefined;
        var menuOffset = 0;
        if (SmartJs.Device.isIOs)
            setting = PocketCode.Ui.PlayerToolbarSettings.MOBILE_IOS;
        else if (SmartJs.Device.isMobile)
            setting = PocketCode.Ui.PlayerToolbarSettings.MOBILE;
        else {
            setting = PocketCode.Ui.PlayerToolbarSettings.DESKTOP;
            menuOffset = '10%';
        }

        this._viewport = new PocketCode.PlayerViewportController()._view; //TODO: a controller instance in a view?
        this._viewport.style.merge({"margin-left":menuOffset});
        this._toolbar = new PocketCode.Ui.PlayerToolbar(setting);    //TODO: ctr settings
        this._startScreen = new PocketCode.Ui.PlayerStartScreen();

        this._initPageLayout();
    }

    PlayerPageView.prototype.merge({
        _initPageLayout: function() {
            this.appendChild(this._viewport); //TODO: add a view and not the controller
            this.appendChild(this._toolbar);
            // this.appendChild(this._startScreen);
        },
        /* override */    //this is a test->remove this
        show: function () {
            //?
        },
    });

    return PlayerPageView;
})();
