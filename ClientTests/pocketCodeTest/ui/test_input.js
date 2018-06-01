/// <reference path="../../qunit/qunit-2.4.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
"use strict";

QUnit.module("ui/input.js");


QUnit.test("I18nCheckbox", function (assert) {

    //var done = assert.async;

    var dom = document.getElementById("qunit-fixture");
    var container = new SmartJs.Ui.ContainerControl({ style: { minHeight: "500px", minWidth: "500px" } });
    dom.appendChild(container._dom);

    var ctrl = new PocketCode.Ui.I18nCheckbox("i18nKey");

    assert.ok(ctrl instanceof PocketCode.Ui.I18nCheckbox && ctrl instanceof SmartJs.Ui.Control, "instance check + inheritance");
    assert.ok(ctrl.objClassName === "I18nCheckbox", "objClassName check");

    assert.equal(ctrl.value, undefined, "value getter (uninitialized)");
    ctrl = new PocketCode.Ui.I18nCheckbox("i18nKey", "value1");

    assert.equal(ctrl.value, "value1", "value getter (initialized)");
    ctrl.value = "value2";
    assert.equal(ctrl.value, "value2", "value getter/setter");

    assert.equal(ctrl.checked, false, "checked (uninitialized)");
    ctrl.checked = true;
    assert.equal(ctrl.checked, true, "checked getter/setter");
    assert.throws(function () { ctrl.checked = "x"; }, Error, "ERROR: checked setter");

    container.appendChild(ctrl);
    //events
    assert.ok(ctrl.onCheckedChange instanceof SmartJs.Event.Event, "event accessor");

    var checkedChangeCount = 0;
    var checkChangeEventArgs;
    var rg_checkedChange = function (e) {
        checkedChangeCount++;
        checkChangeEventArgs = e;
    };
    ctrl.onCheckedChange.addEventListener(new SmartJs.Event.EventListener(rg_checkedChange));
    ctrl.checked = true;
    assert.equal(checkedChangeCount, 0, "onCheckedChange event not triggered: no change");
    ctrl.checked = false;
    assert.equal(checkedChangeCount, 1, "onCheckedChange event triggered");
    assert.equal(checkChangeEventArgs.checked, false, "onCheckedChange event args");

    //simulate click
    ctrl._dom.children[0].click();
    assert.ok(ctrl.checked, "checked using click");
    assert.equal(checkedChangeCount, 2, "onCheckedChange event triggered: using onChange");
    assert.equal(checkChangeEventArgs.checked, true, "onCheckedChange event args: using onChange");

    ctrl._dom.children[0].click();
    assert.notOk(ctrl.checked, "unchecked using click");
    assert.equal(checkedChangeCount, 3, "onCheckedChange event triggered: using onChange (uncheck)");
    assert.equal(checkChangeEventArgs.checked, false, "onCheckedChange event args: using onChange (uncheck)");

    ctrl.dispose();
    assert.ok(ctrl._disposed, "disposed");
    assert.equal(container._childs.length, 0, "removed from parent during dispose");

});

