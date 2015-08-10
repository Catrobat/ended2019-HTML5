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
        this._isMobile = viewportContainer ? false : true;	//this represents the players mode, not the device
        //if (this._isMobile)
        //	 window.addEventListener ('beforeunload', function() { return 'Exit PocketCode Player?'; }, false);

        this._isIOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);	//TODO: if device is a static class, this should be moved?
        //this._webOverlay = webOverlay;

        //navigation controller
        if (this._isMobile) {
            //this._navigation = {	//index is url hash
            //    //'': PocketCode.PlayerExitController,
            //    player: PocketCode.PlayerPageController,
            //};
            //this._navigationHome = this._navigation.player;
            this._navigationId = 0;
            this._currentNavId = 0;

            //init
            if (history.pushState) {
                history.replaceState({ command: 'exit', historyLength: history.length, historyId: this._navigationId++ }, document.title, '');//document.location.href);	//initial push to save entry point and trigger 'playerClose' event
                this._addDomListener(window, 'popstate', this._popstateHandler);
            }
        }

        this._pageControllers = {};
        //this._currentPage = undefined;

        //events
        this._onInit = new SmartJs.Event.Event(this);       //triggered when the loading screen is available
        //this._onError = new SmartJs.Event.Event(this);		//defined in base class
        this._onHWRatioChange = new SmartJs.Event.Event(this);    //triggered to notify weboverlay on device resolution change
    }

    //events: the application doesn't need any public properties or events: anyway.. this events are required to communicate with the web overlay
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
        _popstateHandler: function (e) {
            var data = e.state;
            if (data == null)	//chrome initial call
                return e.preventDefault();
            else if (data.command == 'exit') {	// && data.historyLength > 1) {
                //TODO:
                if (data.historyLength > 1)     //there was a history when entering the app
                    console.log('show exit dialog: ' + data.historyLength);
                else
                    history.forward();
                //if (true) -> history.back().. use data.historyLength
                //else: window.history.forward()
                return e.preventDefault();
            }

            if (data.historyId && data.historyId > this._currentNavId) {	//navigation forward (suppressed)
                history.back();
                return e.preventDefault();	//just to make sure this will not have any effects
            }
            this._loadPage(data.page, data.viewState, true);
        },
        //_globalErrorHandler: function(message, fileName, lineNo) {
        //    this._onError.dispatchEvent();
        //    return true; //exception handled- not reportet to the user using the browser
        //},
        _loadPage: function (page, viewState, historyBack) {
            if (!this._pageControllers[page]) {	//new
                var ctr = page.charAt(0).toUpperCase() + page.slice(1) + 'PageController';
                var pageCtr = new PocketCode[ctr]();
                this._pageControllers[page] = pageCtr;
            }

            var current = this._currentPage;
            if (!historyBack)
                history.pushState({ page: page, viewState: viewState, historyId: this._navigationId++ }, document.title, '');

            if (this._pageControllers[page] === current) {	//existing and currently active
                //history.pushState({ page: page, viewState: viewState, historyId: this._navigationId++ }, document.title, '');
                this._currentPage.updateViewState(viewState);
            }
            else {	//existing but currently NOT active
                //history.pushState({ page: page, viewState: viewState, historyId: this._navigationId++ }, document.title, '');
                this._currentPage = this._pageControllers[page];
                this._navigateToPage(current, this._currentPage, viewState);
            }
        },
        _navigateToPage: function (from, to, toViewState) {
            //console.log('navigation from ' + from + ' to: ' + to + ', viewstate: ' + JSON.stringify(toViewState));
            if (from)
                from.hide();
            to.showView();
        },
        loadProject: function (projectId) {

            //check browser compatibility
            var comp = true;
            //if (!PocketCode.isPlayerCompatible)
            //    comp = false;

            if (comp) {
                var bc = PocketCode.isPlayerCompatible();
                if (!bc.result)
                    comp = false;
            }
            if (!comp) {	//framework not loaded correctly or compatibility failed
                //if (this._onError instanceof SmartJs.Event.Event)
                //    this._onError.dispatchEvent();
                //else
                    alert('sorry.. your browser does not meet the HTML5 feature requirements to run this application');

                return;
            }

            //add viewport to DOM

            //download project details

            //trigger ratio change
            //this._onHWRatioChange.dispatchEvent({ ratio: 16 / 9 });

            //create loading screen on playerPageView

            //show
            this._loadPage('player');//, viewState: undefined }});	//load page
            //trigger onInit to hide splash screen

            //TODO: rethink splashScreen scaling: check on mobile device 
            //console.log
            alert('PocketCode.PlayerApplication: loading project ' + projectId + ', mobile: ' + this._isMobile);
            //this._onInit.dispatchEvent();


            //test only
            //this._onHWRatioChange.dispatchEvent({ ratio: 16 / 9 });
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
