/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/proxy.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/loggingProvider.js" />
'use strict';

QUnit.module("components/loggingProvider.js");


QUnit.test("LoggingProvider", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();

    assert.throws(function () { var c = new PocketCode.LoggingProvider(); }, Error, "ERROR: static, no class definition/constructor");
    assert.throws(function () { PocketCode.LoggingProvider instanceof PocketCode.LoggingProvider }, Error, "ERROR: static class: no instanceof allowed");

    var lp = new PocketCode._LoggingProvider(); //recreate the static class to avoid side effects in test framework

    //init
    assert.ok(lp.onLogMessageSent instanceof SmartJs.Event.Event, "event getter and type");
    lp._disabled = false;    //make sure disabled is set to false for tests
    assert.equal(lp.disabled, false, "disabled getter");
    lp.disabled = true;
    assert.equal(lp.disabled, true, "disabled setter");
    assert.throws(function () { lp.disabled = "true"; }, Error, "ERROR: invalid disabled setter");

    lp.sendMessage();    //no error because disabled
    lp.disabled = false;

    //lp.sendMessage();   //without handler

    var sentHandler = function (e) {
        assert.ok(e.success, "event argument check");
        assert.equal(lp._type, "TYPE", "type stored correctly");
        assert.equal(lp._projectId, 12345, "projectId stored correctly");
        assert.equal(lp._message, "error: errorMessage, \n", "message parsed correctly: object");

        lp.onLogMessageSent.removeEventListener(new SmartJs.Event.EventListener(sentHandler, this));
        done1();
        Test2();
    };
    lp.onLogMessageSent.addEventListener(new SmartJs.Event.EventListener(sentHandler, this));
    lp.sendMessage({ error: "errorMessage", }, 12345, "TYPE");

    function Test2() {
        var sentHandler = function (e) {
            assert.equal(lp._message, "string as message \n", "message parsed correctly: string");

            lp.onLogMessageSent.removeEventListener(new SmartJs.Event.EventListener(sentHandler, this));
            done2();
        };
        lp.onLogMessageSent.addEventListener(new SmartJs.Event.EventListener(sentHandler, this));
        lp.sendMessage("string as message");
    }

});