QUnit.test("RadioGroup", function (assert) {

    //var dom = document.getElementById("qunit-fixture");
    //var container = new SmartJs.Ui.ContainerControl({ style: { minHeight: "500px", minWidth: "500px" } });
    //dom.appendChild(container._dom);

    var ctrl = new PocketCode.Ui.RadioGroup();
    assert.ok(ctrl instanceof PocketCode.Ui.RadioGroup, "instance check");

    assert.notEqual(ctrl.id, undefined, "id getter");

    var rd1 = new PocketCode.Ui.Radio("key1");
    //container.appendChild(rd1);
    assert.deepEqual(ctrl.radios, [], "radios accessor");

    ctrl.add(rd1);
    assert.equal(ctrl.radios.length, 1, "add single item");
    assert.equal(ctrl.radios[0], rd1, "radios getter");
    var rd2 = new PocketCode.Ui.Radio("key2");
    //container.appendChild(rd2);

    assert.ok(ctrl.onCheckedChange instanceof SmartJs.Event.Event, "event accessor");

    assert.throws(function () { ctrl.add("x"); }, Error, "ERROR: invalid argument: add, simple");
    assert.throws(function () { ctrl.add([rd1, "x"]); }, Error, "ERROR: invalid argument: add, list");
    assert.equal(ctrl.radios.length, 1, "first item added");
    var list = [];
    list.push(rd1);
    list.push(rd2);
    ctrl.add(list);
    assert.equal(ctrl.radios.length, 2, "add list: ignore duplicates");

    //add handler
    var checkedChangeCount = 0;
    var checkChangeEventArgs;
    var rg_checkedChange = function (e) {
        checkedChangeCount++;
        checkChangeEventArgs = e;
    };
    ctrl.onCheckedChange.addEventListener(new SmartJs.Event.EventListener(rg_checkedChange));

    //checked
    assert.equal(ctrl.checked, undefined, "checked initial");
    assert.throws(function () { ctrl.checked = "x"; }, Error, "ERROR: invalid argument: checked");

    rd2.checked = true;
    assert.equal(ctrl.checked, rd2, "checked getter");
    assert.equal(checkedChangeCount, 1, "onCheckedChange event triggered");
    assert.equal(checkChangeEventArgs.radio, rd2, "onCheckedChange event args");

    assert.throws(function () { ctrl.checked = "rd1"; }, Error, "ERROR: invalid argument: set checked");
    ctrl.checked = rd1;
    assert.equal(ctrl.checked, rd1, "checked getter/setter");
    assert.ok(rd1.checked, "radio checked");
    assert.equal(checkedChangeCount, 2, "onCheckedChange event triggered");
    assert.equal(checkChangeEventArgs.radio, rd1, "onCheckedChange event args");
    ctrl.checked = rd1;
    assert.ok(rd1.checked, "radio checked: assign existing");
    assert.equal(checkedChangeCount, 2, "onCheckedChange event not triggered");

    //remove
    checkedChangeCount = 0;
    assert.throws(function () { ctrl.remove("invalid"); }, Error, "ERROR: invalid argument: remove");
    ctrl.remove(rd2);
    assert.equal(rd2._group, undefined, "set radio group property to undefined");
    assert.ok(ctrl.radios.length === 1 && ctrl.radios[0] === rd1, "removed from radios list");
    assert.equal(checkedChangeCount, 0, "no event on remove of unchecked radio");

    ctrl.remove(rd1);
    assert.equal(ctrl.radios.length, 0, "removed from radios list");
    assert.equal(checkedChangeCount, 1, "event dispatched on remove of unchecked radio");
    assert.equal(ctrl.checked, undefined, "no item checked");

    var rd3 = new PocketCode.Ui.Radio("key3");
    //container.appendChild(rd3);

    rd1.checked = true;
    rd2.checked = true;
    rd3.checked = true;

    checkedChangeCount = 0;
    ctrl.add([rd1, rd3, rd2]);
    assert.equal(ctrl.radios.length, 3, "all 3 added");
    assert.equal(checkedChangeCount, 3, "3 change events triggert: all checked");
    assert.equal(ctrl.checked, rd2, "last checked insert = checked element");

    checkedChangeCount = 0;
    ctrl.remove([rd1, rd3, rd2]);
    assert.equal(checkedChangeCount, 1, "change event triggert: checked element removed");
    assert.equal(ctrl.checked, undefined, "checked element removed");

    ctrl.dispose();
    assert.ok(ctrl._disposed, "disposed");
    assert.notOk(rd1._disposed, "dispose does not dispose radios");

});

QUnit.test("Radio", function (assert) {

    var dom = document.getElementById("qunit-fixture");
    var container = new SmartJs.Ui.ContainerControl({ style: { minHeight: "500px", minWidth: "500px" } });
    dom.appendChild(container._dom);

    var ctrl = new PocketCode.Ui.Radio("i18nKey");
    container.appendChild(ctrl);

    assert.ok(ctrl instanceof PocketCode.Ui.Radio && ctrl instanceof PocketCode.Ui.I18nCheckbox, "instance check + inheritance");
    assert.ok(ctrl.objClassName === "Radio", "objClassName check");

    assert.ok(ctrl.onCheckedChange instanceof SmartJs.Event.Event, "event accessor");

    //simulate click
    ctrl._dom.children[0].click();
    assert.ok(ctrl.checked, "checked using click");

    //group
    assert.throws(function () { ctrl.group = "x"; }, Error, "ERROR: invalid argument: group");
    var group1 = new PocketCode.Ui.RadioGroup();
    var group2 = new PocketCode.Ui.RadioGroup();
    ctrl.group = group1;
    assert.equal(group1.radios.length, 1, "added to group");
    ctrl.group = group1;
    assert.equal(group1.radios.length, 1, "not addded twice");
    ctrl.group = group2;
    assert.equal(group1.radios.length, 0, "remove from group when assigned to new group");
    assert.equal(group2.radios.length, 1, "added to new group");

    ctrl.group = undefined;
    assert.equal(group2.radios.length, 0, "removed from group");

    ctrl.dispose();
    assert.ok(ctrl._disposed, "disposed");
    assert.equal(container._childs.length, 0, "removed from parent during dispose");

});

