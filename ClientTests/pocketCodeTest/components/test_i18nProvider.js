/// <reference path="../../qunit/qunit-1.18.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/i18nProvider.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/proxy.js" />
'use strict';

QUnit.module("i18nProvider.js");


QUnit.test("I18nProvider", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();
    var done4 = assert.async();

    assert.throws(function () { var c = new PocketCode.I18nProvider(); }, Error, "ERROR: static, no class definition/constructor");
    assert.throws(function () { PocketCode.I18nProvider instanceof PocketCode.I18nProvider }, Error, "ERROR: static class: no instanceof allowed");

    var i18n = PocketCode.I18nProvider; //short

    //init
    assert.ok(i18n.onLanguageChange instanceof SmartJs.Event.Event && i18n.onDirectionChange instanceof SmartJs.Event.Event && i18n.onError instanceof SmartJs.Event.Event, "event getter and type");
    assert.equal(i18n.currentLanguage, undefined, "init: language undefined");
    assert.ok(i18n.supportedLanguages instanceof Array, "supportedLanguages: getter and type");

    //test dictionary
    i18n._dictionary = {};
    assert.equal(i18n.getLocString("not found"), "[not found]", "add brackets on locStrings not available in dictionary"),
    i18n._dictionary.found = "valid key";
    assert.equal(i18n.getLocString("found"), "valid key", "get locString available in dictionary"),


    //loading
    //as there is no onload, we call both loading methods and wait for the languageChange event

    i18n._direction = PocketCode.Ui.Direction.RTL;  //set to get event fired

    var errorHandler = function () {
        assert.ok(false, "error loading i18n: internet connectivity problem?");
    };
    i18n.onError.addEventListener(new SmartJs.Event.EventListener(errorHandler, this));

    var directionChangeHandler = function (e) {
        assert.ok(true, "direction change fired");
        done1();
    };
    i18n.onDirectionChange.addEventListener(new SmartJs.Event.EventListener(directionChangeHandler, this));

    var languageChangeHandler = function (e) {
        assert.ok(true, "language change fired");
        assert.ok(i18n.currentLanguage !== undefined, "language defined after loading");
        assert.ok(i18n.supportedLanguages.length > 0, "supported languages loaded");

        TestCallWithParam();
        done2();
    };
    i18n.onLanguageChange.addEventListener(new SmartJs.Event.EventListener(languageChangeHandler, this));

    i18n.loadSuppordetLanguages();
    i18n.loadDictionary();

    function TestCallWithParam() {
        //make sure no other listeners are registered
        i18n._onLanguageChange = new SmartJs.Event.Event(i18n);

        var languageChangeHandler2 = function (e) {
            assert.ok(true, "language change fired: using parameter");

            done3();
        };
        i18n.onLanguageChange.addEventListener(new SmartJs.Event.EventListener(languageChangeHandler2, this));

        i18n.loadDictionary("en-GB");
    }

    //disposing without effect on the object
    i18n.dispose();
    assert.ok(i18n.supportedLanguages instanceof Array && !i18n._disposed, "dispose: no effect");
    done4();
});



