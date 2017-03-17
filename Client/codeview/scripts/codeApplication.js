/// <reference path="../smartJs/sj.js" />
/// <reference path="../smartJs/sj-core.js" />
/// <reference path="../smartJs/sj-event.js" />
/// <reference path="../smartJs/sj-communication.js" />
/// <reference path="../smartJs/sj-ui.js" />
/// <reference path="../smartJs/sj-components.js" />
/// <reference path="../core.js" />
'use strict';

PocketCode.merge({
    CodeView: {
        Application: (function () {
            alert('application'); //test
            Application.extends(SmartJs.Components.Application, false);

            function Application() {
                var vp = new PocketCode.Ui.Viewport();
                vp.hide();
                this._dialogs = [];

                SmartJs.Components.Application.call(this, vp);
                this._noPromtOnLeave = false;   //TODO: settings (do not show promt on leave again?)
                this._forwardNavigationAllowed = false;
                this._loadingError = false;

                if (!vp.rendered)
                    vp.addToDom(document.body);
                this._vp = vp;

                //events
                this._onInit = new SmartJs.Event.Event(this);               //triggered when the loading screen is available
                this._onMobileInitRequired = new SmartJs.Event.Event(this); //triggered on mobile devices to run the app in the scope of an user event
                //this._onError = new SmartJs.Event.Event(this);		    //defined in base class
                this._onHWRatioChange = new SmartJs.Event.Event(this);      //triggered to notify weboverlay on device resolution change
                this._onExit = new SmartJs.Event.Event(this);               //triggered to notify weboverlay to be closed & disposed

                if (PocketCode.I18nProvider.currentLanguageDirection === PocketCode.Ui.Direction.RTL)
                    PocketCode.I18nProvider.onDirectionChange.dispatchEvent({ direction: PocketCode.Ui.Direction.RTL });

                this._pages = {
                    CodePageController: new PocketCode.CodePageController(),
                };
                this._currentProjectId = undefined;
            }

            Object.defineProperties(Application.prototype, {
                onInit: {
                    get: function () {
                        return this._onInit;
                    }
                },
                onExit: {
                    get: function () {
                        return this._onExit;
                    }
                },
            });

            //methods
            Application.prototype.merge({
                _requestProjectDetails: function () {
                    var req = new PocketCode.ServiceRequest(PocketCode.Services.PROJECT_DETAILS, SmartJs.RequestMethod.GET, { id: this._currentProjectId, imgDataMax: 0 });
                    req.onLoad.addEventListener(new SmartJs.Event.EventListener(this._projectDetailsRequestLoadHandler, this));
                    PocketCode.Proxy.send(req);
                },
                _projectDetailsRequestLoadHandler: function (e) {
                    if (this._disposing || this._disposed)
                        return;
                    var json = e.target.responseJson;
                    if (SmartJs.Device.isMobile)
                        this._onInit.dispatchEvent();
                    else
                        this._onInit.dispatchEvent({ menu: this._pages.PlayerPageController.menu });
                    this._pages.PlayerPageController.projectDetails = json;
                    this._viewport.show();
                    this._requestProject();
                },
                _requestProject: function () {
                    var req = new PocketCode.ServiceRequest(PocketCode.Services.PROJECT, SmartJs.RequestMethod.GET, { id: this._currentProjectId });
                    req.onLoad.addEventListener(new SmartJs.Event.EventListener(this._projectRequestLoadHandler, this));
                    PocketCode.Proxy.send(req);
                },
                _projectRequestLoadHandler: function (e) {
                    if (this._disposing || this._disposed)
                        return;
                    var json = e.target.responseJson;

                    if (json.header && json.header.device) {
                        var device = json.header.device;
                        this._onHWRatioChange.dispatchEvent({ ratio: device.screenHeight / device.screenWidth });
                        var view = this._pages.PlayerPageController.view;
                        view.onResize.dispatchEvent();   //make sure the control is notified about the resize
                    }
                    this._project.loadProject(json);
                },
                _showPage: function (page) {
                    if (!(page instanceof PocketCode.PageController))
                        throw new Error('invalid argument: page, expectet type: PocketCode.PageController');

                    this._currentPage = page;
                  this._vp.loadPageView(page.view);
                },
                loadProject: function (projectId) {
                    if (this._disposing || this._disposed)// || this._projectLoaded)    //prevent loading more than once
                        return;

                    this._loadingError = false;
                    //check browser compatibility
                    var pc = PocketCode.isPlayerCompatible();
                    var compatible = pc.result;

                    if (!compatible) {	//framework not loaded correctly or compatibility failed
                        if (!pc.tests.SmartJs) {
                            alert('sorry.. your browser does not meet the HTML5 feature requirements to run this application');
                            this._onExit.dispatchEvent();
                        }
                        else {
                            var d = new PocketCode.Ui.BrowserNotSupportedDialog();
                            d.onOK.addEventListener(new SmartJs.Event.EventListener(this._onExit.dispatchEvent, this._onExit));
                            //d.bodyInnerHTML += '<br /><br />Application will be closed.';
                            this._onInit.dispatchEvent();   //hide splash screen
                            this._showDialog(d, false);
                        }
                        return;
                    }

                    if (SmartJs.Device.isMobile && !this._mobileInitialized) {
                        //to reinit app in the scope of an user event
                        var d = new PocketCode.Ui.MobileRestrictionDialog();
                        d.onCancel.addEventListener(new SmartJs.Event.EventListener(this._onExit.dispatchEvent, this._onExit));
                        d.onConfirm.addEventListener(new SmartJs.Event.EventListener(function (e) {
                            this._viewport.hide();
                            this._onMobileInitRequired.dispatchEvent(e);
                        }, this));
                        this._onInit.dispatchEvent();   //hide splash screen
                        this._showDialog(d, false);
                        return;
                    }

                    //show
                    this._showPage(this._pages.PlayerPageController);
                    //set project in page controller
                    this._currentPage.project = this._project;

                    this._currentProjectId = projectId;
                    this._requestProjectDetails();
                },
                //navigation
                dispose: function () {
                    this._vp.hide();
                    this._currentPage = undefined;
                    for (var page in this._pages) {  //objects (d// ictionaries) are not handled by the core dispose functionality- make sure we do not miss them
                        this._pages[page].dispose();
                        delete this._pages[page];
                    }
                    SmartJs.Components.Application.prototype.dispose.call(this);    //call super()
                },
            });

            return Application;
        })(),
    },
});
