/// <reference path="../smartJs/sj.js" />
/// <reference path="../smartJs/sj-core.js" />
/// <reference path="../smartJs/sj-event.js" />
/// <reference path="../smartJs/sj-communication.js" />
/// <reference path="../smartJs/sj-ui.js" />
/// <reference path="../smartJs/sj-components.js" />
/// <reference path="../core.js" />
'use strict';

PocketCode.PlayerApplication = (function () {
    PlayerApplication.extends(SmartJs.Components.Application);

    function PlayerApplication(viewportContainer) {
        this._vp = viewportContainer || document.documentElement;
        //webOverlay is undefined if running in mobile page, no viewport defined
        //this._splashScreen = splashScreen;
        this._isMobile = viewportContainer ? false : true;
        this._isIOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );
        //this._webOverlay = webOverlay;

        //events
        this._onInit = new SmartJs.Event.Event(this);       //triggered when the loading screen is available
        this._onHWRatioChange = new SmartJs.Event.Event(this);    //triggered to notify weboverlay on device resolution change

    }

    //events
    Object.defineProperties(PlayerApplication.prototype, {
        onInit: {
            get: function () {
                return this._onInit;
            }
            //enumerable: false,
            //configurable: true,
        },
        onHWRatioChange: {
            get: function () {
                return this._onHWRatioChange;
            }
            //enumerable: false,
            //configurable: true,
        }
    });

    //methods
    PlayerApplication.prototype.merge({
        loadProject: function (projectId) {


            //TODO:
            //check browser compatibility
            //add viewport to DOM
            //download project details
            //trigger ratio change
            //create, show loading screen
            //trigger onInit to hide splash screen

            //TODO: rethink splashScreen scaling: check on mobile device 
            //console.log
            alert('PocketCode.PlayerApplication: loading project ' + projectId + ', mobile: ' + this._isMobile);

            //test only
            this._onHWRatioChange.dispatchEvent({ ratio: 16 / 9 });
            //this._onInit.dispatchEvent();


            //var _self = this;
            //window.setTimeout(_self._splashScreen.hide.bind(this._splashScreen), 3000);
            //this._splashScreen.hide();

            //test: set ratio
            //if (this._webOverlay)
            //    this._webOverlay.setHWRatio(16/9);
        },
    });

    return PlayerApplication;
})();
