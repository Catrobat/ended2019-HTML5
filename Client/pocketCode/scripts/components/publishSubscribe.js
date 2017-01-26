/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
'use strict';


PocketCode.PublishSubscribeBroker = (function () {

    function PublishSubscribeBroker() {
        this._subscriptions = {};
        this._pendingOps = {};
    }

    //methods
    PublishSubscribeBroker.prototype.merge({
        subscribe: function (id, handler) {
            if (typeof id !== 'string')
                throw new Error('invalid argument: broadcast id, expected type: string');
            if (typeof handler !== 'function')
                throw new Error('invalid argument: subscription handler, expected type: function');

            this._subscriptions[id].push(handler);
        },
        //TODO
    });

    return PublishSubscribeBroker;
})();


PocketCode.BroadcastManager = (function () {
    BroadcastManager.extends(PocketCode.PublishSubscribeBroker, false);

    function BroadcastManager(broadcasts) {
        PocketCode.PublishSubscribeBroker.call(this);

        this.init(broadcasts);
    }

    //methods
    BroadcastManager.prototype.merge({
        init: function (broadcasts) {
            this._pendingOps = {};

            this._subscriptions = {};
            for (var i = 0, l = broadcasts.length; i < l; i++) {
                this._subscriptions[broadcasts[i].id] = [];
            }
        },
        subscribe: function (bcId, handler) {
            if (!this._subscriptions[bcId])
                throw new Error('invalid argument: invalid (unknown) broadcast id');

            PocketCode.PublishSubscribeBroker.prototype.subscribe.call(this, bcId, handler);
        },
        publish: function (bcId, waitCallback) {//, threadId) {
            if (typeof bcId !== 'string' || !this._subscriptions[bcId])
                throw new Error('invalid argument: broadcast id not found');
            if (waitCallback && typeof waitCallback !== 'function')//!(waitCallback instanceof SmartJs.Event.EventListener))
                throw new Error('invalid argument: publish callback');
            //if (waitCallback && !threadId)
            //    throw new Error('invalid argument: threadId: a thread id is required for broadcastWait calls');

            //this._stopped = false;
            var subs = this._subscriptions[bcId];
            if (!subs || subs.length == 0) {
                if (waitCallback)
                    waitCallback(false);
                return;
            }

            var po; //stop running tasks with same broadcast id
            for (var id in this._pendingOps) {
                po = this._pendingOps[id];
                if (po.broadcastId == bcId) {
                    delete this._pendingOps[id];
                    break;
                }
            }

            var handler;
            if (waitCallback) {
                //},
                //_handleBroadcastWait: function (bcId, waitCallback) {//, callId) {
                //var subs = this._subscriptions[bcId];
                //for (var i = 0, l = subs.length; i < l; i++) {
                //    handler = subs[i];

                //    //if (this._stopped)
                //    //    break;
                //    subListener = subs[i];
                //    //delete disposed or missing objects
                //    if (!subListener || !subListener.handler || !subListener.scope || subListener.scope._disposed) {
                //        subs.splice(i, 1);
                //        l--;
                //        i--;
                //        continue;
                //    }
                //}

                //var subsCount = subs.length;
                //if (subsCount > 0) {
                    var id = SmartJs.getNewId(),
                        po = this._pendingOps[id] = { /*callId: callId,*/ broadcastId: bcId, count: 0, waitCallback: waitCallback, loopDelay: false };
                    for (var i = 0, l = subs.length; i < l; i++) {
                        po.count++;
                        handler = subs[i];
                        window.setTimeout(handler.bind(this, new Date(), new SmartJs.Event.EventListener(this._scriptExecutedCallback, this), id), 1);
                        //var subListener = subs[i];
                        //subListener.handler.call(subListener.scope, { id: threadId, listener: new SmartJs.Event.EventListener(this._brickExecutedHandler, this) });
                        //setTimeout(subListener.handler.bind(subListener.scope, new SmartJs.Event.EventListener(this._brickExecutedHandler.bind(this, threadId), this)), 0);//{ id: threadId, listener: new SmartJs.Event.EventListener(this._brickExecutedHandler, this) }), 0);
                    }
                //}
                //else
                //    waitCallback(false);
                //this._notifyPublisher(waitCallback, false);//, callId);
            }
            else {
                for (var i = 0, l = subs.length; i < l; i++) {
                    handler = subs[i];
                    //window.setTimeout(handler, 0);    //preventing the internal call stack (_pendingOps) from overflow on recursive calls
                    window.setTimeout(handler.bind(this, new Date()), 1);
                }
                //{
                //    if (this._stopped)
                //        break;
                //    subListener = subs[i];
                //    //delete disposed or missing objects
                //    if (!subListener || !subListener.handler || (subListener.scope && subListener.scope._disposed)) {
                //        subs.splice(i, 1);
                //        l--;
                //        i--;
                //        continue;
                //    }

                //    subListener.handler.call(subListener.scope, {});
                //    //setTimeout(subListener.handler.bind(subListener.scope, {}), 0);    //preventing the call stack from overflow
                //}
            }
        },
        _scriptExecutedCallback: function (e) { //{ id: threadId, loopDelay: loopD }
            var po = this._pendingOps[e.id];
            if (!po) //stopped
                return;

            po.count--;
            po.loopDelay = po.loopDelay || e.loopDelay;

            if (po.count == 0) {
                //var callId = po.callId;
                //var waitCallback = po.waitCallback;
                //var loopDelay = po.loopDelay || e.loopDelay;
                delete this._pendingOps[threadId];
                //this._notifyPublisher(waitCallback, /*callId,*/ loopDelay);
                po.waitCallback(po.loopDelay);
            }
            //else {
            //    po.count--;
            //    po.loopDelay = po.loopDelay || e.loopDelay;
            //}
        },
        //_notifyPublisher: function (waitCallback, /*callId,*/ loopDelay) {
        //    waitCallback.handler.call(waitCallback.scope, loopDelay); //{ id: callId, loopDelay: loopDelay });
        //},
        //stop: function () {
        //    this._stopped = true;
        //    this._pendingOps = {};
        //},
    });

    return BroadcastManager;
})();

