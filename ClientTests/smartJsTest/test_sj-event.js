/// <reference path="../../client/smartJs/sj.js" />
/// <reference path="../../client/smartJs/sj-error.js" />
/// <reference path="../../client/smartJs/sj-core.js" />
/// <reference path="../../client/smartJs/sj-event.js" />
/// <reference path="../qunit/qunit-2.4.0.js" />
'use strict';

QUnit.module("sj-event.js");

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
				//enumerable: false,
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

	assert.ok(!y.divClicked.listenersAttached, 'listeners attached: init');
	var result = y.divClicked.addEventListener(new SmartJs.Event.EventListener(hdl));
	assert.ok(result, "listener added: return value");
	assert.ok(y.divClicked.listenersAttached, 'listeners attached: added');
	y.divClicked.dispatchEvent();
	assert.ok(clicked, "listener added and dispatched- minimal parameter");

	var clicked = false;
	//simulate disposed
	y.divClicked._disposed = true;
	result = y.divClicked.removeEventListener(new SmartJs.Event.EventListener(hdl));
	assert.ok(!result, "listener removed: disposed event");
	y.divClicked._disposed = undefined;

	result = y.divClicked.removeEventListener(new SmartJs.Event.EventListener(hdl));
	assert.ok(result, "listener removed: return value");
	assert.ok(!y.divClicked.listenersAttached, 'listeners attached: removed');
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
	assert.ok(Math.abs(eventArgs.dispatchedAt - Date.now()) < 10, "including dispatchedAt");
	delete eventArgs.dispatchedAt;
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

	//remove listener at runtime: (invalid) !item || !item.handler || (item.scope && item.scope._disposed)
	y = new ns.Y();
	var pseudoScope = {};
	var h1called = 0,
		h2called = 0,
		h3called = 0,
		h4called = 0;

	var testHandler1 = function (e) {
		h1called++;
	};
	var testHandler2 = function (e) {
		h2called++;
	};
	var testHandler3 = function (e) {
		h3called++;
	};
	var testHandler4 = function (e) {
		h4called++;
	};

	y.divClicked.addEventListener(new SmartJs.Event.EventListener(testHandler1, this));
	var h2 = new SmartJs.Event.EventListener(testHandler2, this);
	y.divClicked.addEventListener(h2);
	//h2 = undefined;
	y.divClicked._listeners[1] = undefined;

	y.divClicked.addEventListener(new SmartJs.Event.EventListener(testHandler3, pseudoScope));
	pseudoScope._disposed = true;
	y.divClicked.addEventListener(new SmartJs.Event.EventListener(testHandler4, this));

	//testHandler2 = undefined;
	y.divClicked.dispatchEvent({ a: 1, b: 2, c: 3 });

	assert.equal(y.divClicked._listeners.length, 2, "listener removed during dispatch");
	assert.ok(h1called === 1 && h2called === 0 && h3called === 0 && h4called === 1, h1called + ", " + h2called + ", " + h3called + ", " + h4called + ", " + "only valid handler called once");
});


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


QUnit.test("SmartJs.Event.AsyncEventListener", function (assert) {

	assert.expect(6);   //init async asserts (to wait for)
	var done1 = assert.async();
	var done2 = assert.async();

	var hdl = function (e) {
	    assert.ok(true, "async handler 1 called");
	    assert.ok(e.dispatchedAt > Date.now() - 10 && e.dispatchedAt <= Date.now(), "event including dispatchedAt property");
		done1();
	};
	var hdl2 = function (e) {
		assert.ok(true, "async handler 2 called");
		done2();
	};
	var x = new SmartJs.Event.AsyncEventListener(hdl, this);
	assert.ok(x.handler === hdl && x.scope === this, "handler created and properties set correctly");

	assert.ok(x instanceof SmartJs.Event.AsyncEventListener, "instance check");
	assert.ok(x instanceof SmartJs.Event.EventListener, "instance inheritance check");

	var e = new SmartJs.Event.Event(this);
	e.addEventListener(x);
	e.addEventListener(new SmartJs.Event.AsyncEventListener(hdl2));
	e.dispatchEvent();
});

