/// <reference path="../ui.js" />
'use strict';

//RFC 3066 implementation: as singleton
PocketCode._I18nProvider = (function (propObject) {

    function I18nProvider() {

        this._direction = PocketCode.Ui.Direction.LTR;
        this._currentLanguage = undefined;
        this._supportedLanguages = [];

        this._dictionary = {    //storage: including locStrings used before loading / errors on loading
            "lblLoadingResources": "Loading resources...",
            "lblOk": "OK",
            "lblCancel": "Cancel",
            "lblConfirm": "Confirm",
            "lblRetry": "Retry",
            "lblGlobalErrorCaption": "Global Error",
            "msgGlobalError": "A global exception was detected.",
            "lblBrowserNotSupportedErrorCaption": "Browser Not Supported",
            "msgBrowserNotSupportedError": "Your browser does not meet the minimal requirements to run this application.",
            "msgBrowserNotSupportedErrorOther": "Please try again using another browser.",
            "lblMobileRestrictionsWarningCaption": "Please confirm",
            "msgMobileRestrictionsWarning": "Due to mobile browser restrictions you have to confirm that this application is allowed to download, cache, show/play images and audio/video content required in the requested project.",
            "msgMobileRestrictionsDebug": "There is currently NO official support for mobile devices- this is an experimental preview only! So please do NOT file bugs until there is an official release available.",
            "lblProjectNotFoundErrorCaption": "Project Not Found",
            "msgProjectNotFoundError": "The project you are trying to load could not be found on our server. Please make sure you are using a valid Project ID.",
            "lblProjectNotValidErrorCaption": "Project Not Valid",
            "msgProjectNotValidError": "The project you are trying to load has an invalid file structure or missing resources.",
            "lblParserErrorCaption": "Error Parsing Project",
            "msgParserError": "The project you are trying to load could not be parsed correctly on our server.",
            "lblInternalServerErrorCaption": "Internal Server Error",
            "msgInternalServerError": "We are sorry. The latest request caused an internal server error.",
            "lblServerConnectionErrorCaption": "Server Not Responding",
            "msgServerConnectionError": "Error connecting to our server or server not responding.",
            "msgInternetConnectionAvailable": "Please make sure you are connected to the internet.",
            "lblProjectLoadingErrorCaption": "Loading failed",
            "msgProjectLoadingError": "There was an error loading the project's resources.",
            //TODO: only add strings required if i18n strings fail to load at startup

            //new: add new loc strings here until they are included in crowdin
            "lbDeviceEmulator": "Device Emulator",
            "lbDeviceMaxDegree": "Maximum Speed",
            "lbDeviceMaxDegreeDescr": "Represents the maximum angle your device can be rotated, e.g. the max speed a sprite can reach based on the inclination sonsor.",
            "lbDeviceAcc": "Maximum Acceleration",
            "lbDeviceAccDescr": "Represents the change (angle per second) the device will move to one side if you start pressing a cusor button, e.g. the maximum acceleration of a sprite based on the inclination sensor.",
            "lbDeviceIncX": "Inclination X",
            "lbDeviceIncY": "Inclination Y",

            "variableTrue": "true",  //true
            "variableFalse": "false",  //false
            "variableNaN": "NaN",
            "variableInfinity": "Infinity",

            "lbLanguage": "Language",
        };

        this._onLanguageChange = new SmartJs.Event.Event(this);
        this._onDirectionChange = new SmartJs.Event.Event(this);
        this._onError = new SmartJs.Event.Event(this);
    }

    //events
    Object.defineProperties(I18nProvider.prototype, {
        onLanguageChange: {
            get: function () {
                return this._onLanguageChange;
            }
        },
        onDirectionChange: {
            get: function () {
                return this._onDirectionChange;
            }
        },
        onError: {
            get: function () {
                return this._onError;
            }
        },
    });

    //properties
    Object.defineProperties(I18nProvider.prototype, {
        _rtlRegExp: {
            value: new RegExp('^[^A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF\u2C00-\uFB1C\uFE00-\uFE6F\uFEFD-\uFFFF]*[\u0591-\u07FF\uFB1D-\uFDFF\uFE70-\uFEFC]'),
        },
        currentLanguage: {
            get: function () {
                return this._currentLanguage;
            },
        },
        currentLanguageDirection: {
            get: function () {
                return this._direction;
            },
        },
        supportedLanguages: {
            get: function () {
                return this._supportedLanguages;
            },
        },
    });

    //methods
    I18nProvider.prototype.merge({
        init: function (rfc3066) {
            if (this._supportedLanguages.length == 0) {
                var req = new PocketCode.ServiceRequest(PocketCode.Services.I18N_LANGUAGES, SmartJs.RequestMethod.GET);
                req.onLoad.addEventListener(new SmartJs.Event.EventListener(this._loadSuppordetLanguagesLoadHandler, this));
                req.onLoad.addEventListener(new SmartJs.Event.EventListener(function () { this.loadDictionary(rfc3066); }.bind(this)));
                req.onError.addEventListener(new SmartJs.Event.EventListener(this._loadErrorHandler, this));
                PocketCode.Proxy.send(req);
            }
            else
                this.loadDictionary(rfc3066);
        },
        _loadSuppordetLanguagesLoadHandler: function (e) {
            var languages = e.responseJson.supportedLanguages;
            if (!(languages instanceof Array))
                throw new Error('invalid language file');

            var lang;
            for (var i = 0, l = languages.length; i < l; i++) {
                lang = languages[i];
                if (!lang.languageCode || !lang.uiString)
                    throw new Error('invalid language file');
            }
            this._supportedLanguages = languages;
        },
        loadDictionary: function (rfc3066) {
            if (rfc3066) {
                if (rfc3066 == this._currentLanguage)
                    return;
                var req = new PocketCode.ServiceRequest(PocketCode.Services.I18N, SmartJs.RequestMethod.GET, { rfc3066: rfc3066 });
            }
            else
                var req = new PocketCode.ServiceRequest(PocketCode.Services.I18N_AUTO, SmartJs.RequestMethod.GET);

            req.onLoad.addEventListener(new SmartJs.Event.EventListener(this._loadDictionaryLoadHandler, this));
            req.onError.addEventListener(new SmartJs.Event.EventListener(this._loadErrorHandler, this));
            PocketCode.Proxy.send(req);
        },
        _loadDictionaryLoadHandler: function (e) {
            var json = e.responseJson;
            if (typeof json !== 'object')
                throw new Error('invalid argument dictionary expected type object');
            if (!json.languageCode || !json.direction || typeof json.dictionary !== 'object')
                throw new Error('invalid argument dictionary');

            if (json.languageCode === this._currentLanguage)
                return;
            if (json.direction !== this._direction) {
                this._direction = json.direction;
                this._onDirectionChange.dispatchEvent({ direction: this._direction });
            }
            this._dictionary.merge(json.dictionary); //using merge: so we can provide an initial dict for loading and errors
            this._currentLanguage = json.languageCode.substring(0, 2);
            this._onLanguageChange.dispatchEvent({ language: this._currentLanguage });
        },
        _loadErrorHandler: function (e) {
            this.onError.dispatchEvent(e);
        },
        getLocString: function (key) {
            var string = this._dictionary[key];
            if (!string)
                return '[' + key + ']';

            return string;
        },
        getTextDirection: function (string) {
            return this._rtlRegExp.test(string) ? PocketCode.Ui.Direction.RTL : PocketCode.Ui.Direction.LTR;
        },
        /* override */
        dispose: function () {
            //static class: cannot be disposed
        },
    });

    return I18nProvider;
})();

//static class: constructor override (keeping code coverage enabled)
PocketCode.I18nProvider = new PocketCode._I18nProvider();