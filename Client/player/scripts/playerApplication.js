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

    function PlayerApplication(viewportContainer, rfc3066, mobileInitialized) {
        //var vp;// = viewport;
        //if (!vp) {
        var vp = new PocketCode.Ui.Viewport();
        vp.hide();
        //}
        SmartJs.Components.Application.call(this, vp);
        this._mobileInitialized = mobileInitialized;

        if (!SmartJs.Device.isMobile || mobileInitialized) { //do not initilaize the UI if app needs to be recreated for mobile 
            this._pages = {
                player: new PocketCode.PlayerPageController(),
            };
            this._currentPage = this._pages.player;
            vp.loadPage(this._currentPage.view);

            //this._viewportContainer = viewportContainer || document.body;
            //this._viewport = new PocketCode.Ui.Viewport();
            //this._viewport.hide();

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
        }
        if (!vp.rendered)
            vp.addToDom(viewportContainer || document.body);//this._viewportContainer);

        //events
        this._onInit = new SmartJs.Event.Event(this);       //triggered when the loading screen is available
        this._onMobileInitRequired = new SmartJs.Event.Event(this); //triggered on mobile devices to run the app in the scope of an user event
        //this._onError = new SmartJs.Event.Event(this);		//defined in base class
        this._onHWRatioChange = new SmartJs.Event.Event(this);    //triggered to notify weboverlay on device resolution change
        this._onClose = new SmartJs.Event.Event(this);    //triggered to notify weboverlay to be closed & disposed

        this._onError.addEventListener(new SmartJs.Event.EventListener(this._globalErrorHandler, this));
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
        onMobileInitRequired: {
            get: function () {
                return this._onMobileInitRequired;
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
        },
        onClose: {
            get: function () {
                return this._onClose;
            }
            //enumerable: false,
            //configurable: true,
        }
    });

    //methods
    PlayerApplication.prototype.merge({
        _globalErrorHandler: function(e) {
            var error = e.error,
                msg = error.message,
                file = error.file || error.filename || error.fileName,
                line = error.lineno;

            //alert('TODO: show a dialog (and log): global error: ' + JSON.stringify(e));//msg + ' in ' + file + ' at line ' + line);
            var d = new PocketCode.Ui.GlobalErrorDialog();
            try {
                var json = {},
                    parsed = false;
                Object.getOwnPropertyNames(e).forEach(function (key) {
                    json[key] = e[key];
                    parsed = true;
                }, this);
            }
            catch(exc) {}
            if (parsed) {
                d.bodyInnerHTML += 'Details: <br />';
                d.bodyInnerHTML += JSON.stringify(json);
            }

            d.onOK.addEventListener(new SmartJs.Event.EventListener(function () { this._onClose.dispatchEvent(); }, this));
            this._onInit.dispatchEvent();   //hide splash screen
            this._showDialog(d, false);
        },
        _projectLoadingErrorHandler: function(e) {
            alert("loading failed: unsupported sound format");
            //TODO: this._onClose.dispatchEvent();
            //TODO: cross origin should be checkt during startup- listed in Jira already

        },
        _requestProjectDetails: function (projectId) {
            var req = new PocketCode.ServiceRequest(PocketCode.Services.PROJECT_DETAILS, SmartJs.RequestMethod.GET, { id: projectId, imgDataMax: 0 });
            req.onLoad.addEventListener(new SmartJs.Event.EventListener(this._projectDetailsRequestLoadHandler, this));
            req.onError.addEventListener(new SmartJs.Event.EventListener(this._projectDetailsRequestErrorHandler, this));
            PocketCode.Proxy.send(req);
        },
        _projectDetailsRequestLoadHandler: function (e) {
            if (this._disposing || this._disposed)
                return;
            var json = e.target.responseJson;
            this._onInit.dispatchEvent();
            this._pages.player.projectDetails = json;//showLoadingScreen(json.title, json.baseUrl + json.thumbnailUrl);
            this._viewport.show();
            this._requestProject(this._currentProjectId);
        },
        _projectDetailsRequestErrorHandler: function (e) {
            if (this._disposing || this._disposed)
                return;
            this._onInit.dispatchEvent();
            //this._viewport.show();
            var d = new PocketCode.Ui.ProjectNotFoundDialog();
            d.onOK.addEventListener(new SmartJs.Event.EventListener(function () { this._onClose.dispatchEvent(); }, this));
            this._onInit.dispatchEvent();   //hide splash screen
            this._showDialog(d, false);

            //console.log('ERROR project details: ' + e);
        },
        _requestProject: function(projectId) {
            var req = new PocketCode.ServiceRequest(PocketCode.Services.PROJECT, SmartJs.RequestMethod.GET, { id: projectId });//, imgDataMax: 0 });
            req.onLoad.addEventListener(new SmartJs.Event.EventListener(this._projectRequestLoadHandler, this));
            req.onError.addEventListener(new SmartJs.Event.EventListener(this._projectRequestErrorHandler, this));
            PocketCode.Proxy.send(req);
        },
        _projectRequestLoadHandler: function (e) {
            if (this._disposing || this._disposed)
                return;
            var json = e.target.responseJson;
            if (json.header && json.header.device) {
                var device = json.header.device;
                this._onHWRatioChange.dispatchEvent({ ratio: device.screenHeight / device.screenWidth });
            }
            this._project.loadProject(json);
        },
        _projectRequestErrorHandler: function (e) {
            if (this._disposing || this._disposed)
                return;
            console.log('ERROR project: ' + e);
            //TODO: parse error and show dialog
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
        _showDialog: function(dialog, createHistoryEntry) {
            if (!(dialog instanceof PocketCode.Ui.Dialog))
                throw new Error('invalid argument: dialog');

            this._viewport.addDialog(dialog);   //test only
            this._viewport.show();

            if (!SmartJs.Device.isMobile) { //desktop
                //TODO: we do not create history entries here
                //append the dialog to body?
            }
            else {  //mobile
                //append the dialog to viewport: this._viewport.addDialog(restrictionDialog);
            }
        },
        //_showMobileRestrictionDialog: function() {
        //    var restrictionDialog = new PocketCode.Ui.MobileRestrictionDialog();
        //    restrictionDialog.onCancel.addEventListener(new SmartJs.Event.EventListener(this._mobileCancelHandler, this));
        //    restrictionDialog.onConfirm.addEventListener(new SmartJs.Event.EventListener(this._mobileConfirmHandler, this));
        //    this._viewport.addDialog(restrictionDialog);
        //    this._onInit.dispatchEvent();   //hide splash screen
        //    this._viewport.show();

        //},
        //_exit: function(e) {
        //    this._viewport.hide();
        //	if (history.length > 0)
        //		history.back();
        //	else
        //	    window.close();
        //},
        //_reinitMobile: function (e) {
        //    this._viewport.hide();
        //    this._onMobileInitRequired.dispatchEvent(e);
        //},
        loadProject: function (projectId) {
            if (this._disposing || this._disposed)// || this._projectLoaded)    //prevent loading more than once
                return;

            //check browser compatibility
            //var compatible = true;
            var pc = PocketCode.isPlayerCompatible();
            var compatible = pc.result;
            //if (!pc.result)
            //    compatible = false;

            if (!compatible) {	//framework not loaded correctly or compatibility failed
                if (!pc.tests.SmartJs) {
                    alert('sorry.. your browser does not meet the HTML5 feature requirements to run this application');
                    this._onClose.dispatchEvent();
                }
                else {
                    var d = new PocketCode.Ui.BrowserNotSupportedDialog();
                    d.onOK.addEventListener(new SmartJs.Event.EventListener(function () { this._onClose.dispatchEvent(); }, this));
                    this._onInit.dispatchEvent();   //hide splash screen
                    this._showDialog(d, false);
                }
                return;
            }

            if (SmartJs.Device.isMobile && !this._mobileInitialized) {
                //this._showMobileRestrictionDialog();    //reinit app in the scope of an user event
                var d = new PocketCode.Ui.MobileRestrictionDialog();
                d.onCancel.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onClose.dispatchEvent(e); }, this));
                d.onConfirm.addEventListener(new SmartJs.Event.EventListener(function (e) {
                    this._viewport.hide();
                    this._onMobileInitRequired.dispatchEvent(e);
                }, this));
                this._onInit.dispatchEvent();   //hide splash screen
                this._showDialog(d, false);
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
        toggleMuteSounds: function () {
            this._muted = this._muted ? false : true;
            this._project.muted = this._muted;
            return this._muted;
        },
        dispose: function () {
            if (this._project)
                this._project.onLoadingError.removeEventListener(new SmartJs.Event.EventListener(this._projectLoadingErrorHandler, this));
            //this._project.dispose();    //make sure the project gets disposed befor disposing the UI  -> ? -> this way the ui cannot unbind
            for (var page in this._pages)   //objects (dictionaries) are not handled by the core dispose functionality- make sure we do not miss them
                this._pages[page].dispose();

            SmartJs.Components.Application.prototype.dispose.call(this);    //call super()
        },
    });

    return PlayerApplication;
})();
