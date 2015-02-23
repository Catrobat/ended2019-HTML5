/// <reference path="../../qunit/qunit-1.16.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/parser.js" />
'use strict';

QUnit.module("parser.js");


QUnit.test("FormulaParser", function (assert) {

    var p = PocketCode.FormulaParser;   //this is not a constructor but a singleton
    assert.ok(true, "TODO:");

});

QUnit.test("BrickFactory", function (assert) {

    var bf = new PocketCode.BrickFactory("device", "program", "brodcastMgr", 123);
    assert.ok(true, "TODO:");

});

QUnit.test("ProgramParser", function (assert) {

    var p = new PocketCode.ProgramParser();
    assert.ok(true, "TODO:");

});


