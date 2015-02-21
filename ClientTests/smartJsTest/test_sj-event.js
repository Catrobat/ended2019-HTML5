/// <reference path="../../client/smartJs/sj.js" />
/// <reference path="../../client/smartJs/sj-error.js" />
/// <reference path="../../client/smartJs/sj-core.js" />
/// <reference path="../../client/smartJs/sj-event.js" />
/// <reference path="../qunit/qunit-1.16.0.js" />
'use strict';

QUnit.module("sj-event.js");

QUnit.test("SmartJs.Event.EventListener", function (assert) {

	var hdl = function (e) { clicked = true; count++; eventArgs = e; };
	var x = new SmartJs.Event.EventListener(hdl, this);
	assert.ok(x.handler === hdl && x.scope === this, "handler created and properties set correctly");

	assert.ok(x instanceof SmartJs.Event.EventListener, "instance check");

	assert.throws(function () { x = new SmartJs.Event.EventListener(); },
		Error,
		"ERROR missing arguments");

	assert.throws(function () { x = new SmartJs.Event.EventListener("asd"); },
		Error,
		"ERROR invalid handler argument");

	assert.throws(function () { x = new SmartJs.Event.EventListener(hdl, "asd"); },
		Error,
		"ERROR invalid scope argument");

});


QUnit.test("SmartJs.Event.Event", function (assert) {
	
	var e = new SmartJs.Event.Event(new SmartJs.Core.Component());
	assert.ok(e instanceof SmartJs.Event.Event, "instance check");
	assert.ok(e instanceof SmartJs.Core.Component, "instance inheritance check");
	assert.equal(e.objClassName, "Event", "objClassName check");

	var ns = {};
	ns.Y = (function () {
		Y.extends(SmartJs.Core.EventTarget);

		function Y() {
			this._dom = document.getElementById("eventTargetTestDiv");
			this.clicked = false;
			
			this._divClicked = new SmartJs.Event.Event(this);
		}

		//tested with public property this.divClicked first and renamed the property to get a readOnly Event 
		Object.defineProperties(Y.prototype, {
			divClicked: {
				get: function () { return this._divClicked },
				//value: function () { return this._divClicked }(),
				//writable: false,
				enumerable: false,
				configurable: true,
			},
		});
		Y.prototype.merge({
			_clickHandler: function (e) { this.clicked = true; },
			add: function () { return this._addDomListener(this._dom, "click", this._clickHandler); },
			remove: function (handler) { this._removeDomListener(this._dom, "click", handler); },
			testArgsAndTarget: function () { this.divClicked.dispatchEvent({caller: "testTarget"}, this); },
		});
		return Y;
	})();

	var clicked = false;
	var count = 0, eventArgs = undefined;

	var hdl = function (e) { clicked = true; count++; eventArgs = e;};
	var x = new SmartJs.Event.EventListener(hdl, this);
	var x2 = new SmartJs.Event.EventListener(hdl, this);

	var y = new ns.Y();
	var result = y.divClicked.addEventListener(new SmartJs.Event.EventListener(hdl));
	assert.ok(result, "listener added: return value");
	y.divClicked.dispatchEvent();
	assert.ok(clicked, "listener added and dispatched- minimal parameter");

	var clicked = false;
	result = y.divClicked.removeEventListener(new SmartJs.Event.EventListener(hdl));
	assert.ok(result, "listener removed: return value");
	y.divClicked.dispatchEvent();
	assert.equal(clicked, false, "listener removed correctly");

	count = 0;
	result = y.divClicked.addEventListener(x);
	var result2nd = y.divClicked.addEventListener(x);
	assert.ok(result && !result2nd, "listener not added twice: return value");
	y.divClicked.dispatchEvent();
	assert.equal(count, 1, "listener added only once & dispatched using scope");
	assert.ok(!y.divClicked.addEventListener(x2), "same listener but different instance not added twice");

	result = y.divClicked.removeEventListener(new SmartJs.Event.EventListener(hdl, { asd: "asd" }));    //pseudo scope
	assert.ok(result == false, "listener removed: unknown listener");


	//check listener including scope
	var testObject = { x: 1, handler: function () { return true; } };
	count = 0;
	y = new ns.Y();
	result = y.divClicked.addEventListener(new SmartJs.Event.EventListener(hdl));
	result2nd = y.divClicked.addEventListener(new SmartJs.Event.EventListener(hdl));
	assert.ok(result && !result2nd, "listener not added twice: other listeners but same handlers and scope");

	y = new ns.Y();
	result = y.divClicked.addEventListener(new SmartJs.Event.EventListener(hdl));
	result2nd = y.divClicked.addEventListener(new SmartJs.Event.EventListener(hdl, testObject));
	assert.ok(result && result2nd, "listener added twice: other listeners with same handler and different scope");
	assert.equal(y.divClicked._listeners.length, 2, "registered twice in listener array");

	testObject._disposed = true;
	y.divClicked.dispatchEvent();
	assert.equal(y.divClicked._listeners.length, 1, "delete disposed item during dispatch");

	count = 0;
	y = new ns.Y();
	y.divClicked.addEventListener(x);
	eventArgs = undefined;
	y.testArgsAndTarget();
	assert.equal(count, 1, "dispatch using args and target");
	assert.equal(eventArgs.target, y, "dispatch using target as event args property");
	assert.equal(eventArgs.caller, "testTarget", "event args passed correctly");

	x2 = new SmartJs.Event.EventListener(function () { var x = 1; }, this);
	assert.ok(y.divClicked.addEventListener(x2), "2nd listner added correctly + return value");
	assert.ok(y.divClicked.removeEventListener(x) && y.divClicked.removeEventListener(x2), "listners removed correctly + return values");

	y = new ns.Y();
	var z = new ns.Y();
	var returnVal = undefined;
	eventArgs = undefined;
	z.testProp_1 = { t: 23, u: "asd" };
	z.testHandler = function (e) { returnVal = this.testProp_1; eventArgs = e; };
	y.divClicked.addEventListener(new SmartJs.Event.EventListener(z.testHandler, z));
	y.divClicked.dispatchEvent({ a: 1, b: 2, c: 3 });
	assert.deepEqual(z.testProp_1, returnVal, "calling handler using different scope");
	assert.deepEqual(eventArgs, { a: 1, b: 2, c: 3, bubbles: false, target: y }, "calling handler using different scope & event args");
	
	assert.throws(function () { var test = new SmartJs.Event.Event(23); },
		Error,
		"ERROR invalid constructor argument: target");

	assert.throws(function () { y.divClicked.addEventListener("asd"); },
		Error,
		"ERROR add invalid argument: listener");

	assert.throws(function () { y.divClicked.removeEventListener(23); },
		Error,
		"ERROR remove invalid argument: listener");

	assert.throws(function () { y.divClicked.dispatchEvent(23); },
		Error,
		"ERROR dispatch invalid argument: args");

	assert.throws(function () { y.divClicked.dispatchEvent({ a: 23 }, "asd"); },
		Error,
		"ERROR dispatch invalid argument: target");

	assert.throws(function () { y.divClicked.dispatchEvent({ a: 23 }, this, 23); },
		Error,
		"ERROR dispatch invalid argument: bubbles");

});


