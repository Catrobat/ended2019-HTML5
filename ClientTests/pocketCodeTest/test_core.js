'use strict';

QUnit.module("/core.js");


QUnit.test("core framework", function (assert) {

    var compatible = PocketCode.isPlayerCompatible();
    assert.ok(compatible.result, "browser compatibility check");

});


QUnit.test("PocketCode.Core.I18nString", function (assert) {

    var i18nProvider = PocketCode.I18nProvider;
    PocketCode.I18nProvider = undefined;    //temp remove for tests
    var s = new PocketCode.Core.I18nString("notFound", "x");
    assert.ok(s instanceof PocketCode.Core.I18nString && s instanceof SmartJs.Core.String, "instance check");
    assert.equal(s.toString(), "[notFound]", "i18n string not found (i18n Provider not available)");

    PocketCode.I18nProvider = i18nProvider; //restore provider
    //set test data
    i18nProvider._dictionary.merge({
        test: "test1: {0}",
        test2: "test2: ",
        test3: "test1: {0}, test2: {1}, test3: {2}",
        test4: "test1: {0}, test1: {0}, test3: {2}",

    });

    s = new PocketCode.Core.I18nString("notFound", "x");
    assert.equal(s.toString(), "[notFound]", "i18n string not found (in dictionary)");

    s.i18nKey = "test"; //setter
    assert.equal(s.toString(), "test1: x", "i18nKey setter + single replacement");

    s = new PocketCode.Core.I18nString("test", "x", 1, 123);
    assert.equal(s.toString(), "test1: x", "single replacement, multiple arguments");
    s = new PocketCode.Core.I18nString("test2", "x", 1, 123);
    assert.equal(s.toString(), "test2: ", "no replacement, multiple arguments");
    s = new PocketCode.Core.I18nString("test2");
    assert.equal(s.toString(), "test2: ", "no replacement, no arguments");
    s = new PocketCode.Core.I18nString("test3", "x", 1, 123);
    assert.equal(s.toString(), "test1: x, test2: 1, test3: 123", "multiple replacements");
    s = new PocketCode.Core.I18nString("test4", "x", 1, 123);
    assert.equal(s.toString(), "test1: x, test1: x, test3: 123", "multiple replacements with same argument");

    assert.throws(function () { var x = new PocketCode.Core.I18nString(); }, "ERROR: invalid constructor: missing");
    assert.throws(function () { var x = new PocketCode.Core.I18nString(1); }, "ERROR: invalid constructor: !string");
    s = new PocketCode.Core.I18nString("test3", "x", 1);
    assert.throws(function () { s.toString(); }, "ERROR: missing argument");

    //advanced tests
    s = new PocketCode.Core.I18nString("test3", "x", 1, new PocketCode.Core.I18nString("test", "y"));
    assert.equal(s.toString(), "test1: x, test2: 1, test3: test1: y", "replace with another i18nString: recursive parse");

});

