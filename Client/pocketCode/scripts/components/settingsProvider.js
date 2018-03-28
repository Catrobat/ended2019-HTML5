'use strict';

//provides an interface for either localStorage or cookie based on browser support
PocketCode._SettingsProvider = (function () {
    SettingsProvider.extends(SmartJs.Components.StorageAdapter, false);

    function SettingsProvider() {
        SmartJs.Components.StorageAdapter.call(this);

        this._adapter = new SmartJs.Components.LocalStorageAdapter();
        if (!this._adapter.supported)
            this._adapter = new SmartJs.Components.CookieAdapter();
        if (!this._adapter.supported)
            this._supported = false;
        else {
            this._supported = true;
            this._adapter.onChange.addEventListener(new SmartJs.Event.EventListener(function (e) { this.onChange.dispatchEvent(e); }, this));
        }
    }

    SettingsProvider.prototype.merge({
        /* override */
        setValue: function (key, value) {
            this._adapter.setValue(key, value);
        },
        getValue: function (key) {
            return this._adapter.getValue(key);
        },
        deleteKey: function (key) {
            this._adapter.deleteKey(key);
        },
        clear: function () {
            this._adapter.clear();
        },
        dispose: function () {
            //static class: cannot be disposed
        },
    });

    return SettingsProvider;
})();

//static class: constructor override (keeping code coverage enabled)
PocketCode.SettingsProvider = new PocketCode._SettingsProvider();
