/// <reference path="../../../../Client/pocketCode/scripts/ui/input.js" />
'use strict';

window.onload = function () {

    var settingsContainer = document.getElementById('settingsContainer');
    var outputContainer = document.getElementById('outputContainer');
    var layoutContainer = document.getElementById('layoutContainer');


    var rg = new PocketCode.Ui.RadioGroup();
    var ctrl1 = new PocketCode.Ui.Radio('key1', 'val1');
    var ctrl2 = new PocketCode.Ui.Radio('key2', 'val2');
    var ctrl3 = new PocketCode.Ui.I18nRadio('key3', 'val3');

    rg.add(ctrl1);
    var arr = [];
    arr.push(ctrl2);
    arr.push(ctrl3);
    rg.add(arr);

    layoutContainer.appendChild(ctrl1._dom);
    layoutContainer.appendChild(ctrl2._dom);
    layoutContainer.appendChild(ctrl3._dom);

    //rg.remove(ctrl1);
    var rg2 = new PocketCode.Ui.RadioGroup();
    rg2.add(ctrl1);
    rg.add(ctrl1);

    var cb1 = new PocketCode.Ui.I18nCheckbox('cb1', 1);
    var cb2 = new PocketCode.Ui.I18nCheckbox('cb2', 2);
    var cb3 = new PocketCode.Ui.I18nCheckbox('cb3', 3);

    layoutContainer.appendChild(cb1._dom);
    layoutContainer.appendChild(cb2._dom);
    layoutContainer.appendChild(cb3._dom);

    //events
    var rg_checkedChange = function (e) {
        outputContainer.innerHTML += '<br />radioGroup: groupId=' + e.groupId + ', id=' + e.radio.id + ', value=' + e.value;
    };
    rg.onCheckedChange.addEventListener(new SmartJs.Event.EventListener(rg_checkedChange));

    var radio_checkedChange = function (e) {
        outputContainer.innerHTML += '<br />radio: id=' + e.target.id + ', value=' + e.value + ', checked=' + e.checked;
    };
    ctrl1.onCheckedChange.addEventListener(new SmartJs.Event.EventListener(radio_checkedChange));
    ctrl2.onCheckedChange.addEventListener(new SmartJs.Event.EventListener(radio_checkedChange));
    ctrl3.onCheckedChange.addEventListener(new SmartJs.Event.EventListener(radio_checkedChange));

    var checkbox_checkedChange = function (e) {
        outputContainer.innerHTML += '<br />checkbox: id=' + e.target.id + ', value=' + e.value + ', checked=' + e.checked;
    };
    cb1.onCheckedChange.addEventListener(new SmartJs.Event.EventListener(checkbox_checkedChange));
    cb2.onCheckedChange.addEventListener(new SmartJs.Event.EventListener(checkbox_checkedChange));
    cb3.onCheckedChange.addEventListener(new SmartJs.Event.EventListener(checkbox_checkedChange));

};