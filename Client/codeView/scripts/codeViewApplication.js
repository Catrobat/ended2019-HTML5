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
        Application: (function (viewportContainer, rfc3066, mobileInitialized) {
            Application.extends(SmartJs.Components.Application, false);

            function Application() {
                var vp = new PocketCode.Ui.Viewport();
                SmartJs.Components.Application.call(this, vp);

                this._dialogs = [];

                this._mobileInitialized = mobileInitialized;
                this._noPromtOnLeave = false;   //TODO: settings (do not show promt on leave again?)
                this._forwardNavigationAllowed = false;
                this._loadingError = false;

                if (!vp.rendered)
                    vp.addToDom(viewportContainer || document.body);
                this._vp = vp;

                //events
                //this._onInit = new SmartJs.Event.Event(this);               //triggered when the loading screen is available
                //this._onMobileInitRequired = new SmartJs.Event.Event(this); //triggered on mobile devices to run the app in the scope of an user event
                ////this._onError = new SmartJs.Event.Event(this);		    //defined in base class
                //this._onHWRatioChange = new SmartJs.Event.Event(this);      //triggered to notify weboverlay on device resolution change
                //this._onExit = new SmartJs.Event.Event(this);               //triggered to notify weboverlay to be closed & disposed

                //init i18n
                PocketCode.I18nProvider.onError.addEventListener(new SmartJs.Event.EventListener(this._i18nControllerErrorHandler, this));
                PocketCode.I18nProvider.onDirectionChange.addEventListener(new SmartJs.Event.EventListener(function (e) { this._vp.uiDirection = e.direction; }, this));
                if (!mobileInitialized || rfc3066 && PocketCode.I18nProvider.currentLanguage != rfc3066) {   //do not load twice on mobile reinit or opening the same player overlay twice on the same page
                    PocketCode.I18nProvider.init(rfc3066);  //make sure all supported are loaded before loading dictionary
                    //PocketCode.I18nProvider.loadSuppordetLanguages();
                    //PocketCode.I18nProvider.loadDictionary(rfc3066);
                }
                else {
                    //if the language is not (re)loaded we have to check for rtl as our default direction is ltr
                    if (PocketCode.I18nProvider.currentLanguageDirection === PocketCode.Ui.Direction.RTL)
                        PocketCode.I18nProvider.onDirectionChange.dispatchEvent({ direction: PocketCode.Ui.Direction.RTL });
                }

                this._pages = {
                    CodePageController: new PocketCode.CodePageController(),
                };

                //show
                this._showPage(this._pages.CodePageController);

                this._project = new PocketCode.GameEngine();
                this._project.onLoadingError.addEventListener(new SmartJs.Event.EventListener(this._projectLoadingErrorHandler, this));
                this._project.onLoad.addEventListener(new SmartJs.Event.EventListener(this._projectLoadHandler, this));
                this._currentProjectId = undefined;
            }

            //events
            //Object.defineProperties(Application.prototype, {
            //    onInit: {
            //        get: function () {
            //            return this._onInit;
            //        }
            //    },
            //    onExit: {
            //        get: function () {
            //            return this._onExit;
            //        }
            //    },
            //});

            //methods
            Application.prototype.merge({
                _i18nControllerErrorHandler: function (e) {
                    PocketCode.I18nProvider.onError.removeEventListener(new SmartJs.Event.EventListener(this._i18nControllerErrorHandler, this));
                    throw new Error('i18nControllerError: ' + e.responseText);
                },
                _projectLoadHandler: function (e) {
                    if (!this._loadingError ) {
                        this._currentPage.project = this._project;
                        return;
                    }

                    if (this._loadingError) {
                        var d = new PocketCode.Ui.ProjectLoadingErrorDialog();
                        //d.onCancel.addEventListener(new SmartJs.Event.EventListener(this._onExit.dispatchEvent, this._onExit));
                        d.onCancel.addEventListener(new SmartJs.Event.EventListener(function () { alert('TODO: project loading error'); }));
                        d.onRetry.addEventListener(new SmartJs.Event.EventListener(function (e) {
                            e.target.dispose();
                            this._loadingError = false;
                            this._project.reloadProject();
                        }, this));
                        this._showDialog(d, false);
                        return;
                    }
                },
                _projectLoadingErrorHandler: function (e) {
                    this._loadingError = e;
                },
                _requestProject: function () {
                    var req = new PocketCode.ServiceRequest(PocketCode.Services.PROJECT, SmartJs.RequestMethod.GET, { id: this._currentProjectId });
                    req.onLoad.addEventListener(new SmartJs.Event.EventListener(this._projectRequestLoadHandler, this));
                    req.onError.addEventListener(new SmartJs.Event.EventListener(this._projectRequestErrorHandler, this));
                    PocketCode.Proxy.send(req);
                },
                _projectRequestLoadHandler: function (e) {
                    if (this._disposing || this._disposed)
                        return;
                    var json = e.target.responseJson;

                    //if (json.header && json.header.device) {
                    //    var device = json.header.device;
                    //    this._onHWRatioChange.dispatchEvent({ ratio: device.screenHeight / device.screenWidth });
                    //    var view = this._pages.PlayerPageController.view;
                    //    view.onResize.dispatchEvent();   //make sure the control is notified about the resize
                    //}
                    this._project.loadProject(json);
                },
                _projectRequestErrorHandler: function (e) {
                    if (this._disposing || this._disposed)
                        return;

                    var d, type;
                    var errorStatus = e.statusCode,
                        errorJson = e.responseJson;

                    if (errorStatus)  //got a response
                        type = errorJson ? errorJson.type || 'InternalServerError' : 'InternalServerError';
                    else
                        type = 'ServerConnectionError';

                    switch (type) {
                        case 'ProjectNotFoundException':
                            d = new PocketCode.Ui.ProjectNotFoundDialog();
                            break;
                        case 'InvalidProjectFileException':
                            d = new PocketCode.Ui.ProjectNotValidDialog();
                            //PocketCode.LoggingProvider.sendMessage(errorJson, this._currentProjectId);
                            break;
                        case 'FileParserException':
                            d = new PocketCode.Ui.ParserErrorDialog();
                            PocketCode.LoggingProvider.sendMessage(errorJson, this._currentProjectId);
                            break;
                        case 'ServerConnectionError':
                            d = new PocketCode.Ui.ServerConnectionErrorDialog();
                            //d.onCancel.addEventListener(new SmartJs.Event.EventListener(this._onExit.dispatchEvent, this._onExit));
                            d.onCancel.addEventListener(new SmartJs.Event.EventListener(function () { alert('TODO: server timeout error'); }));
                            d.onRetry.addEventListener(new SmartJs.Event.EventListener(function (e) {
                                e.target.dispose();
                                this._requestProject();
                            }, this));
                            break;

                        default:    //InternalServerError
                            d = new PocketCode.Ui.InternalServerErrorDialog();
                            PocketCode.LoggingProvider.sendMessage(errorJson, this._currentProjectId);
                    }

                    if (d.onOK) {
                        //d.onOK.addEventListener(new SmartJs.Event.EventListener(this._onExit.dispatchEvent, this._onExit));
                        d.onOK.addEventListener(new SmartJs.Event.EventListener(function () { alert('TODO: close app on error'); }));
                    }
                    //this._onInit.dispatchEvent();   //hide splash screen
                    this._showDialog(d, false);
                },
                _showPage: function (page) {
                    if (!(page instanceof PocketCode.PageController))
                        throw new Error('invalid argument: page, expectet type: PocketCode.PageController');

                    this._currentPage = page;
                    this._vp.loadPageView(page.view);
                },
                _showDialog: function (dialog, createHistoryEntry) {
                    if (!(dialog instanceof PocketCode.Ui.Dialog))
                        throw new Error('invalid argument: dialog');

                    if (SmartJs.Device.isMobile && createHistoryEntry !== false) {   //create history entry
                        this._dialogs.push(dialog);
                        history.pushState(new PocketCode.HistoryEntry(this._currentHistoryIdx, this._dialogs.length, this._currentPage), document.title, '');   //TODO: add page viewState and Dialogs?
                    }
                    this._viewport.addDialog(dialog);
                    this._viewport.show();
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
                            //this._onInit.dispatchEvent();   //hide splash screen
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

                    this._currentProjectId = projectId;
                    this._requestProject();
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
