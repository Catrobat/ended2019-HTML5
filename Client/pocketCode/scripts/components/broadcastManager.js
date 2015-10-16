/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
'use strict';
/**
 * @fileOverview broadcastManager: This file contains the whole functionality of the broadcast manager
 * @author catrobat HTML5 team
 *
 */

/**
 * @class BroadcastManager
 * The broadcast manager is responsible for keeping track of all broadcasts which are either registered
 * by a broadcastBrick or a broadcastAndWaitBrick. Moreover it handles the notification of listening bricks
 * e.g. receiveBrick
 */
PocketCode.BroadcastManager = (function () {
    /**
     *  Constructor of the BroadcastManager which takes a list of broadcasts that emerged from parsing the application
     *  and then calls the initialisation method "init(list of broadcasts)"
     * @param broadcasts: list of broadcasts that emerged from parsing the application. Each entry is a tuple of [id, name]
     */
    function BroadcastManager(broadcasts) {
        this.init(broadcasts);
    }

    //methods

    /**
     * merge method
     */
    BroadcastManager.prototype.merge({
        /**
         * Initialization method which takes the tuple list of broadcasts and creates a subscription list where
         * each id is a tuple entry without subscriber. Pending broadcastWait list is also cleared.
         * @param {List} broadcasts: tuple list of broadcast [id,name]
         */
        init: function (broadcasts) {
            this._pendingBW = {};

            this._subscriptions = {};
            for (var i = 0, l = broadcasts.length; i < l; i++) {
                this._subscriptions[broadcasts[i].id] = [];
            }
        },
        /**
         * Stop method clears all pending ops
         */
        stop: function () {
            this._pendingBW = {};
        },
        /**
         * Subscribe method is responsible for attaching a given listener to a given broadcastID within the
         * subscription list
         * @param {String} bcId: given broadcastID as a String
         * @param {SmartJs.Event.EventListener} listener: Listener of type SmartJs.Event.EventListener
         * @throws {Error} invalid argument: when type of listener is not SmartJs.Event.EventListener
         * @throws {Error} invalid argument: when type of bcId is not String
         * @throws {Error} invalid argument: when bcId is unknown
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
         * If publish() is called with just the bcId parameter e.g. publish(bcId) default broadcasting handling is initiated.
         * call() method is performed on the handler of each given subscriber within the subListener scope
         *
         * Otherwise a pubListener and threadId has to be given for a broadcastWait handling. the method handleBroadcastWait
         * ist called
         * @param {String} bcId: broadcast ID is required to call the method
         * @param {SmartJs.Event.EventListener} pubListener: Is optional for default broadcast handling, necessary for
         *                                                   broadcastWait handling
         * @param {String} threadId: Is optional for default broadcast handling, necessary for broadcastWait handling
         * @throws {Error} invalid argument: when type of listener is not SmartJs.Event.EventListener
         * @throws {Error} invalid argument: when type of bcId is not String
         * @throws {Error} invalid argument: when bcId is unknown
         * @throws {Error} invalid argument: when threadId is not given
         */
        publish: function (bcId, pubListener, threadId) {
            if (typeof bcId !== 'string' || !this._subscriptions[bcId])
                throw new Error('invalid argument: broadcast id not found');
            if (pubListener && !(pubListener instanceof SmartJs.Event.EventListener))
                throw new Error('invalid argument: event listener');
            if (pubListener && !threadId)
                throw new Error('invalid argument: threadId: a thread id is required for broadcastWait calls');

            if (pubListener)
                this._handleBroadcastWait(bcId, pubListener, threadId);
            else {
                var subs = this._subscriptions[bcId],
                    subListener;
                for (var i = 0, l = subs.length; i < l; i++) {
                    subListener = subs[i];
                    //delete disposed or missing objects
                    if (!subListener || !subListener.handler || (subListener.scope && subListener.scope._disposed)) {
                        subs.splice(i, 1);
                        l--;
                        i--;
                        continue;
                    }

                    //subListener.handler.call(subListener.scope, {});
                    setTimeout(subListener.handler.bind(subListener.scope, {}), 1);    //preventing the call stack from overflow
                }
            }
        },
        /**
         * private method handleBroadcastWait handles broadcastWait calls. If there are no subscriber for the given broadcast ID
         * (bcId) the publisher is notified, otherwise a new pending broadcastWait entry indicated by a uniquely generated thread ID
         * is created. callId, bcId, subscriberCounter, pubListener and loopDelay is added to that entry as well. Then event
         * is added to the brick to get return value and brick handler is called with scope and new
         * EventListener(brickExecutedHanlder,this)
         * @param {String} bcId: broadcast ID
         * @param {SmartJs.Event.EventListener} pubListener: publish listener
         * @param {String} callId: keeps track if already called
         * @throws {Error} invalid argument: when type of listener is not SmartJs.Event.EventListener
         * @private
         */
        _handleBroadcastWait: function (bcId, pubListener, callId) {
            var subs = this._subscriptions[bcId];
            var subsCount = subs.length;

            if (subsCount > 0) {
                var threadId = SmartJs.getNewId() ;
                this._pendingBW[threadId] = { callId: callId, broadcastId: bcId, counter: subsCount, listener: pubListener, loopDelay: false };
                for (var i = 0; i < subsCount; i++) {
                    var subListener = subs[i];
                    subListener.handler.call(subListener.scope, { id: threadId, listener: new SmartJs.Event.EventListener(this._brickExecutedHandler, this) });
                }
            }
            else
                this._notifyPublisher(pubListener, callId);
        },
        /**
         * Gets called whenever a brick is executed and removes the broadcast from the pending broadcastWait list when
         * last entry is reached
         * @param e
         * @private
         */
        _brickExecutedHandler: function (e) {
            var pendingBW = this._pendingBW[e.id];
            if (!pendingBW)
                return;
            else if (pendingBW.counter === 1) {
                var callId = pendingBW.callId;
                var pubListener = pendingBW.listener;
                var loopDelay = pendingBW.loopDelay || e.loopDelay;
                delete this._pendingBW[e.id];
                this._notifyPublisher(pubListener, callId, loopDelay);
            }
            else {
                pendingBW.counter--;
                pendingBW.loopDelay = pendingBW.loopDelay || e.loopDelay;
            }
        },
        /**
         * Notifies the publisher and calls the handler with the scope of the given pubListener
         * @param {SmartJs.Event.EventListener} pubListener
         * @param {String} threadId
         * @param {number} loopDelay
         * @private
         */
        _notifyPublisher: function (pubListener, callId, loopDelay) {
            pubListener.handler.call(pubListener.scope, { id: callId, loopDelay: loopDelay });
        },
    });

    return BroadcastManager;
})();

