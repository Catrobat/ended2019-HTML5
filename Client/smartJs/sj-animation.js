/// <reference path="sj.js" />
/// <reference path="sj-core.js" />
/// <reference path="sj-event.js" />
/// <reference path="sj-components.js" />
'use strict';

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function () {
        return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || 
                function (callback) { return window.setTimeout(callback, 17); };   //~1000/60 (60fps)
    }();
    Object.defineProperty(Window.prototype, 'requestAnimationFrame', { enumerable: false });

    window.cancelAnimationFrame = function () {
        return window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelAnimationFrame ||
                function (id) { window.clearTimeout(id) };
    }();
    Object.defineProperty(Window.prototype, 'cancelAnimationFrame', { enumerable: false });
}


SmartJs.Animation = {

    Type: {
        LINEAR: function (progress) {
            //progress parameter = 0..1 as the time progress
            //returns the animation progress based on a animation function f(1) = 1
            return progress;
        },
        //QUAD: function (progress) {
        //    return Math.pow(progress, 2);
        //},

        LINEAR2D: function (progress) {
            return { x: progress, y: progress };
        },
    },

    Animation: (function () {

        //ctr
        function Animation(start, end, time, /* function */ render/*, updateListener, startOnInit, callbackArgs*/) {
            if (typeof start !== 'number' || typeof end !== 'number')
                throw new Error('invalif argument: start and/or end: expected type: number');

            this._paused = false;

            this._start = start;
            this._end = end;
            //if (typeof start === 'number' && typeof end === 'number')
            this._diff = end - start;   //make sure this does work for inherited classes too (base ctr call)
            this._current = start;

            this._animationTime = time;
            this._render = render;
            //if (callbackArgs) {
            //    if (typeof callbackArgs !== 'object' && !(callbackArgs instanceof Array))
            //        throw new Error('invalif argument: callbackArgs: expected type: object');
            //    this._callBackArgs = callbackArgs;  //introduced to enable threaded animation identification
            //}

            this._timer = new SmartJs.Components.Timer(this._animationTime);
            this._frameId = undefined;

            //events
            this._onUpdate = new SmartJs.Event.Event(this);
            this._onExecuted = new SmartJs.Event.Event(this);
            //if (updateListener) {
            //    if (!(updateListener instanceof SmartJs.Event.EventListener))
            //        throw new Error('invalif argument: listener: expected type: SmartJs.Event.EventListener');
            //    this._onUpdate.addEventListener(updateListener);
            //}

            //if (startOnInit)
            //    this.start();
        }

        //events
        Object.defineProperties(Animation.prototype, {
            onUpdate: {
                get: function () { return this._onUpdate; },
                //enumerable: false,
                //configurable: true,
            },
            onExecuted: {
                get: function () { return this._onExecuted; },
                //enumerable: false,
                //configurable: true,
            },
        });

        //methods
        Animation.prototype.merge({
            //_requestAnimationFrame: function () {
            //    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame ||
            //        function (callback) { return window.setTimeout(callback, 17); };   //~1000/60 (60fps)
            //}(),
            //_cancelAnimationFrame: function () {
            //    return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame ||
            //        function (id) { window.clearTimeout(id) };
            //}(),
            _updateValue: function (factor) {
                var value = Math.round(this._start + factor * this._diff);  //makes sure we only trigger updates if pixels change
                if (this._current === value)
                    return;

                this._current = value;
                //if (this._end != value)
                    this._onUpdate.dispatchEvent({ value: value });
            },
            _executeAnimation: function () {
                var remaining = this._timer.remainingTime;
                if (remaining === 0) {
                    this._updateValue(this._render(1.0));
                    this._onExecuted.dispatchEvent(this._callBackArgs);
                    return;
                }
                else {
                    var progress = (this._animationTime - remaining) / this._animationTime;
                    //if (progress <= 1.0)
                        this._updateValue(this._render(progress));
                    //else //{
                    //    this._updateValue(1.0);
                        //return;
                    //}

                    if (!this._paused && remaining !== 0) {
                        //var _self = this;
                        //this._frameId = this._requestAnimationFrame.call(window, this._executeAnimation.bind(this));
                        this._frameId = window.requestAnimationFrame(this._executeAnimation.bind(this));
                    }
                }
            },
            start: function (callbackArgs) {
                if (callbackArgs) {
                    if (typeof callbackArgs !== 'object' || (callbackArgs instanceof Array))
                        throw new Error('invalid argument: callbackArgs: expected type: object');
                    this._callBackArgs = callbackArgs;  //introduced to enable threaded animation identification
                }
                this._timer.start();
                //var _self = this;
                //this._frameId = this._requestAnimationFrame.call(window, this._executeAnimation.bind(this));
                this._frameId = window.requestAnimationFrame(this._executeAnimation.bind(this));
            },
            pause: function () {
                this._timer.pause();
                //var _self = this;
                //this._cancelAnimationFrame.call(window, this._frameId);
                window.cancelAnimationFrame(this._frameId);
                this._paused = true;
            },
            resume: function () {
                this._timer.resume();
                this._paused = false;
               // var _self = this;
                //this._frameId = this._requestAnimationFrame.call(window, this._executeAnimation.bind(this));
                this._frameId = window.requestAnimationFrame(this._executeAnimation.bind(this));
            },
            stop: function () {
                this._timer.stop();
                //var _self = this;
                //this._cancelAnimationFrame.call(window, this._frameId);
                window.cancelAnimationFrame(this._frameId);
                this._paused = false;
            },
        });

        return Animation;
    })(),
};

SmartJs.Animation.Animation2D = (function () {
    Animation2D.extends(SmartJs.Animation.Animation, false);

    //ctr
    function Animation2D(start, end, time, /* function */ render/*, listener, startOnInit, callbackArgs*/) {
        SmartJs.Animation.Animation.call(this, 0, 0, time, render/*, listener, startOnInit, callbackArgs*/);
        if (typeof start.x !== 'number' || typeof start.y !== 'number' || typeof end.x !== 'number' || typeof end.y !== 'number')
            throw new Error('invalid argument: start and/or end: expected type: object { x: [number], y: [number] }');

        this._start = start;
        this._end = end;

        this._diff = {
            x: end.x - start.x,
            y: end.y - start.y,
        };
        this._current = start;
    }

    Animation2D.prototype.merge({
        /* override */
        _updateValue: function (factor) {
            var value = {
                x: Math.round(this._start.x + factor.x * this._diff.x),  //makes sure we only trigger updates if pixels change
                y: Math.round(this._start.y + factor.y * this._diff.y),
            };

            if (this._current.x === value.x && this._current.y === value.y)
                return;

            this._current = value;
            //if (this._end.x != value.x || this._end.y != value.y)
                this._onUpdate.dispatchEvent({ value: value });
        },
        /* override */
        //_executeAnimation: function () {
        //    var remaining = this._timer.remainingTime;
        //    if (remaining === 0) {
        //        this._updateValue(this._end);
        //        this._onExecuted.dispatchEvent(this._callBackArgs);
        //        return;
        //    }
        //    else {
        //        var progress = (this._animationTime - remaining) / this._animationTime;
        //        var factor = this._render(progress);
        //        this._updateValue( {x: this._start.x + factor.x * this._diff.x, y: this._start.y + factor.y * this._diff.y } );

        //        if (!this._paused && remaining !== 0) {
        //            var _self = this;
        //            this._frameId = this._requestAnimationFrame.call(window, function () { _self._executeAnimation(); });
        //        }
        //    }
        //},

    });

    return Animation2D;
}());

