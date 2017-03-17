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

            function Application(viewportContainer, rfc3066, mobileInitialized) {
                var vp = new PocketCode.Ui.Viewport();
                vp.hide();
                this._dialogs = [];

                SmartJs.Components.Application.call(this, vp);
                this._mobileInitialized = mobileInitialized;
                this._noPromtOnLeave = false;   //TODO: settings (do not show promt on leave again?)
                this._forwardNavigationAllowed = false;
                this._loadingError = false;

                if (!vp.rendered)
                    vp.addToDom(viewportContainer || document.body);
                this._vp = vp;

                //events
                this._onInit = new SmartJs.Event.Event(this);               //triggered when the loading screen is available
                this._onMobileInitRequired = new SmartJs.Event.Event(this); //triggered on mobile devices to run the app in the scope of an user event
                //this._onError = new SmartJs.Event.Event(this);		    //defined in base class
                this._onHWRatioChange = new SmartJs.Event.Event(this);      //triggered to notify weboverlay on device resolution change
                this._onExit = new SmartJs.Event.Event(this);               //triggered to notify weboverlay to be closed & disposed

               // this._onError.addEventListener(new SmartJs.Event.EventListener(this._globalErrorHandler, this));

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
                //init
                if (SmartJs.Device.isMobile && !mobileInitialized) {    //do not initialize the UI if app needs to be recreated for mobile
                    var state = history.state;
                    if (state !== null && state.historyIdx > 0) //refresh pressed
                        history.go(-state.historyIdx);  //not to init page but to start page
                    return;
                }

                this._pages = {
                    _InitialPopStateController: new PocketCode._InitialPopStateController(),
                    CodePageController: new PocketCode.CodePageController(),
                };
            }

            //accessors
            Object.defineProperties(Application.prototype, {
                hasOpenDialogs: {
                    get: function () {
                        return this._dialogs.length > 0 || this._currentPage.hasOpenDialogs;
                    }
                },
            });

            //methods
            Application.prototype.merge({
                _i18nControllerErrorHandler: function (e) {
                    PocketCode.I18nProvider.onError.removeEventListener(new SmartJs.Event.EventListener(this._i18nControllerErrorHandler, this));
                    throw new Error('i18nControllerError: ' + e.responseText);
                },
                _showPage: function (page) {
                  this._currentPage = page;
                  this._vp.loadPageView(page.view);
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
