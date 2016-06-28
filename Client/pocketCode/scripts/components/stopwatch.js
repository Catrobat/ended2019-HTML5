'use strict';

PocketCode.Stopwatch = (function () {
    Stopwatch.extends(SmartJs.Core.Component);

    function Stopwatch(device, sprite, jsonStopwatch) {
        this._init();
    }

    //accessors
    Object.defineProperties(Stopwatch.prototype, {
        value: {
            get: function () {
                var ms = 0.0;
                if (!this._startDateTime)
                    return ms;
                if (this._lastPausedDateTime)   //currently paused
                    ms = (this._lastPausedDateTime - this._startDateTime) - this._pausedTimespan;
                else
                    ms = (new Date() - this._startDateTime) - this._pausedTimespan;
                return ms / 1000.0;
            },
        },
    });

    //methods
    Stopwatch.prototype.merge({
        _init: function() {
            this._startDateTime = undefined;
            this._lastPausedDateTime = undefined;   //only set if currently paused
            this._pausedTimespan = 0.0;
        },
        start: function () {
            this._init();
            this._startDateTime = new Date();
        },
        //restart: function () { this.start(); },
        pause: function () {
            this._lastPausedDateTime = new Date();
        },
        resume: function () {
            this._pausedTimespan += new Date() - this._lastPausedDateTime;
            this._lastPausedDateTime = undefined;
        },
        stop: function () {
            this._init();
        },
    });

    return Stopwatch;
})();