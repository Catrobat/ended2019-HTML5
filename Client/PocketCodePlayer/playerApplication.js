/// <reference path="../core.js" />
'use strict';


PocketCodePlayer.Navigation = {
    EXPLORE: {
        hash: 'explore',
        controller: ExplorePageController,
    },
    PLAYER: {
        hash: 'player',
        controller: PlayerPageController,
    },
};

PocketCodePlayer.NavigationRoot = PocketCode.Navigation.Projects;
PocketCodePlayer.ApplicationTitle = "PocketCode HTML5 Player: ";

PocketCode.PlayerApplication = (function () {

    function PlayerApplication() {
    }

    PlayerApplication.prototype.merge({
    });

    return PlayerApplication;
})();
