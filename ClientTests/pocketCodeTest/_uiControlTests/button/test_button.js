'use strict';

window.onload = function () {

    var settingsContainer = document.getElementById('settingsContainer');
    var outputContainer = document.getElementById('outputContainer');
    var layoutContainer = document.getElementById('layoutContainer');

    var control = new PocketCode.Ui.Button();
    layoutContainer.appendChild(control._dom);

    control = new PocketCode.Ui.Button('text');
    layoutContainer.appendChild(control._dom);

    //click handler
    var onClickEventFired = function () {
        outputContainer.innerHTML += '<br />clicked';
    };

    control.onClick.addEventListener(new SmartJs.Event.EventListener(onClickEventFired, this));

    control.text = 'changed';
    outputContainer.innerHTML += '<br />text change to: ' + control.text;

    control.disabled = true;
    outputContainer.innerHTML += '<br />button: disabled: ' + control.disabled;

    control.disabled = false;
    outputContainer.innerHTML += '<br />button: disabled: ' + control.disabled;


    //svg button
    control = new PocketCode.Ui.PlayerSvgButton(PocketCode.Ui.SvgImageString.PLAY, 'play', true);
    layoutContainer.appendChild(control._dom);
    control.onClick.addEventListener(new SmartJs.Event.EventListener(onClickEventFired, this));

    control = new PocketCode.Ui.PlayerSvgButton(PocketCode.Ui.SvgImageString.PAUSE, 'pause', true);
    layoutContainer.appendChild(control._dom);

    control = new PocketCode.Ui.PlayerSvgButton(PocketCode.Ui.SvgImageString.RESTART, 'restart');
    layoutContainer.appendChild(control._dom);

    control = new PocketCode.Ui.PlayerSvgButton(PocketCode.Ui.SvgImageString.BACK, 'back');
    layoutContainer.appendChild(control._dom);

    control = new PocketCode.Ui.PlayerSvgButton(PocketCode.Ui.SvgImageString.SCREENSHOT, 'screenshot');
    layoutContainer.appendChild(control._dom);

    control = new PocketCode.Ui.PlayerSvgButton(PocketCode.Ui.SvgImageString.AXES, 'axes axes axes');
    layoutContainer.appendChild(control._dom);
    control.checked = true;
    outputContainer.innerHTML += '<br />svg button: checked: ' + control.checked;
    control.checked = false;
    outputContainer.innerHTML += '<br />svg button: checked: ' + control.checked;

    control.disabled = true;
    outputContainer.innerHTML += '<br />svg button: disabled: ' + control.disabled;

    control.disabled = false;
    outputContainer.innerHTML += '<br />svg button: disabled: ' + control.disabled;


};