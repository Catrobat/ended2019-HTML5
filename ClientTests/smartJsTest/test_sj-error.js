/// <reference path="../../client/smartJs/sj.js" />
/// <reference path="../../client/smartJs/sj-error.js" />
/// <reference path="../qunit/qunit-1.16.0.js" />
'use strict';

QUnit.module("sj-error.js");

QUnit.test("SmartJs.Error.Exception", function (assert) {

    try {
        throw new SmartJs.Error.Exception("test");
    }
    catch (e) {
        assert.ok(e instanceof SmartJs.Error.Exception && e instanceof Error, "instance test including inheritance");
        assert.equal(e.message, "test", "simple constructor test");
    }

    try {
        throw new SmartJs.Error.Exception({ message: "23", a: 23 });
    }
    catch (e) {
        assert.equal(e.message, "23", "object constructor test");
        assert.equal(e.a, 23, "object constructor test (multiple argument properties including default message property)");
    }

    assert.throws(function () { new SmartJs.Error.Exception(1); }, Error, "ERROR: invalid argument");

});


QUnit.test("SmartJs.Error.NotImplementedException", function (assert) {

    try {
        throw new SmartJs.Error.NotImplementedException();
    }
    catch (e) {
        assert.ok(e instanceof SmartJs.Error.NotImplementedException && e instanceof SmartJs.Error.Exception && e instanceof Error, "instance test including inheritance");
        assert.equal(e.message, "Not implemented", "simple constructor test");
    }

});


QUnit.test("SmartJs.Error.InvalidArgumentException", function (assert) {

    try {
        throw new SmartJs.Error.InvalidArgumentException("x", "y");
    }
    catch (e) {
        assert.ok(e instanceof SmartJs.Error.InvalidArgumentException && e instanceof SmartJs.Error.Exception && e instanceof Error, "instance test including inheritance");
        assert.equal(e.argument, "x", "constructor test");
        assert.equal(e.expected, "y", "constructor test (param 2)");
    }
    try {
        throw new SmartJs.Error.InvalidArgumentException(12, 23);
    }
    catch (e) {
        assert.equal(e.argument, "12", "constructor test");
        assert.equal(e.expected, "23", "constructor test (param 2)");
    }

});

