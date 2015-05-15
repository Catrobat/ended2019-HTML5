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

    function PlayerApplication(splashScreen, viewportControl) {
        //viewportControl is undefined if running in mobile page
        this._splashScreen = splashScreen;
    }

    PlayerApplication.prototype.merge({
        loadProject: function (projectId) {
            console.log('PocketCode.PlayerApplication: loading project ' + projectId);

            //test only
            var _self = this;
            window.setTimeout(_self._splashScreen.hide.bind(this._splashScreen), 3000);
            //this._splashScreen.hide();
        },
    });

    return PlayerApplication;
})();
