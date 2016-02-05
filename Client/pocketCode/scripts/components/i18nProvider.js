'use strict';

//RFC 3066 implementation: as singleton
PocketCode.I18nProvider = (function (propObject) {
    I18nProvider.extends(SmartJs.Core.Component, false);



    function I18nProvider(propObject) {
        SmartJs.Core.Component.call(this, propObject);

        //default settings
        this._direction = PocketCode.Ui.Direction.LTR;
        this._languageCode = 'en';
        this._countryCode = 'US';

        /*
        jQuery.ajax( {
            url: '//freegeoip.net/json/',
            type: 'POST',
            dataType: 'jsonp',
            success: function(location) {
                this.countryCode = location.region_code;
            }
        } );
        */

        this._dictionary = {};  //storage
        this._dictionary = {
          "lbl-ok": "OK",
          "lbl-cancel": "Cancel",
          "lbl-confirm": "Confirm",
          "lbl-exit": "Exit",
          "lbl-retry": "Retry",
          "lbl-continue": "Continue",
          "lbl-close": "Close",
          "lbl-download": "Download",
          "btn-back": "Back",
          "btn-restart": "Restart",
          "btn-play": "Play",
          "btn-pause": "Pause",
          "btn-screenshot": "Screenshot",
          "btn-axes": "Axes",
          "msg-exit": "Do you really want to exit?",
          "msg-global": "We are sorry. A global exception was detected.<br/>Please open an issue on either Github or JIRA providing the projects ID - we will have a look asap.",
          "msg-browser-not-supported": "This application makes use of html5 features but is tested to be compatible with the latest versions of all common browsers. <br/>We are sorry, but your browser does not meet the minimal requirements to run this application.<br/>Please try again using another browser.",
          "msg-mobile-restrictions": "Due to mobile browser restrictions you have to confirm that this application is allowed to download/cache/show/play images and audio/video content required in the requested project.<br/><br/>There is currently NO official support for mobile devices - this is an experimental preview only! So please do NOT file bugs until there is an official release available.",
          "msg-project-not-found": "We are sorry.<br/>The project you are requesting could not be found on our server. Plese make sure you are using a valid Project ID.",
          "msg-project-not-valid": "We are sorry.<br/>The project you are requesting has an invalid file structure or missing resources.<br/>Details:<br/>",
          "msg-parser": "We are sorry.<br/>The project you are requesting could not be parsed correctly on our server. Please open an issue on either Github or Jira providing the projects ID- we will have a look asap.",
          "msg-internal-server": "We are sorry. The latest request caused an internal server error.<br/>",
          "msg-server-connection": "Error connecting our server or server not responding.<br/>Please make sure you are connected to the internet.<br/>If your connection was temporarily unavailable please click 'Retry' to resend the request.",
          "msg-unsupported-sound": "We have detected a sound file (or codec) that is not compatible with your current browser.<br/>You can run the project anyway - unsupported sounds will be ignored.",
          "msg-unsupported-device": "The requested project makes use of device features currently not supported in our player and/or not available on your device/current browser.<br/>You can run the project anyway- unsupported features will be ignored."
        };
      
        this._supportedLanguages = {
            en: {
                US: 'English (US)',   //TODO: load from server?
                UK: 'English (UK)'
            },
            de: {
                AT: 'Deutsch (Österreich)',
                DE: 'Deutsch'
            }
        };

        this._onLanguageChange = new SmartJs.Event.Event(this);
        this._onDirectionChange = new SmartJs.Event.Event(this);
    }

    //properties
    Object.defineProperties(I18nProvider.prototype, {
        languageCode: {
            get: function () {
                return this._languageCode;
            }
        },
        countryCode: {
            get: function () {
                return this._countryCode;
            }
        }
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
        }
    });

    //methods
    I18nProvider.prototype.merge({
        getValue: function(key) {
            //TODO: dict lookup including fallback
        },
        getDict: function() {
            return this._dictionary;
        },
        changeI18n: function (value) {
            //TODO: error handling: array length?
            var codes = value.split('-');
            this._languageCode = codes[0].toLowerCase();    //TODO: check if changed
            this._countryCode = codes[1].toUpperCase();
            this._handleChange();   //call on change and support only
        },
        _handleChange: function () {
            //TODO: check if changed
            //load resources if necessary and supported
            //trigger events if needed:
            //this._onLanguageChange.dispatch({languageCode: this._languageCode, countryCode: this._countryCode, name: 'clear name from dict'});
            //this._onDirectionChange.dispatch({direction: PocketCode.Ui.Direction.LTR OR PocketCode.Ui.Direction.RTL});
        },
        /* override */
        dispose: function () {
            //static class: cannot be disposed
        }
    });

    return I18nProvider;
})();

//static class: constructor override (keeping code coverage enabled)
PocketCode.I18nProvider = new PocketCode.I18nProvider();