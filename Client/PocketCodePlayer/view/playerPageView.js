/// <reference path="../core.js" />
'use strict';

PocketCode.PlayerPageView = (function () {
    PlayerPageView.extends(PocketCode.Mvc.CoreView);

    function PlayerPageView() {
    }

    PlayerPageView.prototype.merge({
        /* override */
        show: function () {
            console.log('show PocketCode.PlayerPageView');  //this is test->remove this
        }
    });

    return PlayerPageView;
})();
