'use strict';

//RFC 3066 implementation: as singleton
PocketCode.I18nProvider = (function (propObject) {

    function I18nProvider() {

        this._direction = PocketCode.Ui.Direction.LTR;

        this._dictionary = {    //storage: including locStrings used before loading / errors on loading
            "lblOk":"OK",
            "lblCancel":"Cancel",
            "lblConfirm":"Confirm",
            "lblExit":"Exit",
            "lblRetry":"Retry",
            "lblContinue":"Continue",
            "lblClose":"Close",
            "lblDownload":"Download",
            "lblLoadingResources": "Loading resources...",
            "btnBack":"Back",
            "btnRestart":"Restart",
            "btnPlay":"Play",
            "btnStart":"Start",
            "btnPause":"Pause",
            "btnResume":"Resume",
            "btnScreenshot":"Screenshot",
            "btnAxes":"Axes",
            "msgErrorSorry": "We are sorry.",
            "msgErrorReportGenerated": "An anonymous error report was generated and sent to our developer team- we will have a look asap.",
            "msgErrorExit": "Application will be closed.",
            "lblGlobalErrorCaption": "Global Error",
            "msgGlobalError": "A global exception was detected.",
            "lblBrowserNotSupportedErrorCaption": "Browser Not Supported",
            "msgBrowserNotSupportedError": "Your browser does not meet the minimal requirements to run this application.",
            "msgBrowserNotSupportedErrorOther": "Please try again using another browser.",
            "lblMobileRestrictionsWarningCaption": "Please Confirm",
            "msgMobileRestrictionsWarning": "Due to mobile browser restrictions you have to confirm that this application is allowed to download, cache, show/play images and audio/video content required in the requested project.",
            "msgMobileRestrictionsDebug": "There is currently NO official support for mobile devices- this is an experimental preview only! So please do NOT file bugs until there is an official release available.",
            "lblExitDialogCaption": "Exit Application",
            "msgExitDialog": "Do you really want to exit?",
            "lblProjectNotFoundErrorCaption": "Project Not Found",
            "msgProjectNotFoundError": "The project you are trying to load could not be found on our server. Please make sure you are using a valid Project ID.",
            "lblProjectNotValidErrorCaption": "Project Not Valid",
            "msgProjectNotValidError": "The project you are trying to load has an invalid file structure or missing resources.",
            "lblParserErrorCaption": "Error Parsing Project",
            "msgParserError": "The project you are trying to load could not be parsed correctly on our server.",
            "lblInternalServerErrorCaption": "Internal Server Error",
            "msgInternalServerError": "The latest request caused an internal server error.",
            "lblServerConnectionErrorCaption": "Server Not Responding",
            "msgServerConnectionError": "Error connecting to our server or server not responding.",
            "msgInternetConnectionAvailable": "Please make sure you are connected to the internet.",
            "lblScreenshotCaption": "Screenshot",
            "msgScreenshotMobile": "Please use the long-press event of your browser to download/save the screenshot",
            "lblProjectLoadingErrorCaption": "Loading failed",
            "msgProjectLoadingError": "There was an error loading the project's resources.",
            "msgUnsupportedDefaultCaption": "Note",
            "msgUnsupportedDefault": "Something you should know before running this project:",
            "msgUnsupportedWarningCaption": "Attention",
            "msgUnsupportedWarning": "Following features used in this project are not compatible with your device or browser:",
            "msgUnsupportedWarningContinue": "You can run the project anyway- unsupported features will be ignored.",
            "msgDeviceEmulation": "This project uses your device's inclination sensors. You can use your cursor keys (keyboard) to emulate these sensors.",
            "msgDeviceLockScreen": "This project uses your device's sensors. We recommend to lock your screen during execution to avoid side-effects.",
            "lblUnsupportedSound": "At least one sound file or codec",
            "lblUnsupportedBricks": "Unsupported brick/s found",
            "lblDeviceAcceleration": "Device acceleration sensor",
            "lblDeviceCompass": "Device compass",
            "lblDeviceInclination": "Device inclination sensor",
            "lblDeviceCamera": "Device camera",
            "lblDeviceFlash": "Device flash",
            "lblDeviceVibrate": "Device vibration",
            "lblDeviceLegoNXT": "Lego Mindstorms NXT bricks or sensors",
            "lblDevicePhiro": "PHIRO bricks or sensors",
            "lblDeviceArduino": "Arduino bricks or sensors"
        };  
        this._dictionary.merge({    //only included for testing --> for new messages before they are at crowdin

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