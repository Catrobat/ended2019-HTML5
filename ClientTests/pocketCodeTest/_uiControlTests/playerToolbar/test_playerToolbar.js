/// <reference path="../../../../Client/pocketCode/scripts/uiControls/playerToolbar.js" />
'use strict';

window.onload = function () {

    var settingsContainer = document.getElementById('settingsContainer');
    var outputContainer = document.getElementById('outputContainer');
    var layoutContainer = document.getElementById('layoutContainer');

    var tbButton1 = new PocketCode.Ui.Button('cancel');
    var tbButton2 = new PocketCode.Ui.Button('ok');
    var tbButton3 = new PocketCode.Ui.Button('not supported');

    var control = new PocketCode.Ui.PlayerToolbar(PocketCode.Ui.PlayerToolbarSettings.MOBILE_IOS);

    //click handler
    var onClickEventFired = function (e) {
        outputContainer.innerHTML += '<br />clicked: ' + e.command;
    };

    control.onButtonClicked.addEventListener(new SmartJs.Event.EventListener(onClickEventFired, this));

    window.onresize = function (e) {
        control._onResize.dispatchEvent();
    };
    control._onResize.dispatchEvent();  //once at the beginning

    layoutContainer.appendChild(control._dom);

    control.screenshotButtonDisabled = true;
    outputContainer.innerHTML += '<br />screenshot disabled';
    control.axesButtonChecked = true;
    outputContainer.innerHTML += '<br />axes button checked';

    control.hide();
    outputContainer.innerHTML += '<br />hidden: ' + control.hidden;
    control.show();
    outputContainer.innerHTML += '<br />hidden: ' + control.hidden;



};