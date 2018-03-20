/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/i18nProvider.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/proxy.js" />
'use strict';

QUnit.module("components/i18nProvider.js");


QUnit.test("I18nProvider", function (assert) {

    //important: the I18nProvider is a static class or singleton: there is only one instance which is created during loading and cannot be recreated
    //based on the fact that instances /references) may be used in other classes (e.g. PlayerPageController) there may be some problems/side-effects if
    //we do not remove all listeners- they get called again and trigger an error in other test classes

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
    assert.equal(i18n.getLocString("not found"), "[not found]", "add brackets on locStrings not available in dictionary");
    i18n._dictionary.found = "valid key";
    assert.equal(i18n.getLocString("found"), "valid key", "get locString available in dictionary");


    //loading
    //as there is no onload, we call both loading methods and wait for the languageChange event

    i18n._direction = PocketCode.Ui.Direction.RTL;  //set to get event fired

    var errorListener,
        errorHandler = function () {
            assert.ok(false, "error loading i18n: internet connectivity problem?");
        };
    errorListener = new SmartJs.Event.EventListener(errorHandler, this);
    i18n.onError.addEventListener(errorListener);

    var directionChangeListener,
        directionChangeHandler = function (e) {
            assert.ok(true, "direction change fired");

            i18n.onError.removeEventListener(errorListener);
            i18n.onDirectionChange.removeEventListener(directionChangeListener);
            done1();
        };
    directionChangeListener = new SmartJs.Event.EventListener(directionChangeHandler, this);
    i18n.onDirectionChange.addEventListener(directionChangeListener);

    var languageChangeListener,
        languageChangeHandler = function (e) {
            i18n.onLanguageChange.removeEventListener(languageChangeListener);

            assert.ok(true, "language change fired");
            assert.ok(i18n.currentLanguage !== undefined, "language defined after loading");
            assert.ok(i18n.supportedLanguages.length > 0, "supported languages loaded");

            TestCallWithParam();
            done2();

            i18n.loadDictionary(i18n.currentLanguage);  //make sure not loaded again- code coverage only
        };
    languageChangeListener = new SmartJs.Event.EventListener(languageChangeHandler, this);
    i18n.onLanguageChange.addEventListener(languageChangeListener);

    i18n.init();
    //i18n.init(i18n.currentLanguage);

    function TestCallWithParam() {
        var languageChangeListener2,
            languageChangeHandler2 = function (e) {
                i18n.onLanguageChange.removeEventListener(languageChangeListener2);
                //^^ remove after 1st call- we will get an error (assert after last done) because the i18nProvider is a static class/singleton

                assert.ok(true, "language change fired: using parameter");
                assert.equal(e.language, "en", "language change event argument check"); //language is "en" even "en-GB" was loaded
                assert.equal(i18n.currentLanguageDirection, "ltr", "language getter");

                //make sure all event listeners are removed
                i18n._onError = new SmartJs.Event.Event(i18n);
                i18n._onLanguageChange = new SmartJs.Event.Event(i18n);
                i18n._onDirectionChange = new SmartJs.Event.Event(i18n);

                done3();
            };
        languageChangeListener2 = new SmartJs.Event.EventListener(languageChangeHandler2, this);
        i18n.onLanguageChange.addEventListener(languageChangeListener2);

        i18n.loadDictionary("en-GB");
    }

    //disposing without effect on the object
    i18n.dispose();
    assert.ok(i18n.supportedLanguages instanceof Array && !i18n._disposed, "dispose: no effect");

    //getTextDirection
    assert.equal(i18n.getTextDirection("Россия"), "ltr", "check direction: ltr");
    assert.equal(i18n.getTextDirection("۱ آزمایش. 2 آزمایش، سه آزمایش & Foo آزمایش!"), "rtl", "check direction: rtl");

    done4();
});
