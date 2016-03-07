'use strict';

//RFC 3066 implementation: as singleton
PocketCode.I18nProvider = (function (propObject) {

    function I18nProvider() {

        this._direction = PocketCode.Ui.Direction.LTR;

        this._dictionary = {};  //storage
        this._dictionary = {
          lblOk: "OK",
          lblCancel: "Abbrechen",
          lblConfirm: "Bestätigen",
          lblExit: "Verlassen",
          lblRetry: "Wiederholen",
          lblContinue: "Fortsetzen",
          lblClose: "Schließen",
          lblDownload: "Download",
          lblLoading: "Lädt...",
          lblInitialising: "Initialisierung...",
          lblLoadingRes: "Lädt Ressourcen...",

          btnBack: "Zurück",
          btnRestart: "Neu starten",
          btnPlay: "Play",
          btnPause: "Pause",
          btnScreenshot: "Screenshot",
          btnAxes: "Achsen",

          msgExit: "Wirklich beenden?",
          msgGlobal: "Das tut uns leid, eine globale Exception wurde erkannt. <br/> Bitte öffnen Sie ein Issue auf Github oder JIRA mit der Projekt-ID - wir werden es schnellstmöglich bearbeiten.",
          msgBrowserNotSupported: "Diese App verwendet HTML5 Features, die alle in der neuesten Version aller gängigen Browser vorhanden sind. <br/>Es tut uns leid, aber Dein Browser unterstützt nicht unsere minimalen Anforderungen für diese App. <br/>Bitte versuche es mit einem anderen Browser.",
          msgMobileRestrictions: "Aufgrund von Einschränkungen der mobilen Browser müssen Sie bestätigen, dass diese Anwendung Audio- und Videoinhalte downloaden/cachen/zeigen/abspielen darf. <br/> <br/> Derzeit gibt es keine offizielle Unterstützung für mobile Geräte - dies ist nur eine experimentelle Vorschau! Wir bitten daher nicht um Fehlermeldungen bis ein offizielles Release verfügbar ist.",
          msgProjectNotFound: "Entschuldigung. <br/> Das Projekt, das Sie anfordern konnte auf unserem Server nicht gefunden werden. Bitte stelle sicher, dass die Projekt-ID gültig ist.",
          msgProjectNotValid: "Entschuldigung. <br/> Das Projekt, die Sie anfordern hat eine ungültige Datei-Struktur oder fehlenden Ressourcen. <br/> Details: <br/>",
          msgParser: "Entschuldigung. <br/> Das Projekt, das Sie anfordern konnte auf unserem Server nicht ordnungsgemäß geparsed werden. Öffnen Sie bitte ein Issue auf Github oder Jira mit der zugehören Projekt-ID - wir werden es schnellstmöglich bearbeiten.",
          msgInternalServer: "Entschuldigung. Die letzte Anfrage hat einen internen Serverfehler verursacht. <br/>",
          msgServerConnection: "Fehler beim Verbinden mit unserem Server oder Server antwortet nicht. <br/> Bitte stellen Sie sicher, dass Sie mit dem Internet verbunden sind. <br/> Wenn Ihre Verbindung vorübergehend nicht verfügbar war, klicken Sie bitte 'Wiederholen', um die Anfrage erneut zu senden.",
          msgUnsupportedSound: "Eine Datei (oder Codec) wurde derkannt, der nicht mit Ihrem aktuellen Browser kompatibel ist. <br/> Sie können das Projekt trotzdem ausführen - nicht unterstützte Töne werden ignoriert.",
          msgUnsupportedDevice: "Das angeforderte Projekt verwendet Features die derzeit nicht von unserem Player und/oder Ihrem Gerät/Browser unterstützt werden. <br/> Sie können das Projekt trotzdem ausführen - nicht unterstützte Features werden ignoriert.",
          msgErrorLoading: "Fehler beim Laden",
          msgExitDialog: "Wirklich beenden?",
          msgBrowserNotSupportedError: "Diese App verwendet HTML5 Features, die alle in der neuesten Version aller gängigen Browser vorhanden sind. <br/>Es tut uns leid, aber Dein Browser unterstützt nicht unsere minimalen Anforderungen für diese App. <br/>Bitte versuche es mit einem anderen Browser.",
          msgMobileRestrictionsWarning: "Aufgrund von Einschränkungen der mobilen Browser müssen Sie bestätigen, dass diese Anwendung Audio- und Videoinhalte downloaden/cachen/zeigen/abspielen darf. <br/> <br/> Derzeit gibt es keine offizielle Unterstützung für mobile Geräte - dies ist nur eine experimentelle Vorschau! Wir bitten daher nicht um Fehlermeldungen bis ein offizielles Release verfügbar ist.",
          msgProjectNotFoundError: "Entschuldigung. <br/> Das Projekt, das Sie anfordern konnte auf unserem Server nicht gefunden werden. Bitte stelle sicher, dass die Projekt-ID gültig ist.",
          msgProjectNotValidError: "Entschuldigung. <br/> Das Projekt, die Sie anfordern hat eine ungültige Datei-Struktur oder fehlenden Ressourcen. <br/> Details: <br/>",
          msgParserError: "Entschuldigung. <br/> Das Projekt, das Sie anfordern konnte auf unserem Server nicht ordnungsgemäß geparsed werden. Öffnen Sie bitte ein Issue auf Github oder Jira mit der zugehören Projekt-ID - wir werden es schnellstmöglich bearbeiten.",
          msgInternalServerError: "Entschuldigung. Die letzte Anfrage hat einen internen Serverfehler verursacht. <br/>",
          msgServerConnectionError: "Fehler beim Verbinden mit unserem Server oder Server antwortet nicht. <br/> Bitte stellen Sie sicher, dass Sie mit dem Internet verbunden sind. <br/> Wenn Ihre Verbindung vorübergehend nicht verfügbar war, klicken Sie bitte 'Wiederholen', um die Anfrage erneut zu senden.",
          msgUnsupportedSoundWarning: "Eine Datei (oder Codec) wurde derkannt, der nicht mit Ihrem aktuellen Browser kompatibel ist. <br/> Sie können das Projekt trotzdem ausführen - nicht unterstützte Töne werden ignoriert.",
          msgUnsupportedDeviceFeatureWarning: "Das angeforderte Projekt verwendet Features die derzeit nicht von unserem Player und/oder Ihrem Gerät/Browser unterstützt werden. <br/> Sie können das Projekt trotzdem ausführen - nicht unterstützte Features werden ignoriert.",
          msgErrorLoadingError: "Fehler beim Laden",
          msgGlobalError: "Das tut uns leid, ein Fehler ist aufgetreten.",
          msgScreenshotMobile: "Bitte benutzen Sie bitte das Long-Press-Event Ihres Browsers, um Screenshot herunterzuladen/speichern",

          lblGlobalErrorCaption: "Globaler Fehler",
          lblBrowserNotSupportedErrorCaption: "Framework nicht unterstützt",
          lblMobileRestrictionsWarningCaption: "Bitte bestätigen",
          lblExitDialogCaption: "Anwendung schliessen",
          lblProjectNotFoundErrorCaption: "Projekt nicht gefunden",
          lblProjectNotValidErrorCaption: "Projekt nicht gültig",
          lblParserErrorCaption: "Fehler beim Parsen des Projekts",
          lblInternalServerErrorCaption: "Interner Serverfehler",
          lblServerConnectionErrorCaption: "Server antwortet nicht",
          lblUnsupportedSoundWarningCaption: "Nicht unterstützte Sound-Datei",
          lblUnsupportedDeviceFeatureWarningCaption: "Nicht unterstütztes Gerät Feature",
          lblScreenshotCaption: "Screenshot",
          lblErrorReportGenerated: "<br/> Ein anonymer Fehlerbericht wurde generiert und an unser Entwicklerteam gesendet - wir werden es schnellstmöglich bearbeiten."
        };

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