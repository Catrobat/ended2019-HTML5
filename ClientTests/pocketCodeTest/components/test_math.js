/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/pocketCode/core.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/cast.js" />
'use strict';

QUnit.module("components/math.js");


QUnit.test("isEqual", function (assert) {

    var isEqual = PocketCode.Math.isEqual;

    //undefined and null
    assert.ok(isEqual(), "isEqual: undefined");
    assert.ok(isEqual(null), "isEqual: null");

    //string
    assert.ok(isEqual("", undefined), "isEqual: empty string / undefined");
    assert.notOk(isEqual("", NaN), "isEqual: empty string / NaN");
    assert.ok(isEqual("tRUe", "true"), "isEqual: string (converted)");
    assert.ok(isEqual("tra", "TrA"), "isEqual: string: case insensitive");
    assert.ok(isEqual("1.123", "0001.12300"), "isEqual: converted");    //changed after retested in scratch
    assert.ok(isEqual("tRUe", true), "isEqual: string");
    assert.ok(isEqual(1.123, "0001.12300"), "isEqual: string");
    assert.notOk(isEqual("tru", "true"), "!isEqual: string");

    //numbers
    assert.notOk(isEqual(1, undefined), "!isEqual: number / undefined");
    assert.notOk(isEqual(0, undefined), "!isEqual: zero / undefined");
    assert.ok(isEqual(NaN, "nAn"), "isEqual: NaN / string");
    assert.ok(isEqual("inFiniTY", Infinity), "isEqual: number Infinity / string");
    assert.ok(isEqual("-inFINITY", -Infinity), "isEqual: number -Infinity / string");
    assert.ok(isEqual(0, "faLSE"), "isEqual: boolean (string / number)");
    assert.ok(isEqual(1, "TRue"), "isEqual: boolean (string / number)");
    assert.notOk(isEqual(2, "TRue"), "!isEqual: (boolean string / number)");
    assert.ok(isEqual(0, false), "isEqual: number 0 / boolean");
    assert.ok(isEqual(1, true), "isEqual: number 1 / boolean");
    assert.notOk(isEqual(2, true), "!isEqual: number 2 / true");
    assert.notOk(isEqual(2, false), "!isEqual: number 2 / false");

    assert.ok(isEqual(2.13, "02.13"), "isEqual: number / string");
    assert.notOk(isEqual(2.13, "02.14"), "!isEqual: number / string");
    assert.notOk(isEqual(2., 3), "!isEqual: number / number");

    //bool
    assert.ok(isEqual("", false), "isEqual: boolean & empty string");
    assert.ok(isEqual("0", false), "isEqual: boolean & '0'");
    assert.ok(isEqual("tRUe", true), "isEqual: boolean true");
    assert.ok(isEqual("falSE", false), "isEqual: boolean false");
    assert.ok(isEqual(true, true), "isEqual: boolean");
    assert.ok(isEqual(false, false), "isEqual: boolean");
    assert.notOk(isEqual(false, undefined), "!isEqual: boolean");
    assert.notOk(isEqual(true, false), "!isEqual: boolean");
    assert.notOk(isEqual(true, 2), "!isEqual: boolean / number");
    assert.notOk(isEqual(true, "2"), "!isEqual: boolean / string as number");

    //vars & lists
    var uvs = new PocketCode.Model.UserVariableSimple(2, "s", "TrUE");
    assert.ok(isEqual(true, uvs), "isEqual: user variable / boolean");
    var uvl = new PocketCode.Model.UserVariableList(1, "l", [3, ".", 4, "2"]);
    assert.ok(isEqual(3.42, uvl), "isEqual: user variable list / number");

    uvl = new PocketCode.Model.UserVariableList(1, "l", [3, ".", 4, "2", 1, false, 34.2]);
    var uvl2 = new PocketCode.Model.UserVariableList(1, "l", [3, ".", 4, 2, "1", false, "0034.20"]);
    assert.notOk(isEqual(uvl, uvl2), "!isEqual: list / list: based on case insensitive strings");
    uvl2 = new PocketCode.Model.UserVariableList(1, "l", [3, ".", 4, 2, "1", false]);
    assert.notOk(isEqual(uvl, uvl2), "!isEqual: list / list: different length");

    var uvl2 = new PocketCode.Model.UserVariableList(1, "l", [3, ".", 4, 2, "1", false, "34.2"]);
    assert.ok(isEqual(uvl, uvl2), "isEqual: list / list: equal");

    uvl = new PocketCode.Model.UserVariableList(1, "l", [3, ".", 4, 2, "1", false, "34.2", "NAN", Infinity]);
    uvl2 = new PocketCode.Model.UserVariableList(1, "l", [3, ".", 4, 2, "1", false, "34.2", NaN, "Infinity"]);
    assert.ok(isEqual(uvl, uvl2), "isEqual: list / list: equal (using strings for defined constants)");

});


