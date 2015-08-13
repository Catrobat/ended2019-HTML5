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
        this._dictionary = {};  //storage
        this._supportedLanguages = {
            en: {
                US: 'English US??',   //TODO: load from server?
            },
        };

        this._onLanguageChange = new SmartJs.Event.Event(this);
        this._onDirectionChange = new SmartJs.Event.Event(this);
    }

    //properties
    Object.defineProperties(I18nProvider.prototype, {
        languageCode: {
            get: function () {
                return this._languageCode;
            },
        },
        countryCode: {
            get: function () {
                return this._countryCode;
            },
        },
    });

    //events
    Object.defineProperties(I18nProvider.prototype, {
        onLanguageChange: {
            get: function () {
                return this._onLanguageChange;
            },
        },
        onDirectionChange: {
            get: function () {
                return this._onDirectionChange;
            },
        },
    });

    //methods
    I18nProvider.prototype.merge({
        getValue: function(key) {
            //TODO: dict lookup including fallback
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
    });

    return I18nProvider;
})();

//static class: constructor override (keeping code coverage enabled)
PocketCode.I18nProvider = new PocketCode.I18nProvider();