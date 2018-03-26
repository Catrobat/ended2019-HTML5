/// <reference path="sj.js" />
/// <reference path="sj-core.js" />
/// <reference path="sj-event.js" />
/// <reference path="sj-components.js" />
'use strict';

//if (!window.requestAnimationFrame) {
//    window.requestAnimationFrame = function () {
//        return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame ||
//                function (callback) { return window.setTimeout(callback, 17); };   //~1000/60 (60fps)
//    }();
//    Object.defineProperty(window, 'requestAnimationFrame', { enumerable: false });

//    window.cancelAnimationFrame = function () {
//        return window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelAnimationFrame ||
//                function (id) { window.clearTimeout(id) };
//    }();
//    Object.defineProperty(window, 'cancelAnimationFrame', { enumerable: false });
//}

SmartJs._AnimationFrame = (function () {

    function AnimationFrame() {
        //helpers
        this._request = function () {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame ||
                    function (callback) { return window.setTimeout(callback, 17); };   //~1000/60 (60fps)
        }();
        this._cancel = function () {
            return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelAnimationFrame ||
                    function (id) { window.clearTimeout(id) };
        }();
        
        this._frameId = undefined;

        //event (private)
        this._onUpdate = new SmartJs.Event.Event(this);
    }

    //methods
    AnimationFrame.prototype.merge({
        _run: function(){
            this._onUpdate.dispatchEvent();
            this._frameId = this._request(this._run.bind(this));
        },
        addEventListener: function (listener) {
            var e = this._onUpdate,
                start = !e.listenersAttached;
            e.addEventListener(listener);
            if (start)
                this._frameId = this._request(this._run.bind(this));
        },
        removeEventListener: function (listener) {
            var e = this._onUpdate
            e.removeEventListener(listener);
            if (!e.listenersAttached) {
                this._cancel(this._frameId);
                this._frameId = undefined;
            }
        },
        /* override */
        //dispose: function () {
        //    //static class: cannot be disposed
        //},
    });

    return AnimationFrame;
})();

//static class: constructor override (keeping code coverage enabled)
SmartJs.AnimationFrame = new SmartJs._AnimationFrame();


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
        Animation.extends(SmartJs.Core.Component);
        //ctr
        function Animation(start, end, time, /* function */ render/*, updateListener, startOnInit, callbackArgs*/) {
            if (isNaN(start) || isNaN(end))
                throw new Error('invalid argument: start and/or end: expected type: number');

            if (render !== undefined && (typeof render !== 'function' || render(1) !== 1))  //!=undefined to allow base ctr calls
                throw new Error('parameter \'render\' has to be a function with render(1) = 1 to terminate the animation correctly');

            this._callbackArgs = {};
            this._paused = false;

            this._start = start;
            this._end = end;
            //if (typeof start === 'number' && typeof end === 'number')
            this._diff = end - start;   //make sure this does work for inherited classes too (base ctr call)
            this._current = start;

            this._animationTime = time;
            this._render = render;  //the rendering function - SmartJs.Animation.TYPE

            this._timer = new SmartJs.Components.Timer(this._animationTime);
            this._frameId = undefined;

            //events
            this._onUpdate = new SmartJs.Event.Event(this);
            this._onExecuted = new SmartJs.Event.Event(this);
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
            _updateValue: function (factor) {
                var value = this._start + factor * this._diff;
                if (factor == 1.0) {
                    this._current = this._end;
                    this._onUpdate.dispatchEvent({ value: this._end });
                    return;
                }
                if (Math.abs(this._current - value) < 1)  //makes sure we only trigger updates if pixels change
                    return;

                this._current = value;
                this._onUpdate.dispatchEvent({ value: value });
            },
            _executeAnimation: function () {
                var remaining = this._timer.remainingTime;
                var progress = Math.min(1.0, (this._animationTime - remaining) / this._animationTime);  //timers are not exact
                this._updateValue(this._render(progress));

                if (progress == 1.0)
                    this._onExecuted.dispatchEvent(this._callbackArgs);
                else if (!this._paused)
                    this._frameId = window.requestAnimationFrame(this._executeAnimation.bind(this));
            },
            start: function (callbackArgs) {
                if (callbackArgs) {
                    if (typeof callbackArgs !== 'object' || (callbackArgs instanceof Array))
                        throw new Error('invalid argument: callbackArgs: expected type: object');
                    this._callbackArgs = callbackArgs;  //introduced to enable threaded animation identification
                }
                this._timer.start();
                this._frameId = window.requestAnimationFrame(this._executeAnimation.bind(this));
            },
            pause: function () {
                this._timer.pause();
                window.cancelAnimationFrame(this._frameId);
                this._paused = true;
            },
            resume: function () {
                this._timer.resume();
                this._paused = false;
                this._frameId = window.requestAnimationFrame(this._executeAnimation.bind(this));
            },
            stop: function () {
                this._timer.stop();
                window.cancelAnimationFrame(this._frameId);
                this._paused = false;
            },
            dispose: function () {
                this.stop();
                this._timer.dispose();
                SmartJs.Core.Component.prototype.dispose.call(this);
            },
        });

        return Animation;
    })(),
};

