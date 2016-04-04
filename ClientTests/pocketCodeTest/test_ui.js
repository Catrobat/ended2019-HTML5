/// <reference path="../qunit/jquery-2.1.1.min.js" />
/// <reference path="../qunit/qunit-1.23.0.js" />
/// <reference path="../../Client/pocketCode/scripts/core.js" />
/// <reference path="../../Client/pocketCode/scripts/ui.js" />
/// <reference path="../../Client/pocketCode/scripts/ui/dialog.js" />
/// <reference path="../../Client/pocketCode/scripts/view/playerPageView.js" />
'use strict';

QUnit.module("ui.js");


QUnit.test("I18nTextNode", function (assert) {

    var i18nProvider = PocketCode.I18nProvider;
    PocketCode.I18nProvider = undefined;    //temp remove for tests

    var tn = new PocketCode.Ui.I18nTextNode("notFound");
    assert.ok(tn instanceof PocketCode.Ui.I18nTextNode && tn instanceof SmartJs.Ui.TextNode, "cntr + instance check");
    assert.equal(tn.text, "[notFound]", "i18nKey not found");
    tn = new PocketCode.Ui.I18nTextNode();
    assert.equal(tn.text, "[undefined]", "i18nKey not set");
    tn = new PocketCode.Ui.I18nTextNode(new PocketCode.Core.I18nString("test"));    //no exception on I18nString
    assert.throws(function () { tn = new PocketCode.Ui.I18nTextNode({}); }, Error, "ERROR: invalid argument: i18nKey");

    PocketCode.I18nProvider = i18nProvider; //restore provider
    //set test data
    i18nProvider._dictionary.merge({
        test: "test1: {0}",
        test2: "test2: ",
        test3: "test1: {0}, test2: {1}, test3: {2}",
        test4: "test1: {0}, test1: {0}, test3: {2}",

    });

    tn = new PocketCode.Ui.I18nTextNode();
    PocketCode.I18nProvider.onLanguageChange.dispatchEvent();
    assert.equal(tn.text, "[undefined]", "i18nKey not set: no error on i18n change event");

    tn = new PocketCode.Ui.I18nTextNode("test");
    assert.equal(tn.text, "test1: {0}", "i18nKey set");

    tn = new PocketCode.Ui.I18nTextNode(new PocketCode.Core.I18nString("test", "NOW"));
    assert.equal(tn.text, "test1: NOW", "i18nKey set with I18nString");

    tn.i18n = new PocketCode.Core.I18nString("test4", "x", 1, "NOW");
    assert.equal(tn.text, "test1: x, test1: x, test3: NOW", "i18n setter");
    tn.i18n = "test3";  //update internal key only
    assert.equal(tn.text, "test1: x, test2: 1, test3: NOW", "i18n setter: update internal key only");
    assert.throws(function () { tn.i18n = {}; }, Error, "ERROR: invalid setter: i18nKey");

    tn = new PocketCode.Ui.I18nTextNode(new PocketCode.Core.I18nString("test", "NOW"), "->");
    assert.equal(tn.text, "test1: NOW", "i18nKey set with I18nString + insertBefore");
    assert.equal(tn._dom.textContent, "->test1: NOW", "rendered correctly: insertBefore");

    tn = new PocketCode.Ui.I18nTextNode(new PocketCode.Core.I18nString("test", "NOW"), undefined, "<-");
    assert.equal(tn.text, "test1: NOW", "i18nKey set with I18nString + insertAfter");
    assert.equal(tn._dom.textContent, "test1: NOW<-", "rendered correctly: insertAfter");

    tn = new PocketCode.Ui.I18nTextNode(new PocketCode.Core.I18nString("test", "NOW"), "->", "<-");
    assert.equal(tn.text, "test1: NOW", "i18nKey set with I18nString + insertBefore & after");
    assert.equal(tn._dom.textContent, "->test1: NOW<-", "rendered correctly: insertBefore and after");

    tn = new PocketCode.Ui.I18nTextNode(new PocketCode.Core.I18nString("test", "NOW"), "->", new PocketCode.Core.I18nString("test4", "x", 1, "NOW"));
    assert.equal(tn.text, "test1: NOW", "i18nKey set with I18nString + insertBefore & after = object supporting toString()");
    assert.equal(tn._dom.textContent, "->test1: NOWtest1: x, test1: x, test3: NOW", "rendered correctly: insertBefore and after = object supporting toString()");

    var dom = document.getElementById("qunit-fixture");
    var div = document.createElement("div");
    dom.appendChild(div);
    var vp = new SmartJs.Ui.Control(div);   //if you make dom a Control in UnitTests the ID will change and cause errors on other test cases
    var layoutChangeCounter = 0;
    var layoutChangeHandler = function (e) {
        layoutChangeCounter++;
    };
    vp.onLayoutChange.addEventListener(new SmartJs.Event.EventListener(layoutChangeHandler, this));

    vp._appendChild(tn);
    assert.equal(layoutChangeCounter, 1, "parent layout change was triggered: parent logic");

    tn.hide();
    assert.equal(layoutChangeCounter, 2, "parent layout change was triggered: on hide");
    assert.equal(tn.text, "test1: NOW", "i18nKey set with I18nString + insertBefore & after = object supporting toString()");
    assert.equal(tn._dom.textContent, "", "hidden: text set but not shown");
    tn.show();
    assert.equal(layoutChangeCounter, 3, "parent layout change was triggered: on show");
    assert.equal(tn._dom.textContent, "->test1: NOWtest1: x, test1: x, test3: NOW", "show(): sets ui text including insertBefore, insertAfter");

    tn.i18n = "test1";
    assert.equal(layoutChangeCounter, 4, "parent layout change was triggered: i18n setter");

    i18nProvider._dictionary.test1 = "neuer text in anderer sprache";
    i18nProvider.onLanguageChange.dispatchEvent();
    assert.equal(layoutChangeCounter, 5, "parent layout change was triggered: on languageChange");
    assert.equal(tn._dom.textContent, "->neuer text in anderer sprachetest1: x, test1: x, test3: NOW", "show(): sets ui text including insertBefore, insertAfter, new language");

    tn.dispose();
    assert.equal(tn._disposed, true, "disposed");

});


