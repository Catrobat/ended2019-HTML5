/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
'use strict';

PocketCode.BroadcastManager = (function () {

    //ctr: broadcast = [{id: "s12", name:"asd"}, {...}]
    function BroadcastManager(broadcasts) {
        this.init(broadcasts);
    }

    //methods
    BroadcastManager.prototype.merge({
        init: function(broadcasts) {
            this._pendingBW = {};

            this._subscriptions = {};
            for (var i = 0, l = broadcasts.length; i < l; i++) {
                this._subscriptions[broadcasts[i].id] = [];
            }
        },

        subscribe: function (bcId, listener) {
            if (typeof bcId !== 'string')
                throw new Error('invalid argument: broadcast id, expected type: string');
            if (!(listener instanceof SmartJs.Event.EventListener))
                throw new Error('invalid argument: subscriber listener, expected type: SmartJs.Event.EventListener');

            if (!this._subscriptions[bcId])
                throw new Error('invalid argument: invalid (unknown) broadcast id');
            this._subscriptions[bcId].push(listener);
        },

        publish: function (bcId, pubListener, threadId) {  //listener type of SmartJs.Event.EventListener
            if (typeof bcId !== 'string' || !this._subscriptions[bcId])
                throw new Error('invalid argument: broadcast id not found');
            if (pubListener && !(pubListener instanceof SmartJs.Event.EventListener))
                throw new Error('invalid argument: event listener');
            if (pubListener && !threadId)
                throw new Error('invalid argument: threadId: a thread id is required for broadcastWait calls');

            if (pubListener)
                this._handleBroadcastWait(bcId, pubListener, threadId);
            else {
                //handle default broadcast
                var subs = this._subscriptions[bcId];
                for (var i = 0, l = subs.length; i < l; i++) {
                    //this._subscriptions[bcId].execute();    //each brick supports .execute()
                    var subListener = subs[i];
                    subListener.handler.call(subListener.scope);
                }
            }
        },

        _handleBroadcastWait: function (brId, pubListener, threadId) {
            if (!(pubListener instanceof SmartJs.Event.EventListener))
                throw new Error('invalid argument: publisher Listener, expected type: SmartJs.Event.EventListener');

            var subs = this._subscriptions[brId];
            var subsCount = subs.length;    //how many listeners

            if (subsCount > 0) {
                var threadId = SmartJs._getId();            //each br wait call has its own unique id
                this._pendingBW[threadId] = { threadId: threadId, broadcastId: brId, counter: subsCount, listener: pubListener, loopDelay: false };
                //notify subscribers
                //var subsCount = this._subscriptions[brId];
                for (var i = 0; i < subsCount; i++) {
                    var subListener = subs[i];  //listening brick
                    subListener.handler.call(subListener.scope, { id: threadId, listener: new SmartJs.Event.EventListener(_brickExecutedHandler, this) });
                    //add event to brick to get return value
                    //brick.execute(new SmartJs.Event.EventListener(_brickExecutedHandler, this), threadId);
                }
            }
            else    //no subscribers
                this._notifyPublisher(pubListener, threadId);
        },
        
        _brickExecutedHandler: function (id, loopDelay) {
            var pendingBW = this._pendingBW[args.id];
            //var counter = pendingBW.counter;
            if (pendingBW.counter === 1) {    //last
                var threadId = pendingBW.threadId;
                var pubListener = pendingBW.listener;
                var loopDelay = pendingBW.loopDelay;
                delete this._pendingBW[args.id];    //remove from pending broadcasts
                this._notifyPublisher(pubListener, threadId, loopDelay);
            }
            else {
                pendingBW.counter--;
                pendingBW.loopDelay = loopDelay;
            }
        },

        _notifyPublisher: function (pubListener, threadId, loopDelay) {
            pubListener.handler.call(pubListener.scope, threadId, loopDelay);
        },
    });

    return BroadcastManager;
})();

