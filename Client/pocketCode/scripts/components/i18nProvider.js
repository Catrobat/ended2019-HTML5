'use strict';

//RFC 3066 implementation: as singleton
PocketCode.I18nProvider = (function (propObject) {

    function I18nProvider() {

        this._direction = PocketCode.Ui.Direction.LTR;

        this._dictionary = {    //storage: including locStrings used before loading / errors on loading
            //TODO:
        };  
        this._dictionary.merge({    //only included for testing
            "lblOk": "OK",
            "lblCancel": "Cancel",
            "lblConfirm": "Confirm",
            "lblExit": "Exit",
            "lblRetry": "Retry",
            "lblContinue": "Continue",
            "lblClose": "Close",
            "lblDownload": "Download",
            "lblLoading": "Loading...",
            "lblInitialising": "Initialising...",
            "lblLoadingRes": "Loading resources...",
            "btnBack": "Back",
            /*changed: play to start*/"btnStart": "Start",
            "btnRestart": "Restart",
            "btnPause": "Pause",
            /*new*/"btnResume": "Resume",
            "btnScreenshot": "Screenshot",
            "btnAxes": "Axes",
            //"msgExit": "Do you really want to exit?",
            //"msgGlobal": "We are sorry. A global exception was detected.<br/>Please open an issue on either Github or JIRA providing the projects ID - we will have a look asap.",
            //"msgBrowserNotSupported": "This application makes use of html5 features but is tested to be compatible with the latest versions of all common browsers. <br/>We are sorry, but your browser does not meet the minimal requirements to run this application.<br/>Please try again using another browser.",
            //"msgMobileRestrictions": "Due to mobile browser restrictions you have to confirm that this application is allowed to download/cache/show/play images and audio/video content required in the requested project.<br/><br/>There is currently NO official support for mobile devices - this is an experimental preview only! So please do NOT file bugs until there is an official release available.",
            //"msgProjectNotFound": "We are sorry.<br/>The project you are requesting could not be found on our server. Please make sure you are using a valid Project ID.",
            //"msgProjectNotValid": "We are sorry.<br/>The project you are requesting has an invalid file structure or missing resources.<br/>Details:<br/>",
            //"msgParser": "We are sorry.<br/>The project you are requesting could not be parsed correctly on our server. Please open an issue on either Github or Jira providing the projects ID- we will have a look asap.",
            //"msgInternalServer": "We are sorry. The latest request caused an internal server error.<br/>",
            //"msgServerConnection": "Error connecting our server or server not responding.<br/>Please make sure you are connected to the internet.<br/>If your connection was temporarily unavailable please click \"Retry\" to resend the request.",
            //"msgUnsupportedSound": "We have detected a sound file (or codec) that is not compatible with your current browser.<br/>You can run the project anyway - unsupported sounds will be ignored.",
            //"msgUnsupportedDevice": "The requested project makes use of device features currently not supported in our player and/or not available on your device/current browser.<br/>You can run the project anyway- unsupported features will be ignored.",
            //"msgErrorLoading": "Error: loading failed",
            
            /*change*/"msgProjectNotFoundError": "The project you are requesting could not be found on our server. Please make sure you are using a valid Project ID.",
            /*change*/"msgProjectNotValidError": "The project you are requesting has an invalid file structure or missing resources.<br/>Details:<br/>",
            /*change*/"msgParserError": ">The project you are requesting could not be parsed correctly on our server. Please open an issue on either Github or Jira providing the projects ID- we will have a look asap.",
            /*change*/"msgInternalServerError": "The latest request caused an internal server error.<br/>",
            "msgServerConnectionError": "Error connecting our server or server not responding.<br/>Please make sure you are connected to the internet.<br/>If your connection was temporarily unavailable please click \"Retry\" to resend the request.",
            "msgUnsupportedSoundWarning": "We have detected a sound file (or codec) that is not compatible with your current browser.<br/>You can run the project anyway - unsupported sounds will be ignored.",
            "msgUnsupportedDeviceFeatureWarning": "The requested project makes use of device features currently not supported in our player and/or not available on your device/current browser.<br/>You can run the project anyway- unsupported features will be ignored.",
            "msgErrorLoadingError": "Error: loading failed",

            /*new*/"msgErrorSorry": "We are sorry.",
            /*change*/"lblErrorReportGenerated": "An anonymous error report was generated and sent to our developer team - we will have a look asap.",
            /*new*/"msgErrorExit": "Application will be closed.",

            "lblGlobalErrorCaption": "Global Error",
            /*change*/"msgGlobalError": "A global exception was detected.",

            "lblBrowserNotSupportedErrorCaption": "Framework Not Supported",
            "msgBrowserNotSupportedError": "This application makes use of html5 features but is tested to be compatible with the latest versions of all common browsers. <br/>We are sorry, but your browser does not meet the minimal requirements to run this application.<br/>Please try again using another browser.",

            "lblMobileRestrictionsWarningCaption": "Please Confirm",
            "msgMobileRestrictionsWarning": "Due to mobile browser restrictions you have to confirm that this application is allowed to download/cache/show/play images and audio/video content required in the requested project.",
            "msgMobileRestrictionsDebug": "There is currently NO official support for mobile devices - this is an experimental preview only! So please do NOT file bugs until there is an official release available.",

            "lblExitDialogCaption": "Exit Application",
            "msgExitDialog": "Do you really want to exit?",

            "lblProjectNotFoundErrorCaption": "Project Not Found",
            "lblProjectNotValidErrorCaption": "Project Not Valid",
            "lblParserErrorCaption": "Error Parsing Project",
            "lblInternalServerErrorCaption": "Internal Server Error",
            "lblServerConnectionErrorCaption": "Server Not Responding",
            "lblUnsupportedSoundWarningCaption": "Unsupported Sound File",
            "lblUnsupportedDeviceFeatureWarningCaption": "Unsupported Device Feature",

            "lblScreenshotCaption": "Screenshot",
            "msgScreenshotMobile": "Please use the long-press event of your browser to download/save the screenshot",

            //new (below)
            lblDevFeatureAcceleration: 'device acceleration sensor',
            lblDevCompass: 'device compass',
            lblDevInclination: 'device inclination sensor',
            lblDevCamera: 'device camera',
            lblDevFlashlight: 'devicec flashlite',
            lblDevVibrate: 'device vibration',
            lblDevLegoNXT: 'Lego Mindstorms NXT bricks or sensors',
            lblDevPhiro: 'PHIRO bricks or sensors',
            lblDevArduino: 'Arduino bricks or sensors',
        });

        this._supportedLanguages = [];
        //this._supportedLanguages = [   //TODO: load from server?
        //    { 'languageCode': 'en-GB', 'uiString': 'English (UK)' },
        //    { 'languageCode': 'en-US', 'uiString': 'English (US)' },
        //    { 'languageCode': 'de-AT', 'uiString': 'Deutsch (Österreich)' },
        //    { 'languageCode': 'de-CH', 'uiString': 'Deutsch (Schweiz)' },
        //    { 'languageCode': 'de-DE', 'uiString': 'Deutsch (Deutschland)' }
        //];

        this._onLanguageChange = new SmartJs.Event.Event(this);
        this._onDirectionChange = new SmartJs.Event.Event(this);
        this._onError = new SmartJs.Event.Event(this);
    }

    //properties
    Object.defineProperties(I18nProvider.prototype, {
        currentLanguage: {
            get: function () {
                return this._currentLanguage;
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
        loadSuppordetLanguages: function () {
            var req = new PocketCode.ServiceRequest(PocketCode.Services.I18N_LANGUAGES, SmartJs.RequestMethod.GET);
            req.onLoad.addEventListener(new SmartJs.Event.EventListener(this._loadSuppordetLanguagesLoadHandler, this));
            req.onError.addEventListener(new SmartJs.Event.EventListener(this._loadErrorHandler, this));
            PocketCode.Proxy.send(req);
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
            if (rfc3066)
                var req = new PocketCode.ServiceRequest(PocketCode.Services.I18N, SmartJs.RequestMethod.GET, { rfc3066: rfc3066 });
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
            //this._dictionary = json.dictionary;
            this._dictionary.merge(json.dictionary); //temp: merge: so we can add strings client side that are currently not available on our server
            this._currentLanguage = json.languageCode;
            this._onLanguageChange.dispatchEvent();
        },
        _loadErrorHandler: function (e) {
            this.onError.dispatchEvent(e);
        },
        getLocString: function (key) {
            if (!this._dictionary[key])
                return '[' + key + ']';

            return this._dictionary[key];
        },
        /* override */
        dispose: function () {
            //static class: cannot be disposed
        },
    });

    return I18nProvider;
})();

//static class: constructor override (keeping code coverage enabled)
PocketCode.I18nProvider = new PocketCode.I18nProvider();