/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/settingsProvider.js" />
'use strict';

QUnit.module("components/settingsProvider.js");


QUnit.test("SettingsProvider", function (assert) {

    var adapter = PocketCode.SettingsProvider;  //static
    adapter.clear();    //clear cookie before running the tests

    assert.ok(adapter.onChange instanceof SmartJs.Event.Event, "event check");
    assert.equal(adapter.supported, true, "getter: supported");

    assert.throws(function () { adapter.getValue(1); }, Error, "ERROR: invalid key on getValue");
    assert.equal(adapter.getValue("key"), undefined, "key not found: undefined");

    var handlerCalled = 0,
        handlerEventArgs = undefined,
        handler = function (e) {
            handlerCalled++;
            handlerEventArgs = e;
        };
    adapter.onChange.addEventListener(new SmartJs.Event.EventListener(handler, this));

    //set/get
    adapter.setValue("keyNumber", 12);
    assert.equal(handlerCalled, 1, "handler called on set value");
    assert.equal(handlerEventArgs.key, "keyNumber", "handler event args: key");
    assert.equal(handlerEventArgs.oldValue, undefined, "handler event args: oldValue");
    assert.equal(handlerEventArgs.newValue, 12, "handler event args: newValue");
    assert.equal(adapter.getValue("keyNumber"), 12, "setValue/getValue: type number");

    adapter.setValue("keyString", "string");
    assert.equal(handlerCalled, 2, "handler called on set value");
    assert.equal(handlerEventArgs.newValue, "string", "handler event args: newValue (string)");
    assert.equal(adapter.getValue("keyString"), "string", "setValue/getValue: type string");

    adapter.setValue("keyBoolean", true);
    assert.equal(handlerCalled, 3, "handler called on set value");
    assert.equal(handlerEventArgs.newValue, true, "handler event args: newValue (boolean)");
    assert.equal(adapter.getValue("keyBoolean"), true, "setValue/getValue: type boolean");

    adapter.setValue("keyObject", { number: 12, string: "string", object: { nested: false } });
    assert.equal(handlerCalled, 4, "handler called on set value");
    assert.deepEqual(handlerEventArgs.newValue, { number: 12, string: "string", object: { nested: false } }, "handler event args: newValue (object)");
    assert.deepEqual(adapter.getValue("keyObject"), { number: 12, string: "string", object: { nested: false } }, "setValue/getValue: type object");

    //change
    adapter.setValue("keyObject", false);
    assert.equal(handlerCalled, 5, "handler called on set value");
    assert.deepEqual(handlerEventArgs.oldValue, { number: 12, string: "string", object: { nested: false } }, "handler event args: oldValue (change)");
    assert.equal(handlerEventArgs.newValue, false, "handler event args: oldValue (change)");
    assert.equal(adapter.getValue("keyObject"), false, "setValue/getValue: change");

    //delete
    handlerCalled = 0;
    adapter.deleteKey("key");
    assert.equal(handlerCalled, 1, "onChange handler called on delete");

    adapter.clear();
    assert.equal(handlerCalled, 5, "onChange handler called on clear");
});
