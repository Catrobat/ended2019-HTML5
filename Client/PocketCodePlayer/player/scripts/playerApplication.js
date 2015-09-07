/// <reference path="../smartJs/sj.js" />
/// <reference path="../smartJs/sj-core.js" />
/// <reference path="../smartJs/sj-event.js" />
/// <reference path="../smartJs/sj-communication.js" />
/// <reference path="../smartJs/sj-ui.js" />
/// <reference path="../smartJs/sj-components.js" />
/// <reference path="../core.js" />
'use strict';

PocketCode.PlayerApplicationMode = {
    OVERLAY: 1,     //showing the player in a web overlay
    STANDALONE: 2,  //opening the player in our index.php
    EMBEDDED: 3,    //embedding the player in a page (container)
};

PocketCode.PlayerApplication = (function () {
    PlayerApplication.extends(SmartJs.Components.Application, false);

    function PlayerApplication(viewportContainer, rfc3066) {
        var vp = new PocketCode.Ui.Viewport();
        vp.hide();
        SmartJs.Components.Application.call(this, vp);

        this._pages = {
            player: new PocketCode.PlayerPageController(),
        };
        this._currentPage = this._pages.player;
        vp.loadPage(this._currentPage.view);

        //this._viewportContainer = viewportContainer || document.body;
        //this._viewport = new PocketCode.Ui.Viewport();
        //this._viewport.hide();
        vp.addToDom(viewportContainer || document.body);//this._viewportContainer);

        this._project = new PocketCode.GameEngine();
        this._project.onLoadingError.addEventListener(new SmartJs.Event.EventListener(this._projectLoadingErrorHandler, this));
        this._currentProjectId = undefined;
        //set project in page controller
        this._currentPage.project = this._project;
        //this._playerPageController = new PocketCode.PlayerPageController();

        if (rfc3066)  //TODO:
            this._rfc3066 = rfc3066;
        //else
        //    this._initI18nProvider;

        //webOverlay is undefined if running in mobile page, no viewport defined
        //this._splashScreen = splashScreen;
        //this._isMobilePage = viewportContainer ? false : true;	//this represents the players mode, not the device
        //if (this._isMobile)
        //	 window.addEventListener ('beforeunload', function() { return 'Exit PocketCode Player?'; }, false);

        //this._isIOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);	//TODO: if device is a static class, this should be moved?
        //this._webOverlay = webOverlay;

        ////navigation controller
        //if (this._isMobilePage) {
        //    //this._navigation = {	//index is url hash
        //    //    //'': PocketCode.PlayerExitController,
        //    //    player: PocketCode.PlayerPageController,
        //    //};
        //    //this._navigationHome = this._navigation.player;
        //    this._navigationId = 0;
        //    this._currentNavId = 0;

        //    //init
        //    if (history.pushState) {
        //        history.replaceState({ command: 'exit', historyLength: history.length, historyId: this._navigationId++ }, document.title, '');//document.location.href);	//initial push to save entry point and trigger 'playerClose' event
        //        this._addDomListener(window, 'popstate', this._popstateHandler);
        //    }
        //}

        //this._pageControllers = {};
        ////this._currentPage = undefined;

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
        _projectLoadingErrorHandler: function(e) {
            alert("loading failed: cross origin error");
        },
        _projectDetailsRequestLoadHandler: function (e) {
            if (this._disposed)
                return;
            var json = e.target.responseJson;
            this._onInit.dispatchEvent();
            this._viewport.show();
            this._requestProject(this._currentProjectId);
        },
        _projectDetailsRequestErrorHandler: function (e) {
            if (this._disposed)
                return;
            this._onInit.dispatchEvent();
            this._viewport.show();
            console.log('ERROR project details: ' + e);
        },
        _requestProjectDetails: function (projectId) {
            var req = new PocketCode.ServiceRequest(PocketCode.Services.PROJECT_DETAILS, SmartJs.RequestMethod.GET, { id: projectId, imgDataMax: 0 });
            req.onLoad.addEventListener(new SmartJs.Event.EventListener(this._projectDetailsRequestLoadHandler, this));
            req.onError.addEventListener(new SmartJs.Event.EventListener(this._projectDetailsRequestErrorHandler, this));
            PocketCode.Proxy.send(req);
        },
        _projectRequestLoadHandler: function (e) {
            if (this._disposed)
                return;
            var json = e.target.responseJson;
            if (json.header && json.header.device) {
                var device = json.header.device;
                this._onHWRatioChange.dispatchEvent({ratio: device.screenHeight / device.screenWidth });
            }
            //this._project.loadProject(json);
        },
        _projectRequestErrorHandler: function(e) {
            if (this._disposed)
                return;
            console.log('ERROR project: ' + e);
        },
        _requestProject: function(projectId) {
            var req = new PocketCode.ServiceRequest(PocketCode.Services.PROJECT, SmartJs.RequestMethod.GET, { id: projectId });//, imgDataMax: 0 });
            req.onLoad.addEventListener(new SmartJs.Event.EventListener(this._projectRequestLoadHandler, this));
            req.onError.addEventListener(new SmartJs.Event.EventListener(this._projectRequestErrorHandler, this));
            PocketCode.Proxy.send(req);
        },

        //_popstateHandler: function (e) {
        //    var data = e.state;
        //    if (data == null)	//chrome initial call
        //        return e.preventDefault();
        //    else if (data.command == 'exit') {	// && data.historyLength > 1) {
        //        //TODO:
        //        if (data.historyLength > 1)     //there was a history when entering the app
        //            console.log('show exit dialog: ' + data.historyLength);
        //        else
        //            history.forward();
        //        //if (true) -> history.back().. use data.historyLength
        //        //else: window.history.forward()
        //        return e.preventDefault();
        //    }

        //    if (data.historyId && data.historyId > this._currentNavId) {	//navigation forward (suppressed)
        //        history.back();
        //        return e.preventDefault();	//just to make sure this will not have any effects
        //    }
        //    this._loadPage(data.page, data.viewState, true);
        //},
        //_globalErrorHandler: function(message, fileName, lineNo) {
        //    this._onError.dispatchEvent();
        //    return true; //exception handled- not reportet to the user using the browser
        //},
        //_loadPage: function (page, viewState, historyBack) {
        //    if (!this._pageControllers[page]) {	//new
        //        var ctr = page.charAt(0).toUpperCase() + page.slice(1) + 'PageController';
        //        var pageCtr = new PocketCode[ctr]();
        //        this._pageControllers[page] = pageCtr;
        //    }

        //    var current = this._currentPage;
        //    if (!historyBack)
        //        history.pushState({ page: page, viewState: viewState, historyId: this._navigationId++ }, document.title, '');

        //    if (this._pageControllers[page] === current) {	//existing and currently active
        //        //history.pushState({ page: page, viewState: viewState, historyId: this._navigationId++ }, document.title, '');
        //        this._currentPage.updateViewState(viewState);
        //    }
        //    else {	//existing but currently NOT active
        //        //history.pushState({ page: page, viewState: viewState, historyId: this._navigationId++ }, document.title, '');
        //        this._currentPage = this._pageControllers[page];
        //        this._navigateToPage(current, this._currentPage, viewState);
        //    }
        //},
        //_navigateToPage: function (from, to, toViewState) {
        //    //console.log('navigation from ' + from + ' to: ' + to + ', viewstate: ' + JSON.stringify(toViewState));
        //    if (from)
        //        from.hide();
        //    to.showView();
        //},
        loadProject: function (projectId) {
            if (this._projectLoaded)    //prevent loading more than once
                return;
            this._projectLoaded = true;

            //check browser compatibility
            var comp = true;
            //if (!PocketCode.isPlayerCompatible)
            //    comp = false;

            if (comp) { //TODO: dispatch onError (defined in base class)
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

            this._currentProjectId = projectId;
            this._requestProjectDetails(projectId);
            //add viewport to DOM
            //this._viewport.addToDom(this._viewportContainer);

            //download project details

            //trigger ratio change
            //this._onHWRatioChange.dispatchEvent({ ratio: 16 / 9 });

            //create loading screen on playerPageView

            //show
            //this._loadPage('player');//, viewState: undefined }});	//load page
            //trigger onInit to hide splash screen
            

            //TODO: rethink splashScreen scaling: check on mobile device 
            //console.log
            //alert('PocketCode.PlayerApplication: loading project ' + projectId + ', mobile: ' + this._isMobilePage);
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
        dispose: function () {
            this._currentPage = undefined;
            for (var page in this._pages)
                this._pages[page].dispose();

            this._project.onLoadingError.removeEventListener(new SmartJs.Event.EventListener(this._projectLoadingErrorHandler, this));
            this._project.dispose();// = undefined;//.dispose();
            SmartJs.Components.Application.prototype.dispose.call(this);    //call super()
        },
    });

    return PlayerApplication;
})();
