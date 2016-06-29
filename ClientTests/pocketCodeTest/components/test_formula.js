/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/gameEngine.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/sprite.js" />
/// <reference path="../../../Client/pocketCode/scripts/components/formula.js" />

/// <reference path="../_resources/testDataFormula.js" />
'use strict';

QUnit.module("components/formula.js");


QUnit.test("Formula", function (assert) {

    var soundManager = new PocketCode.SoundManager([]);
    var device = new PocketCode.Device(soundManager);

    var json = JSON.parse('{"type":"NUMBER","value":"500","right":null,"left":null}');
    var json2 = JSON.parse('{"type":"NUMBER","value":"20","right":null,"left":null}');
    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program, { id: "spriteId", name: "spriteName" });

    assert.throws(function () { var f = new PocketCode.Formula(undefined, sprite, json); }, Error, "");
    var f = new PocketCode.Formula(device, sprite, json);

    assert.ok(f instanceof PocketCode.Formula, "instance check");
    assert.ok(typeof f.calculate === "function", "calculate created during ctr");
    assert.equal(f.calculate(), 500, "json parsed to method calculate");

    assert.equal(json, f.json, "json getter");
    var uiString = f.toString();
    assert.ok(typeof uiString === "string", "uiString getter");
    //try {
    //    f.uiString = "asd";
    //}
    //catch (e) { }
    //assert.equal(f.toString(), uiString, "uiString setter");


    f.json = json2;

    assert.equal(json2, f.json, "json setter");
    assert.equal(f.calculate(), 20, "json setter: calculate update");

    //internal methods: it's easier to check these methods directly (in this case)
    //round makes sure we are correct + - 1/1000 
    var result = Math.round(f._degree2radian(90.0 / Math.PI) * 1000) / 1000;
    assert.equal(result, 0.5, "helper: degree2radian");

    var result = Math.round(f._radian2degree(Math.PI / 90.0) * 1000) / 1000;
    assert.equal(result, 2.0, "helper: radian2degree");

    var result = Math.round(f._log10(10000000) * 1000) / 1000;
    assert.equal(result, 7.0, "helper: log10");
    /*
        json = JSON.parse('{"type":"NUMBER","value":"500","right":{"type":"NUMBER","value":"500","right":null,"left":null},"left":null}');
        assert.throws(function () { var f = new PocketCode.Formula(undefined, undefined, json); }, Error, "ERROR: formula parsing error detection");
    */
    assert.throws(function () { f.json = JSON.parse('{"type":"NUMBER","value":"X","right":null,"left":null}'); }, Error, "setter validation check");

    //dispose
    f.dispose();
    assert.equal(f._disposed, true, "disposed");

    //isStatic = false
    json = NXT_4;
    f = new PocketCode.Formula(device, sprite, json);
    assert.equal(f.calculate(), 0, "recreated after dispose using a non static function");

});


QUnit.test("Formula: string encoding", function (assert) {
    //using: _resources/testDataFormula.js
    var soundManager = new PocketCode.SoundManager([]);
    var device = new PocketCode.Device(soundManager);

    var program = new PocketCode.GameEngine();
    var sprite = new PocketCode.Model.Sprite(program, { id: "spriteId", name: "spriteName" });

    var f = new PocketCode.Formula(device, sprite, encoding1);
    assert.equal(f.calculate(), "Los seres vivos son los que tienen vida, esto quiere decir, que son toda la variedad de seres que habitan nuestro planeta, desde los más pequeños hasta los más grandes, todas las plantas, animales e incluso nosotros los seres humanos. \nPodemos reconocer a los seres vivos porque tienen en común el ciclo de vida, los cambios que sufren a lo largo de su vida y cómo se van transformando. \nPara conocer mejor las fases que compone el ciclo de vida pulsa “Comenzar”.", "encoding1 output");

    f = new PocketCode.Formula(device, sprite, encoding2);
    assert.equal(f.calculate(), "Nacen. Todos los seres vivos proceden de otros seres vivos.", "encoding2 output");

    f = new PocketCode.Formula(device, sprite, encoding3);
    assert.equal(f.calculate(), "Se alimentan. Todos los seres vivos necesitan tomar alimentos para crecer y desarrollarse, aunque cada uno tome un tipo de alimento diferente.", "encoding3 output");

    f = new PocketCode.Formula(device, sprite, encoding4);
    assert.equal(f.calculate(), "Crecen. Los seres vivos aumentan de tamaño a lo largo de su vida y a veces, cambian de aspecto.", "encoding4 output");

    f = new PocketCode.Formula(device, sprite, encoding5);
    assert.equal(f.calculate(), "Se relacionan. Los seres vivos son capaces de captar lo que ocurre a su alrededor y reaccionar como corresponda.", "encoding5 output");

    f = new PocketCode.Formula(device, sprite, encoding6);
    assert.equal(f.calculate(), "Se reproducen. Los seres vivos pueden producir otros seres vivos parecidos a ellos.", "encoding6 output");

    f = new PocketCode.Formula(device, sprite, encoding7);
    assert.equal(f.calculate(), "Envejecen y mueren. Todos los seres vivos dejan de funcionar en algún momento y dejan, por tanto, de estar vivos.", "encoding7 output");

});

