/// <reference path="../../../../Client/pocketCode/scripts/components/device.js" />
'use strict';

var videoWidth,
    videoWidthLabel,
    videoHeight,
    videoHeightLabel,
    backgroundWidth,
    backgroundWidthLabel,
    backgroundHeight,
    backgroundHeightLabel,
    camera,
    backgroundCanvas,
    backgroundCtx,
    fdCanvasContainer,
    device;

window.addEventListener('load', onLoad);

function onLoad() {
    //init elements
    videoWidthLabel = document.getElementById('videoWidthLabel');
    var elem = document.getElementById('videoWidth');
    videoWidth = parseInt(elem.value);
    videoWidthLabel.innerText = videoWidth;
    elem.addEventListener('change', function (e) {
        videoWidth = parseInt(e.target.value);
        videoWidthLabel.innerText = videoWidth;
        onVideoSizeChange();
    });

    videoHeightLabel = document.getElementById('videoHeightLabel');
    elem = document.getElementById('videoHeight');
    videoHeight = parseInt(elem.value);
    videoHeightLabel.innerText = videoHeight;
    elem.addEventListener('change', function (e) {
        videoHeight = parseInt(e.target.value);
        videoHeightLabel.innerText = videoHeight;
        onVideoSizeChange();
    });

    backgroundWidthLabel = document.getElementById('backgroundWidthLabel');
    elem = document.getElementById('backgroundWidth');
    backgroundWidth = parseInt(elem.value);
    backgroundWidthLabel.innerText = backgroundWidth;
    elem.addEventListener('change', function (e) {
        backgroundWidth = parseInt(e.target.value);
        backgroundWidthLabel.innerText = backgroundWidth;
        backgroundCanvas.width = backgroundWidth;
        //onBackgroundChange();
    });

    backgroundHeightLabel = document.getElementById('backgroundHeightLabel');
    elem = document.getElementById('backgroundHeight');
    backgroundHeight = parseInt(elem.value);
    backgroundHeightLabel.innerText = backgroundHeight;
    elem.addEventListener('change', function (e) {
        backgroundHeight = parseInt(e.target.value);
        backgroundHeightLabel.innerText = backgroundHeight;
        backgroundCanvas.height = backgroundHeight;
        //onBackgroundChange();
    });

    elem = document.getElementById('cameraSelect');
    elem.addEventListener('change', function (e) {
        camera = parseInt(e.target.value);
        onCameraSelectChange();
    });
    camera = parseInt(elem.value);
    document.getElementById('on').addEventListener('click', function (e) {
        device.startCamera();
    });
    document.getElementById('off').addEventListener('click', function (e) {
        device.stopCamera();
    });

    backgroundCanvas = document.getElementById('backgroundCanvas');
    backgroundCanvas.height = backgroundHeight;
    backgroundCanvas.width = backgroundWidth;
    backgroundCtx = backgroundCanvas.getContext('2d');

    fdCanvasContainer = document.getElementById('fdCanvasContainer');

    document.getElementById('devicePause').addEventListener('click', function (e) {
        device.pause();
    });
    document.getElementById('deviceResume').addEventListener('click', function (e) {
        device.resume();
    });
    document.getElementById('deviceDispose').addEventListener('click', function (e) {
        device.dispose();
    });

    //device
    device = new PocketCode.DeviceEmulator();
    //TODO: device.setSceneSize(videoWidth, videoHeight);    //= set at scene change
    device.onCameraUsageChanged.addEventListener(new SmartJs.Event.EventListener(cameraUsageChangeHandler, this));
}

function onVideoSizeChange() {
    device.setSceneSize(videoWidth, videoHeight);
}

function onCameraSelectChange() {

}

var timeout, //to enable debugging I use timouts instead of requestAnimationFrame or interval
video,
streamWidth,
streamHeight;
function cameraUsageChangeHandler(e) {
    if (e.on) {
        if (timeout)
            window.clearTimeout(timeout);

        video = e.src;
        streamWidth = e.width;
        streamHeight = e.height;
        startRendering();
    }
    else {
        //stop rendering
    }
}

function startRendering() {
    backgroundCtx.clearRect(0, 0, backgroundWidth, backgroundHeight);
    backgroundCtx.drawImage(video, 0, 0, streamWidth, streamHeight);

    window.setTimeout(startRendering, 200);
}

