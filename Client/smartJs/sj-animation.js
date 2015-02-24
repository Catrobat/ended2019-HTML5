/// <reference path="sj.js" />
/// <reference path="sj-core.js" />
/// <reference path="sj-event.js" />
/// <reference path="sj-components.js" />
'use strict';

SmartJs.Animation = {

    Type: {
        LINEAR: function (progress) {
            //progress parameter = 0..1 as the time progress
            //returns the animation progress based on a animation function f(1) = 1
            return progress;
        },
        QUAD: function (progress) {
            return Math.pow(progress, 2);
        },

        LINEAR2D: function (progress) {
            return { x: progress, y: progress };
        },
    },

    Animation: (function () {

        //ctr
        function Animation(start, end, time, /* function */ render, listener, startOnInit, callbackArgs) {
            this._paused = false;

            this._start = start;
            this._end = end;
            if (typeof start === 'number' && typeof end === 'number')
                this._diff = end - start;   //make sure this does work for inherited classes too (base ctr call)
            this._current = start;

            this._animationTime = time;
            this._render = render;
            this._callBackArgs = callbackArgs;  //introduced to enable threaded animation identification

            this._timer = new SmartJs.Components.Timer(this._animationTime);
            this._frameId = undefined;

            //events
            this._onUpdate = new SmartJs.Event.Event(this);
            this._onExecuted = new SmartJs.Event.Event(this);
            if (listener)
                this._onExecuted.addEventListener(listener);

            if (startOnInit)
                this.start();
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

        Animation.prototype = {
            _requestAnimationFrame: function () {
                return window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || /*window.msRequestAnimationFrame ||*/
                    function (render) { return setTimeout(render, 16); };   //~1000/60 (60fps)
            }(),
            _cancelAnimationFrame: function () {
                return window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || /*window.msCancelAnimationFrame ||*/ clearTimeout;
            }(),
            _updateValue: function (value) {
                value = Math.round(value);  //makes sure we only trigger updates if pixes change
                if (this._current === value)
                    return;

                this._current = value;
                this._onUpdate.dispatchEvent({ value: value });
            },
            _executeAnimation: function () {
                var remaining = this._timer.remainingTime;
                if (remaining === 0) {
                    this._updateValue(this._end);
                    this._onExecuted.dispatchEvent(self._callBackArgs);
                    return;
                }
                else {
                    var progress = (this._animationTime - remaining) / this._animationTime;
                    this._updateValue(this._start + this._render(progress) * this._diff);

                    if (!this._paused && remaining !== 0)
                        this._frameId = this._requestAnimationFrame(this._executeAnimation.bind());
                }
            },
            start: function () {
                this._timer.start();
                this._frameId = this._requestAnimationFrame(this._executeAnimation.bind());
            },
            pause: function () {
                this._timer.pause();
                this._cancelAnimationFrame(this._frameId);
                this._paused = true;
            },
            resume: function () {
                this._timer.resume();
                this._paused = false;
                this._frameId = this._requestAnimationFrame(this._executeAnimation.bind());
            },
            stop: function () {
                this._timer.stop();
                this._cancelAnimationFrame(this._frameId);
                this._paused = false;
            },
        }

        return Animation;
    })(),
};

SmartJs.Animation.Animation2D = (function () {
    Animation2D.extends(SmartJs.Animation.Animation, false);

    //ctr
    function Animation2D(start, end, time, /* function */ render, listener, startOnInit, callbackArgs) {
        SmartJs.Animation.Animation.call(this, start, end, time, render, listener, startOnInit, callbackArgs);

        this._diff = {
            x: end.x - start.x,
            y: end.y - start.y,
        };
    }

    Animation2D.prototype.merge({
        /* override */
        _updateValue: function (value) {
            value = {
                x: Math.round(value.x),  //makes sure we only trigger updates if pixes change
                y: Math.round(value.x),
            };

            if (this._current.x === value.x && this._current.y === value.y);
                return;

            this._current = value;
            this._onUpdate.dispatchEvent({ value: value });
        },
        /* override */
        _executeAnimation: function () {
            var remaining = this._timer.remainingTime;
            if (remaining === 0) {
                this._updateValue(this._end);
                this._onExecuted.dispatchEvent(self._callBackArgs);
                return;
            }
            else {
                var progress = (this._animationTime - remaining) / this._animationTime;
                var factor = this._render(progress);
                this._updateValue( {x: this._start.x + factor.x * this._diff.x, y: this._start.y + factor.y * this._diff.y } );

                if (!this._paused && remaining !== 0)
                    this._frameId = this._requestAnimationFrame(this._executeAnimation.bind());
            }
        },

    });

    return Animation2D;
}());

