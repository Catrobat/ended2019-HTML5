'use strict';

window.onload = function () {

    var settingsContainer = document.getElementById('settingsContainer');
    var outputContainer = document.getElementById('outputContainer');
    var layoutContainer = document.getElementById('layoutContainer');

    var tbButton1 = new PocketCode.Ui.Button('cancel');
    var tbButton2 = new PocketCode.Ui.Button('ok');
    var tbButton3 = new PocketCode.Ui.Button('not supported');

    var control = new PocketCode.Ui.Dialog();
    window.onresize = function (e) {
        control._onResize.dispatchEvent();
    };
    control._onResize.dispatchEvent();  //once at the beginning

    layoutContainer.appendChild(control._dom);

    control.caption = 'some text (header)';
    outputContainer.innerHTML += '<br />added caption: ' + control.caption;

    control.type = PocketCode.Ui.DialogType.WARNING;
    outputContainer.innerHTML += '<br />changed type to: ' + control.type;

    control.type = PocketCode.Ui.DialogType.ERROR;
    outputContainer.innerHTML += '<br />changed type to: ' + control.type;

    control.type = PocketCode.Ui.DialogType.DEFAULT;
    outputContainer.innerHTML += '<br />changed type to: ' + control.type;

    //add buttons
    control.addButton(tbButton1);
    control.addButton(tbButton2);
    try {
        control.addButton(tbButton3); //3rd button throws error
    }
    catch (e) {
        outputContainer.innerHTML += '<br />error: 3rd button';
    }

    try {
        control.addButton(document.createElement('div')); //3rd button throws error
    }
    catch (e) {
        outputContainer.innerHTML += '<br />error: button type';
    }

    //add text to body
    var text = 'some text to test the layout.. schould be long enough to salidate new lines'
    control.bodyInnerHTML = text;
    control.bodyInnerHTML += text;
    control.bodyInnerHTML += text;
    control.bodyInnerHTML += text;

    if (control.bodyInnerHtml === text)
        outputContainer.innerHTML += '<br />set body text';
    else
        outputContainer.innerHTML += '<br />error: invalid body text ???';

};