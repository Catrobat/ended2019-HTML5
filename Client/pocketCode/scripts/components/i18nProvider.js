'use strict';

//RFC 3066 implementation: as singleton
PocketCode.I18nProvider = (function (propObject) {

    function I18nProvider() {

        this._direction = PocketCode.Ui.Direction.LTR;

        this._dictionary = {    //storage: including locStrings used before loading / errors on loading
            "lblLoadingResources": "Loading resources...",
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
            //"lblLoading": "Loading...",
            //"lblInitialising": "Initialising...",
            /*changed*/"lblLoadingResources": "Loading resources...",
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
            
            //"msgErrorLoadingError": "Error: loading failed",

            /*new*/"msgErrorSorry": "We are sorry.",
            /*change*/"msgErrorReportGenerated": "An anonymous error report was generated and sent to our developer team- we will have a look asap.",
            /*new*/"msgErrorExit": "Application will be closed.",

            "lblGlobalErrorCaption": "Global Error",
            /*change*/"msgGlobalError": "A global exception was detected.",

            "lblBrowserNotSupportedErrorCaption": "Browser Not Supported",
            "msgBrowserNotSupportedError": /*"This application makes use of html5 features but is tested to be compatible with the latest versions of all common browsers. <br/>We are sorry, but */"your browser does not meet the minimal requirements to run this application.<br/>Please try again using another browser.",

            "lblMobileRestrictionsWarningCaption": "Please Confirm",
            "msgMobileRestrictionsWarning": "Due to mobile browser restrictions you have to confirm that this application is allowed to download/cache/show/play images and audio/video content required in the requested project.",
            "msgMobileRestrictionsDebug": "There is currently NO official support for mobile devices- this is an experimental preview only!\nSo please do NOT file bugs until there is an official release available.",

            "lblExitDialogCaption": "Exit Application",
            "msgExitDialog": "Do you really want to exit?",

            "lblProjectNotFoundErrorCaption": "Project Not Found",
            /*change*/"msgProjectNotFoundError": "The project you are trying to load could not be found on our server. Please make sure you are using a valid Project ID.",

            "lblProjectNotValidErrorCaption": "Project Not Valid",
            /*change*/"msgProjectNotValidError": "The project you are trying to load has an invalid file structure or missing resources.",//<br/>Details:<br/>",

            "lblParserErrorCaption": "Error Parsing Project",
            /*change*/"msgParserError": "The project you are trying to load could not be parsed correctly on our server.",// Please open an issue on either Github or Jira providing the projects ID- we will have a look asap.",

            "lblInternalServerErrorCaption": "Internal Server Error",
            /*change*/"msgInternalServerError": "The latest request caused an internal server error.",//<br/>",

            "lblServerConnectionErrorCaption": "Server Not Responding",
            /*change*/"msgServerConnectionError": "Error connecting to our server or server not responding.\nPlease make sure you are connected to the internet.",//\nIf your connection was temporarily unavailable please click \"{0}\" to resend the request.",

            "lblScreenshotCaption": "Screenshot",
            "msgScreenshotMobile": "Please use the long-press event of your browser to download/save the screenshot",
            //"lblUnsupportedSoundWarningCaption": "Unsupported Sound File",
            //"lblUnsupportedDeviceFeatureWarningCaption": "Unsupported Device Feature",
            //"msgUnsupportedSoundWarning": "We have detected a sound file (or codec) that is not compatible with your current browser.<br/>You can run the project anyway - unsupported sounds will be ignored.",
            //"msgUnsupportedDeviceFeatureWarning": "The requested project makes use of device features currently not supported in our player and/or not available on your device/current browser.<br/>You can run the project anyway- unsupported features will be ignored.",

            /*new*/lblProjectLoadingErrorCaption: 'Loading failed',
            /*new*/msgProjectLoadingError: "There was an error loading the project's resources.\nPlease make sure you are connected to the internet.",
            /*new*/"msgUnsupportedDefaultCaption": "Note",
            /*new*/"msgUnsupportedDefault": "Something you should know before running this project:",
            /*new*/"msgUnsupportedWarningCaption": "Attention",
            /*new*/"msgUnsupportedWarning": "Following features used in this project are not compatible with your device or browser:",
            /*new*/"msgUnsupportedWarningContinue": "You can run the project anyway- unsupported features will be ignored.",

            //new (below)
            msgDeviceEmulation: "This project uses your device's inclination sensors. You can use your cursor keys (keyboard) to emulate these sensors.",
            msgDeviceLockScreen: "This project uses your device's sensors. We recommend to lock your screen during execution to avoid side-effects.",
            lblUnsupportedSound: 'At least one sound file or codec',// is not compatible with your browser',
            lblUnsupportedBricks: 'Unsupported brick/s found',

            lblDeviceAcceleration: 'Device acceleration sensor',
            lblDeviceCompass: 'Device compass',
            lblDeviceInclination: 'Device inclination sensor',
            lblDeviceCamera: 'Device camera',
            lblDeviceFlash: 'Device flash',
            lblDeviceVibrate: 'Device vibration',
            lblDeviceLegoNXT: 'Lego Mindstorms NXT bricks or sensors',
            lblDevicePhiro: 'PHIRO bricks or sensors',
            lblDeviceArduino: 'Arduino bricks or sensors',
        });

        this._supportedLanguages = [];

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
            this._dictionary.merge(json.dictionary); //using merge: so we can provide an initial dict for loading and errors
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