QUnit.test("I18nRadio", function (assert) {

    var dom = document.getElementById("qunit-fixture");
    var container = new SmartJs.Ui.ContainerControl({ style: { minHeight: "500px", minWidth: "500px" } });
    dom.appendChild(container._dom);

    var ctrl = new PocketCode.Ui.I18nRadio("i18nKey");
    container.appendChild(ctrl);

    assert.ok(ctrl instanceof PocketCode.Ui.I18nRadio && ctrl instanceof PocketCode.Ui.Radio, "instance check + inheritance");
    assert.ok(ctrl.objClassName === "I18nRadio", "objClassName check");

});

QUnit.test("Slider", function (assert) {

    var dom = document.getElementById("qunit-fixture");
    var slider = new PocketCode.Ui.Slider();

    //instance, objClass name and Class name check
    assert.ok(slider instanceof PocketCode.Ui.Slider && slider instanceof SmartJs.Ui.Control, "instance check");
    assert.ok(slider.objClassName === "Slider", "ObjClassName check");
    assert.ok(slider.className === "pc-slider", "css className check");

    //event check
    assert.ok(slider.onChange instanceof SmartJs.Event.Event, "event accessor");

    assert.equal(slider.minValue, 0, "cntr default: min value");
    assert.equal(slider.maxValue, 100, "cntr default: max value");
    assert.equal(slider.value, 0, "cntr default: value");

    //out of range checks
    slider.value = 200;
    assert.equal(slider.value, 100, "value setter: including max value");
    slider.value = -200;
    assert.equal(slider.value, 0, "value setter: including min value");

    slider.minValue = 10;
    assert.equal(slider.value, 10, "min value setter: value changed to min");

    slider.value = 90;
    slider.maxValue = 80;
    assert.equal(slider.value, 80, "max value setter: value changed to max");

    assert.throws(function () { slider.maxValue = 9; }, Error, "ERROR: maxValue < minValue");

    //slider using property object
    slider = new PocketCode.Ui.Slider({ minValue: 1, maxValue: 99, value: 50, valueDigits: 2, minLabel: "1", maxLabel: "100" });
    dom.appendChild(slider._dom);

    //min, max Value, starting Value and orientation getter/setter check
    assert.equal(slider.minValue, 1, "cntr merge: min value");
    assert.equal(slider.maxValue, 99, "cntr merge: max value");
    assert.equal(slider.value, 50, "cntr merge: value");
    assert.equal(slider.valueDigits, 2, "cntr merge: valueDigits");
    assert.equal(slider.minLabel, "1", "cntr merge: minLabel");
    assert.equal(slider.maxLabel, "100", "cntr merge: maxLabel");

    assert.throws(function () { slider.minValue = "a"; }, Error, "ERROR: min value validation");
    slider.minValue = 0;
    assert.equal(slider.minValue, 0, "min value getter/setter");

    assert.throws(function () { slider.maxValue = "0"; }, Error, "ERROR: max value validation");
    slider.maxValue = 90;
    assert.equal(slider.maxValue, 90, "max value getter/setter");

    assert.throws(function () { slider.value = {}; }, Error, "ERROR: value validation");
    slider.value = 45;
    assert.equal(slider.value, 45, "value getter/setter");

    assert.throws(function () { slider.valueDigits = []; }, Error, "ERROR: valueDigits validation");
    slider.valueDigits = 3;
    assert.equal(slider.valueDigits, 3, "valueDigits getter/setter");

    slider.minLabel = "10";
    assert.equal(slider.minLabel, "10", "minLabel getter/setter");
    slider.maxLabel = "90";
    assert.equal(slider.maxLabel, "90", "maxLabel getter/setter");


    var changeCount = 0;
    var onChangeHandler = function (e) {
        assert.equal(e.value, 32, "event argument check");
        changeCount++;
    };
    slider.onChange.addEventListener(new SmartJs.Event.EventListener(onChangeHandler, this));
    slider.value = 32;
    assert.equal(changeCount, 1, "event only dispatched once");

    //dispose check
    slider.dispose();
    assert.ok(slider._disposed, "slider disposed");

});