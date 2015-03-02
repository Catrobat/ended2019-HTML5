/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
'use strict';
/**
 * @fileOverview BroadcastManager is responsible for creating
 * @author catrobat HTML5 team
 * @version 1.1
 *
 */
PocketCode.BroadcastManager = (function () {

    //ctr: broadcast = [{id: "s12", name:"asd"}, {...}]
    /**
     *  This is just a sample text
     * @param broadcasts The given broadcasts from the parsing
     * @constructor
     */
    function BroadcastManager(broadcasts) {
        this.init(broadcasts);
    }

    //methods

    /**
     *
     */
    BroadcastManager.prototype.merge({
        /**
         *
         * @param broadcasts
         */
        init: function(broadcasts) {
            this._pendingBW = {};

            this._subscriptions = {};
            for (var i = 0, l = broadcasts.length; i < l; i++) {
                this._subscriptions[broadcasts[i].id] = [];
            }
        },
        /**
         *
         * @param bcId
         * @param listener
         */
        subscribe: function (bcId, listener) {
            if (typeof bcId !== 'string')
                throw new Error('invalid argument: broadcast id, expected type: string');
            if (!(listener instanceof SmartJs.Event.EventListener))
                throw new Error('invalid argument: subscriber listener, expected type: SmartJs.Event.EventListener');

            if (!this._subscriptions[bcId])
                throw new Error('invalid argument: invalid (unknown) broadcast id');
            this._subscriptions[bcId].push(listener);
        },
        /**
         *
         * @param bcId
         * @param pubListener
         * @param threadId
         */
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
        /**
         *
         * @param brId
         * @param pubListener
         * @param callId
         * @private
         */
        _handleBroadcastWait: function (brId, pubListener, callId) {
            if (!(pubListener instanceof SmartJs.Event.EventListener))
                throw new Error('invalid argument: publisher Listener, expected type: SmartJs.Event.EventListener');

            var subs = this._subscriptions[brId];
            var subsCount = subs.length;    //how many listeners

            if (subsCount > 0) {
                var threadId = SmartJs._getId();            //each br wait call has its own unique id
                this._pendingBW[threadId] = { callId: callId, broadcastId: brId, counter: subsCount, listener: pubListener, loopDelay: false };
                //notify subscribers
                //var subsCount = this._subscriptions[brId];
                for (var i = 0; i < subsCount; i++) {
                    var subListener = subs[i];  //listening brick
                    subListener.handler.call(subListener.scope, { id: threadId, listener: new SmartJs.Event.EventListener(this._brickExecutedHandler, this) });
                    //add event to brick to get return value
                    //brick.execute(new SmartJs.Event.EventListener(_brickExecutedHandler, this), threadId);
                }
            }
            else    //no subscribers
                this._notifyPublisher(pubListener, threadId);
        },
        /**
         *
         * @param e
         * @private
         */
        _brickExecutedHandler: function (e) {   //id, loopDelay) {
            var pendingBW = this._pendingBW[e.id];
            //var counter = pendingBW.counter;
            if (pendingBW.counter === 1) {    //last
                var callId = pendingBW.callId;
                var pubListener = pendingBW.listener;
                var loopDelay = pendingBW.loopDelay || e.loopDelay;
                delete this._pendingBW[e.id];    //remove from pending broadcasts
                this._notifyPublisher(pubListener, callId, loopDelay);
            }
            else { // termination?
                pendingBW.counter--;
                pendingBW.loopDelay = pendingBW.loopDelay || e.loopDelay;
            }
        },
        /**
         *
         * @param pubListener
         * @param threadId
         * @param loopDelay
         * @private
         */
        _notifyPublisher: function (pubListener, threadId, loopDelay) {
            pubListener.handler.call(pubListener.scope, { id: threadId, loopDelay: loopDelay });
        },
    });

    return BroadcastManager;
})();

