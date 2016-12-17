/**
 * Created by dinokeskic on 06.12.16.
 */

PocketCode.Camera = (function () {
    Camera.extends(PocketCode.Device,false);

    function Camera(soundManager) {
        PocketCode.Device.call(this,soundManager);
        this._cameraSupported = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia == true;
        this._changeSourceSupported = typeof MediaStreamTrack !== 'undefined' ||
            typeof MediaStreamTrack.getSources == 'undefined';
        this._cameraSource = null;
        this._cameraAccessDenied = false;
        this._sources =  null;
        this._error = null;

        }


    Camera.prototype.merge({
        _changeCameraSource : function(sourceId){
        if (window.stream) {
            window.stream.stop();
        }
        var constraints = {
            video: {
                optional: [{
                    sourceId: sourceId
                }]
            },
            audio:false
        };
        this._start(constraints, function(){}, function(){});
    },
        _handleCameraError : function(error, errorCallback) {
            this._error(error);
            console.log("error:", error);
            if (error.name === 'ConstraintNotSatisfiedError') {
            } else if (error.name === 'PermissionDeniedError') {
                this._cameraAccessDenied = true;
                console.log('Permissions have not been granted to use your camera and ' +
                    'microphone, you need to allow the page access to your devices in ' +
                    'order for the demo to work.');
            }
            console.log('getUserMedia error: ' + error.name, error);

        },
        _start : function (constraints,successCallback, errorCallback) {
        navigator.getUserMedia(constraints || {video: true, audio:false}, function(stream){
            this._cameraOn = true;
            this._getCameraSources();
            successCallback(stream);
        }, function(error){

        });
    },

        _getCameraSources : function(sourceInfos){
        navigator.mediaDevices.enumerateDevices().then(function(sources){
            for (var i = 0; i !== sourceInfos.length; ++i) {
                var sourceInfo = sourceInfos[i];
                if (sourceInfo.kind === 'videoinput') {
                    this._sources.push(sourceInfo);
                } else {
                    console.log('Some other kind of source: ', sourceInfo);
                }
            }

        }).catch(this._handleCameraError);
    }


    });
    });


