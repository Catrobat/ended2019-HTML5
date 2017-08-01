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
        subscribe: function (id, callback) {
            if (typeof id !== 'string')
                throw new Error('invalid argument: message id, expected type: string');
            if (typeof callback !== 'function')
                throw new Error('invalid argument: subscription callback, expected type: function');

            this._subscriptions[id] || (this._subscriptions[id] = []);
            this._subscriptions[id].push(callback);
        },
        unsubscribe: function (id, callback) {
            if (typeof id !== 'string')
                throw new Error('invalid argument: message id, expected type: string');
            if (typeof callback !== 'function')
                throw new Error('invalid argument: subscription callback, expected type: function');

            var subs = this._subscriptions[id];
            if (subs && subs instanceof Array)
                subs.remove(callback);
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

            var callback,
                execTime = new Date();
            if (waitCallback) {
                var pid = SmartJs.getNewId(),
                    po = this._pendingOps[pid] = { msgId: id, count: 0, waitCallback: waitCallback, loopDelay: false };
                for (var i = 0, l = subs.length; i < l; i++) {
                    po.count++;
                    callback = subs[i];
                    window.setTimeout(callback.bind(this, execTime, this._scriptExecutedCallback.bind(this), pid), 0);
                    //callback(execTime, this._scriptExecutedCallback.bind(this), pid);
                }
            }
            else {
                for (var i = 0, l = subs.length; i < l; i++) {
                    callback = subs[i];
                    window.setTimeout(callback.bind(this, execTime), 0);
                    //callback(execTime);
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
        subscribe: function (bcId, callback) {
            if (!this._subscriptions[bcId])
                throw new Error('invalid argument: invalid (unknown) broadcast id');

            PocketCode.PublishSubscribeBroker.prototype.subscribe.call(this, bcId, callback);
        },
        publish: function (bcId, waitCallback) {
            if (!this._subscriptions[bcId])
                throw new Error('invalid argument: invalid (unknown) broadcast id');

            PocketCode.PublishSubscribeBroker.prototype.publish.call(this, bcId, waitCallback);
        },
    });

    return BroadcastManager;
})();
