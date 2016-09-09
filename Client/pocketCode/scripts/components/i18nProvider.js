/// <reference path="../ui.js" />
'use strict';

//RFC 3066 implementation: as singleton
PocketCode.I18nProvider = (function (propObject) {

    function I18nProvider() {

        this._direction = PocketCode.Ui.Direction.LTR;

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

            //NEW
            menuFullscreen: "fullscreen",
            menuTermsOfUse: "terms of use", //renamed to camel case


        };  

        this._supportedLanguages = [];

        this._onLanguageChange = new SmartJs.Event.Event(this);
        this._onDirectionChange = new SmartJs.Event.Event(this);
        this._onError = new SmartJs.Event.Event(this);
    }

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
        //loadSuppordetLanguages: function () {
        //    var req = new PocketCode.ServiceRequest(PocketCode.Services.I18N_LANGUAGES, SmartJs.RequestMethod.GET);
        //    req.onLoad.addEventListener(new SmartJs.Event.EventListener(this._loadSuppordetLanguagesLoadHandler, this));
        //    req.onError.addEventListener(new SmartJs.Event.EventListener(this._loadErrorHandler, this));
        //    PocketCode.Proxy.send(req);
        //},
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
            //console.log( languages );

            //// Add menu elements
            //for( i = 0; i < languages.length; i++ ) {
            //    (function () {
            //        var btn;
            //        var lang = languages[i];

            //        btn = new PocketCode.Ui.MenuItem(lang.uiString);
            //        btn.onClick.addEventListener(new SmartJs.Event.EventListener(function () {
            //            PocketCode.I18nProvider.loadDictionary(lang.languageCode)
            //        }));

            //        PocketCode.Menu.appendChild(btn);
            //    }());
            //}
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
        getTextDirection: function(string) {
            //var input = this._textValidationInput,
            //    dir = PocketCode.Ui.Direction.LTR;  //default

            //if (!input && this._dirAutoSupported != false) {
            //    input = document.createElement('input');
            //    input.type = 'text';
            //    input.dir = 'auto';
            //    input.style.position = 'absolute';
            //    input.style.height = 0;
            //    input.style.width = 0;
            //    input.style.top = -20;
            //    try {
            //        document.body.appendChild(input);
            //    }
            //    catch (exc) { /* silent catch */ }

            //    this._dirAutoSupported = false;

            //    input.value = 'test';
            //    if (window.getComputedStyle)
            //        this._dirAutoSupported = window.getComputedStyle(input, null).direction == PocketCode.Ui.Direction.LTR;
            //    else if (input.currentStyle)
            //        this._dirAutoSupported = input.currentStyle.direction == PocketCode.Ui.Direction.LTR;

            //    if (this._dirAutoSupported) {
            //        input.value = 'زمایش';
            //        if (window.getComputedStyle)
            //            this._dirAutoSupported = window.getComputedStyle(input, null).direction == PocketCode.Ui.Direction.RTL;
            //        else if (input.currentStyle)
            //            this._dirAutoSupported = input.currentStyle.direction == PocketCode.Ui.Direction.RTL;
            //    }

            //    if (this._dirAutoSupported)
            //        this._textValidationInput = input;
            //}

            //if (this._dirAutoSupported) {
            //    input.value = string;

            //    if (window.getComputedStyle)
            //        dir = window.getComputedStyle(input, null).direction;
            //    else if (input.currentStyle)
            //        dir = input.currentStyle.direction;
            //}
            //else {
            //    //checking first char with strong dir (like the input control above should do)
            //    var rtlRegex = new RegExp('^[^A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF\u2C00-\uFB1C\uFE00-\uFE6F\uFEFD-\uFFFF]*' +
            //        '[\u0591-\u07FF\uFB1D-\uFDFF\uFE70-\uFEFC]');
            //    dir = rtlRegex.test(string) ? PocketCode.Ui.Direction.RTL : PocketCode.Ui.Direction.LTR;
            //}
            //return dir;
            return this._rtlRegExp.test(string) ? PocketCode.Ui.Direction.RTL : PocketCode.Ui.Direction.LTR;
        },
        //reset: function () {
        //    this._direction = PocketCode.Ui.Direction.LTR;
        //    if (this._onLanguageChange)
        //        this._onLanguageChange.dispose();
        //    this._onLanguageChange = new SmartJs.Event.Event(this);
        //    if (this._onDirectionChange)
        //        this._onDirectionChange.dispose();
        //    this._onDirectionChange = new SmartJs.Event.Event(this);
        //    if (this._onError)
        //        this._onError.dispose();
        //    this._onError = new SmartJs.Event.Event(this);

        //},
        /* override */
        dispose: function () {
            //static class: cannot be disposed
        },
    });

    return I18nProvider;
})();

//static class: constructor override (keeping code coverage enabled)
PocketCode.I18nProvider = new PocketCode.I18nProvider();