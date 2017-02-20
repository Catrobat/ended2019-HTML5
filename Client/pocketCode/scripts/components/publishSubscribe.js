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
                throw new Error('invalid argument: message id, expected type: string');
            if (typeof handler !== 'function')
                throw new Error('invalid argument: subscription handler, expected type: function');

            this._subscriptions[id] || (this._subscriptions[id] = []);
            this._subscriptions[id].push(handler);
        },
        unsubscribe: function (id, handler) {
            if (typeof id !== 'string')
                throw new Error('invalid argument: message id, expected type: string');
            if (typeof handler !== 'function')
                throw new Error('invalid argument: subscription handler, expected type: function');

            var subs = this._subscriptions[id];
            if (subs && subs instanceof Array)
                subs.remove(handler);
        },
        publish: function (id, waitCallback) {//, threadId) {
            if (typeof id !== 'string')
                throw new Error('invalid argument: message id not found');
            if (waitCallback && typeof waitCallback !== 'function')
                throw new Error('invalid argument: publish callback');

            //handle unknown messages or empty subscription list
            var subs = this._subscriptions[id];
            if (!subs || subs.length == 0) {
                if (waitCallback)
                    waitCallback(false);
                return;
            }

            var po, //stop running tasks with same message id
                pid;
            for (pid in this._pendingOps) {
                po = this._pendingOps[pid];
                if (po.msgId == id) {
                    delete this._pendingOps[pid];
                    break;
                }
            }

            var handler;
            if (waitCallback) {
                var pid = SmartJs.getNewId(),
                    po = this._pendingOps[pid] = { msgId: id, count: 0, waitCallback: waitCallback, loopDelay: false };
                for (var i = 0, l = subs.length; i < l; i++) {
                    po.count++;
                    handler = subs[i];
                    window.setTimeout(handler.bind(this, new Date(), new SmartJs.Event.EventListener(this._scriptExecutedCallback, this), pid), 0);
                }
            }
            else {
                for (var i = 0, l = subs.length; i < l; i++) {
                    handler = subs[i];
                    window.setTimeout(handler.bind(this, new Date()), 0);
                }
            }
        },
        _scriptExecutedCallback: function (e) { //{ id: threadId, loopDelay: loopD }
            var po = this._pendingOps[e.id];
            if (!po) //stopped
                return;

            po.count--;
            po.loopDelay = po.loopDelay || e.loopDelay;

            if (po.count == 0) {
                delete this._pendingOps[e.id];
                po.waitCallback(po.loopDelay);
            }
        },
        dispose: function () {
            this._subscriptions = {};
            this._pendingOps = {};
        },
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
        publish: function (bcId, waitCallback) {
            if (!this._subscriptions[bcId])
                throw new Error('invalid argument: invalid (unknown) broadcast id');

            PocketCode.PublishSubscribeBroker.prototype.publish.call(this, bcId, waitCallback);
        },
    });

    return BroadcastManager;
})();
