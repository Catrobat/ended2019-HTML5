/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/pocketCode/core.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/cast.js" />
'use strict';

QUnit.module("components/math.js");


QUnit.test("isEqual", function (assert) {

    //var cast = PocketCode.Math.Cast;

    assert.ok(false, "TODO: some discussion needed here");
    //PC "a" OR "b" => TRUE
    //   "a" AND "" => TRUE (at least "" = empty string should validate to =false)
});


QUnit.test("Cast", function (assert) {

    var cast = PocketCode.Math.Cast;

    assert.ok(false, "TODO: some discussion needed here");
    //PC "a" OR "b" => TRUE
    //   "a" AND "" => TRUE (at least "" = empty string should validate to =false)


    //typed values
    //assert.deepEqual(cast.toTypedValue(null), undefined, "to typed: null");
    //assert.deepEqual(cast.toTypedValue(undefined), undefined, "to typed: undefined");
    //assert.deepEqual(cast.toTypedValue(1.32), 1.32, "to typed: float");
    //assert.deepEqual(cast.toTypedValue(-13.4), -13.4, "to typed: negative float");
    //assert.deepEqual(cast.toTypedValue(2), 2, "to typed: int");
    //assert.deepEqual(cast.toTypedValue(-4), -4, "to typed: negative int");
    //assert.deepEqual(cast.toTypedValue("string"), "string", "to typed: string");
    //assert.deepEqual(cast.toTypedValue("1.23"), 1.23, "to typed: float as string");
    //assert.deepEqual(cast.toTypedValue("-3.14"), -3.14, "to typed: negative float as string");
    //assert.deepEqual(cast.toTypedValue("23"), 23, "to typed: int as string");
    //assert.deepEqual(cast.toTypedValue("-98"), -98, "to typed: negative int as string");
    //assert.deepEqual(cast.toTypedValue(1.7976931348623157E+10308), Infinity, "to typed: Infinity");
    //assert.deepEqual(cast.toTypedValue(-1.7976931348623157E+10308), -Infinity, "to typed: -Infinity");
    //assert.deepEqual(cast.toTypedValue(true), true, "to typed: boolean: true");
    //assert.deepEqual(cast.toTypedValue(false), false, "to typed: boolean: false");
    //assert.deepEqual(cast.toTypedValue("true"), "true", "to typed: boolean string: true");
    //assert.deepEqual(cast.toTypedValue("false"), "false", "to typed: boolean string: false");

    //var a, b;
    //assert.ok(isNaN(cast.toTypedValue(a * b)), "to typed: NaN");
    //assert.equal(cast.toNumber(a) + cast.toNumber(b), 0, "NaN values are casted in operations but stored as NaN in variable");
    //var uv2 = new PocketCode.Model.UserVariableSimple(1, "name", "56");
    //assert.deepEqual(cast.toTypedValue(uv2), 56, "to typed: another variable");

});