SmartJs.Animation.Animation2D = (function () {
    Animation2D.extends(SmartJs.Animation.Animation, false);

    //ctr
    function Animation2D(start, end, time, /* function */ render/*, listener, startOnInit, callbackArgs*/) {
        SmartJs.Animation.Animation.call(this, 0, 0, time);//, render/*, listener, startOnInit, callbackArgs*/);

        if (isNaN(start.x) || isNaN(start.y) || isNaN(end.x) || isNaN(end.y))
            throw new Error('invalid argument: start and/or end: expected type: object { x: [number], y: [number] }');

        if (typeof render !== 'function' || render(1).x !== 1 || render(1).y !== 1)
            throw new Error('parameter \'render\' has to be a function with render(1) = {x: 1, y: 1} to terminate the animation correctly');
        this._render = render;

        this._start = start;
        this._end = end;

        this._diff = {
            x: end.x - start.x,
            y: end.y - start.y,
        };
        this._current = start;
    }

    //methods
    Animation2D.prototype.merge({
        /* override */
        _updateValue: function (factor) {
            var value = {
                x: this._start.x + factor.x * this._diff.x,  //makes sure we only trigger updates if pixels change
                y: this._start.y + factor.y * this._diff.y,
            };

            if (factor.x == 1.0 && factor.y == 1.0) {
                this._current = this._end;
                this._onUpdate.dispatchEvent({ value: this._end });
                return;
            }
            if ((Math.abs(this._current.x - value.x) < 1 && Math.abs(this._current.y - value.y) < 1))
                return;

            this._current = value;
            this._onUpdate.dispatchEvent({ value: value });
        },
    });

    return Animation2D;
}());

SmartJs.Animation.Rotation = (function () {
    Rotation.extends(SmartJs.Core.Component);

    //ctr
    function Rotation(angle) {
        if (angle && typeof angle != 'number')
            throw new Error('invalid argument angle: expected type number');
        this._startAngle = angle;
        this._rotationSpeed = 0.0;

        this._timer = new SmartJs.Components.Stopwatch();
        this._frameId = undefined;
        this._paused = false;

        //events
        this._onUpdate = new SmartJs.Event.Event(this);
    }

    //events
    Object.defineProperties(Rotation.prototype, {
        onUpdate: {
            get: function () { return this._onUpdate; },
        },
    });

    //properties
    Object.defineProperties(Rotation.prototype, {
        angle: {
            get: function () {
                var angle = (this._startAngle + this._timer.value * this._rotationSpeed) % 360.0;
                //modulo for negative numbers will return a negative number in js
                if (angle < 0)
                    angle += 360.0;
                return angle;
            },
            set: function (angle) {
                if (typeof angle != 'number')
                    throw new Error('invalid argument angle: expected type number');

                this._startAngle = angle;
                this._timer.reset();
                if (!this._timer.startTimestamp)
                    this._onUpdate.dispatchEvent({ value: this.angle });
            },
        },
        rotationSpeed: {    //angle per second
            get: function () {
                return this._rotationSpeed;
            },
            set: function (value) {
                if (typeof value != 'number')
                    throw new Error('invalid argument rotationSpeed: expected type number');
                if (value == this._rotationSpeed)
                    return;
                this._startAngle = this.angle;  //new start angle due to change
                this._rotationSpeed = value;
                if (value === 0.0) {
                    this.stop();
                    this._onUpdate.dispatchEvent({ value: this.angle });
                }
                else if (!this._timer.startTimestamp) //not started
                    this._start();
            },
        },
    });

    Rotation.prototype.merge({
        _executeAnimation: function () {
            if (this._paused)
                return;
            this._onUpdate.dispatchEvent({ value: this.angle });
            this._frameId = window.requestAnimationFrame(this._executeAnimation.bind(this));
        },
        toObject: function () { //alows exact cloning
            return {
                startAngle: this._startAngle,
                startTimestamp: this._timer.startTimestamp,
                rotationSpeed: this._rotationSpeed,
            };
        },
        setObject: function (obj) { //alows exact cloning
            this._startAngle = obj.startAngle || 0.0;
            this._rotationSpeed = obj.rotationSpeed || 0.0;
            if (obj.startTimestamp && !!obj.rotationSpeed)
                this._start(obj.startTimestamp);
        },
        _start: function (startTimestamp) {   //or restart
            this._timer.start(startTimestamp);
            if (!this._frameId)
                this._frameId = window.requestAnimationFrame(this._executeAnimation.bind(this));
            this._paused = false;
        },
        pause: function () {
            this._timer.pause();
            window.cancelAnimationFrame(this._frameId);
            this._paused = true;
        },
        resume: function () {
            this._timer.resume();
            this._paused = false;
            this._frameId = window.requestAnimationFrame(this._executeAnimation.bind(this));
        },
        stop: function () {
            window.cancelAnimationFrame(this._frameId);
            this._timer.stop();
            this._paused = false;
        },
        dispose: function () {
            this.stop();
            this._timer.dispose();
            SmartJs.Core.Component.prototype.dispose.call(this);
        },
    });

    return Rotation;
}());