QUnit.test("Cast", function (assert) {

    var cast = PocketCode.Math.Cast;

    //toValue()
    var uvs = new PocketCode.Model.UserVariableSimple(2, "s", "TrUE");
    assert.equal("TrUE", cast.toValue(uvs), "to value returns original value without convertion: string");
    uvs = new PocketCode.Model.UserVariableSimple(2, "s", true);
    assert.equal(true, cast.toValue(uvs), "to value returns original value without convertion: boolean");

    var uvl = new PocketCode.Model.UserVariableList(1, "l", [3, ".", 4, "2"]);
    assert.equal("3.42", cast.toValue(uvl), "list value: single chars without whitespaces");
    uvl = new PocketCode.Model.UserVariableList(1, "l", [3, undefined, 4, "2"]);
    assert.equal("3  4 2", cast.toValue(uvl), "list value: single chars with whitespaces");
    uvl = new PocketCode.Model.UserVariableList(1, "l", [3, "as", 4, "2"]);
    assert.equal("3 as 4 2", cast.toValue(uvl), "list value: single chars with whitespaces");

    assert.equal(cast.toValue(undefined), undefined, "default: without variable value");

    //toBoolean()
    assert.equal(cast.toBoolean(false), false, "toBoolean: default: false");
    assert.equal(cast.toBoolean(undefined), false, "toBoolean: undefined");
    assert.equal(cast.toBoolean(NaN), false, "toBoolean: NaN");
    assert.equal(cast.toBoolean("Nan"), false, "toBoolean: NaN string");
    assert.equal(cast.toBoolean("falSe"), false, "toBoolean: false string");
    assert.equal(cast.toBoolean(""), false, "toBoolean: empty string");
    assert.equal(cast.toBoolean(0), false, "toBoolean: number 0");
    assert.equal(cast.toBoolean("0"), false, "toBoolean: string '0'");

    uvl = new PocketCode.Model.UserVariableList(1, "T", ["F", "a", "l", "S", "E"]);
    assert.equal(cast.toBoolean(uvl), false, "toBoolean: list");

    assert.equal(cast.toBoolean(true), true, "toBoolean: default: true");
    assert.equal(cast.toBoolean("tRuE"), true, "toBoolean: string");
    assert.equal(cast.toBoolean(Infinity), true, "toBoolean: Infinity");
    assert.equal(cast.toBoolean(-Infinity), true, "toBoolean: -Infinity");
    assert.equal(cast.toBoolean(1), true, "toBoolean: number (1)");
    assert.equal(cast.toBoolean(2), true, "toBoolean: number (any)");

    uvl = new PocketCode.Model.UserVariableList(1, "T", ["T", "r ", "U", "E"]);
    assert.equal(cast.toBoolean(uvl), true, "toBoolean: list (any string but empty or 'false')");

    //toNumber()
    assert.equal(cast.toNumber(true), 1, "toNumber: boolean true");
    assert.equal(cast.toNumber(false), 0, "toNumber: boolean false");
    assert.equal(cast.toNumber(NaN), 0, "toNumber: NaN -> 0");
    assert.equal(cast.toNumber(null), 0, "toNumber: null -> 0");
    assert.equal(cast.toNumber(undefined), 0, "toNumber: undefined -> 0");
    assert.equal(cast.toNumber("a"), 0, "toNumber: string -> 0");
    assert.equal(cast.toNumber("00.30"), 0.3, "toNumber: parsable string -> number");
    assert.equal(cast.toNumber("inFINIty"), Infinity, "toNumber: string 'Infinity' -> number");
    assert.equal(cast.toNumber("-iNfINIty"), -Infinity, "toNumber: string '-Infinity' -> number");
    assert.equal(cast.toNumber(1.234), 1.234, "toNumber: number -> number");

    //toString()
    assert.equal(cast.toString(null), "", "toString: null");
    assert.equal(cast.toString(NaN), "NaN", "toString: NaN");
    assert.equal(cast.toString(undefined), "", "toString: undefined");
    assert.equal(cast.toString("string"), "string", "toString: string");
    assert.equal(cast.toString(1.23), "1.23", "toString: number");
    assert.equal(cast.toString(true), "true", "toString: true");
    assert.equal(cast.toString(false), "false", "toString: false");

    //toI18nString()
    assert.equal(cast.toI18nString(null), "", "toString: null");
    assert.equal(cast.toI18nString(undefined), "", "toString: undefined");
    assert.equal(cast.toI18nString(1.23), "1.23", "toString: number");
    //^^ we cannot check on detailed i18n values or browser settings here

    //toTypedValue()
    assert.deepEqual(cast.toTypedValue(null), undefined, "to typed: null");
    assert.deepEqual(cast.toTypedValue(undefined), undefined, "to typed: undefined");
    assert.deepEqual(cast.toTypedValue(NaN), NaN, "to typed: NaN");
    assert.deepEqual(cast.toTypedValue("naN"), NaN, "string: to typed: NaN");
    assert.deepEqual(cast.toTypedValue(1.32), 1.32, "to typed: float");
    assert.deepEqual(cast.toTypedValue(-13.4), -13.4, "to typed: negative float");
    assert.deepEqual(cast.toTypedValue(2), 2, "to typed: int");
    assert.deepEqual(cast.toTypedValue(-4), -4, "to typed: negative int");
    assert.deepEqual(cast.toTypedValue("string"), "string", "to typed: string");
    assert.deepEqual(cast.toTypedValue("1.23"), 1.23, "to typed: float as string");
    assert.deepEqual(cast.toTypedValue("-0003.14000"), -3.14, "to typed: negative float as string");
    assert.deepEqual(cast.toTypedValue("23"), 23, "to typed: int as string");
    assert.deepEqual(cast.toTypedValue("-98"), -98, "to typed: negative int as string");
    assert.deepEqual(cast.toTypedValue("inFinitY"), Infinity, "string: to typed: Infinity");
    assert.deepEqual(cast.toTypedValue(1.7976931348623157E+10308), Infinity, "to typed: Infinity");
    assert.deepEqual(cast.toTypedValue("-inFiNity"), -Infinity, "string: to typed: -Infinity");
    assert.deepEqual(cast.toTypedValue(-1.7976931348623157E+10308), -Infinity, "to typed: -Infinity");
    assert.deepEqual(cast.toTypedValue(true), true, "to typed: boolean: true");
    assert.deepEqual(cast.toTypedValue(false), false, "to typed: boolean: false");
    assert.deepEqual(cast.toTypedValue("tRUe"), true, "to typed: boolean string: true");
    assert.deepEqual(cast.toTypedValue("faLsE"), false, "to typed: boolean string: false");

    var a, b;
    assert.ok(isNaN(cast.toTypedValue(a * b)), "to typed: NaN");
    assert.equal(cast.toNumber(a) + cast.toNumber(b), 0, "NaN values are casted in operations but stored as NaN in variable");
    var uv2 = new PocketCode.Model.UserVariableSimple(1, "name", "0056");
    assert.deepEqual(cast.toTypedValue(uv2), 56, "to typed: another variable");

    var uvl = new PocketCode.Model.UserVariableList(1, "name", ["T", "r", "U", "e"]);
    assert.deepEqual(cast.toTypedValue(uvl), true, "to typed: user list");

});
