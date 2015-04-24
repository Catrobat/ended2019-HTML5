/// <reference path="sj.js" />
/// <reference path="sj-error.js" />
/// <reference path="sj-core.js" />
'use strict';


//https://github.com/kbjr/Events.js
//see: _helpers/Events


SmartJs.Event = {
    Event: (function () {
        Event.extends(SmartJs.Core.Component);

        function Event(target) {
            if (typeof target !== 'object')
                throw new Error('invalid argument: expected target type: object');
            //if (!(target instanceof SmartJs.Core.Component))
            //    throw new Error('invalid argument: expected target type: SmartJs.Core.Component');

            this.target = target;
            this._listeners = [];
        };

        Event.prototype.merge({
            addEventListener: function (listener) {
                if (!(listener instanceof SmartJs.Event.EventListener))
                    throw new Error('invalid argument: expected listener type: SmartJs.Event.EventListener');

                var idx = this.__listenerIndex(listener);
                if (idx == -1) {  //not found
                    this._listeners.push(listener);
                    return true;
                }
                return false;
            },
            removeEventListener: function (listener) {
                if (!(listener instanceof SmartJs.Event.EventListener))
                    throw new Error('invalid argument: expected listener type: SmartJs.Event.EventListener');

                var idx = this.__listenerIndex(listener);
                if (idx >= 0) {
                    this._listeners.splice(idx, 1);
                    return true;
                }
                return false;
            },
            __listenerIndex: function (listener) {
                var idx = this._listeners.indexOf(listener);
                if (idx >= 0)
                    return idx;

                var li = this._listeners;
                var item;
                for (var i = 0, l = li.length; i < l; i++) {
                    item = li[i];
                    if (!item) {
                        this._listeners.splice(i, 1);
                        i--; l--;
                        continue;
                    }
                    if (item.handler === listener.handler && item.scope === listener.scope)
                        return i;
                }
                return -1;
            },
            dispatchEvent: function (args, target, bubbles) {
                if (typeof args !== 'undefined' && typeof args !== 'object')
                    throw new Error('invalid argument: expected optional argument (args) type: object');
                if (typeof target !== 'undefined' && typeof target !== 'object')
                    throw new Error('invalid argument: expected optional target type: object');
                if (typeof bubbles !== 'undefined' && typeof bubbles !== 'boolean')
                    throw new Error('invalid argument: expected optional bubbles type: boolean');

                var a = args || {};
                //try {    //notice: params change if an event is passed as the properties are read only
                    a.target = target || this.target;
                    a.bubbles = bubbles || false;
                //}
                //catch (e) {
                //    a.sjTarget = target || this.target;
                //    a.sjBubbles = bubbles || false;
                //}
                
                var li = this._listeners || []; //necessary due to the fact that binded events may call a disposed event
                var item;
                for (var i = 0, l = li.length; i < l; i++) {
                    item = li[i];
                    if (!item || !item.handler || (item.scope && item.scope._disposed)) {
                        this._listeners.splice(i, 1); //this.removeEventListener(item);
                        l--;
                        i--;
                        continue;
                    }

                    if (item.scope)
                        item.handler.call(item.scope, a);
                    else
                        item.handler(a);
                }
            },
            //dispose: function () {
            //    //clear cross reference
            //    //this.target = undefined;
            //    SmartJs.Core.Component.prototype.dispose.call(this);
            //},
        });
        return Event;
    })(),


    EventListener: (function () {
        function EventListener(handler, scope) {
            if (typeof handler !== 'function')
                throw new Error('invalid argument: expected handler type: function');
            if (typeof scope !== 'undefined' && typeof scope !== 'object')
                throw new Error('invalid argument: expected optional scope type: object');

            this.handler = handler;
            this.scope = scope;
        };

        //Event.prototype.merge({
        //    dispose: function () {
        //        //clear cross reference
        //        delete this.handler;
        //        delete this.scope;
        //    },
        //});
        return EventListener;
    })(),

};