QUnit.test("I18nControl", function (assert) {

    var ctr = new PocketCode.Ui.I18nControl("div");
    assert.ok(ctr instanceof PocketCode.Ui.I18nControl && ctr instanceof SmartJs.Ui.Control, "cntr + instance check");

    var TestControl = (function () {
        TestControl.extends(PocketCode.Ui.I18nControl, false);
        //cntr
        function TestControl(element, propObject) {
            PocketCode.Ui.I18nControl.call(this, element, propObject);

            this.testCount = 0;
        }

        //methods
        TestControl.prototype.merge({
            _updateUiStrings: function () {
                this.testCount++;
            },
        });

        return TestControl;
    })();

    var x = new TestControl("div");
    PocketCode.I18nProvider.onLanguageChange.dispatchEvent();
    assert.equal(x.testCount, 1, "base class triggers UI update event + method call");

});


QUnit.test("Viewport", function (assert) {

    var vp = new PocketCode.Ui.Viewport();
    assert.ok(vp instanceof PocketCode.Ui.Viewport && vp instanceof SmartJs.Ui.Viewport, "cntr + instance check");

    assert.throws(function () { vp.addDialog(""); }, Error, "ERROR: invalid argument: dialog");
    var dialog = new PocketCode.Ui.ScreenshotDialog();
    vp.addDialog(dialog);
    dialog.dispose();

    assert.throws(function () { vp.loadPageView(new SmartJs.Ui.Image()); }, Error, "ERROR: invalid argument: pageView");
    var pv = new PocketCode.Ui.PlayerPageView();
    vp.loadPageView(pv);

    vp.dispose();
    assert.ok(vp._disposed, true, "disposed");

});
