/// <reference path="../qunit/qunit-1.16.0.js" />
/// <reference path="../../client/smartJs/sj.js" />
/// <reference path="../../client/smartJs/sj-error.js" />
/// <reference path="../../client/smartJs/sj-core.js" />
/// <reference path="../../client/smartJs/sj-event.js" />
/// <reference path="../../client/smartJs/sj-components.js" />
'use strict';

QUnit.module("sj-components.js");

QUnit.test("SmartJs.Components.Application", function (assert) {

	var app = new SmartJs.Components.Application();
	assert.ok(app instanceof SmartJs.Components.Application && app instanceof SmartJs.Core.EventTarget, "instance + inheritance check");
	assert.ok(app.objClassName === "Application", "objClassName check");

	//TODO: assert.ok(app.onConnectionStatusChange instanceof SmartJs.Event.Event, "onConnectionStatusChange event");

	var lastEvent;
	var onConnectionStatusChangeHandler = function (e) {
		lastEvent = e;
	};
	//TODO: app.onConnectionStatusChange.addEventListener(new SmartJs.Event.EventListener(onConnectionStatusChangeHandler, this));
	//simulate events
	//app._offlineHandler();
	//assert.equal(app._online, false, "check offline");
	//assert.equal(lastEvent.online, false, "check event arguments");

	//app._onlineHandler();
	//assert.equal(app._online, true, "check online");
	//assert.equal(lastEvent.online, true, "check event argument: online");

	try {
		app.dispose();
	}
	catch(e) {
		assert.ok(false, "calling dispose");
		return;
	}
	assert.ok(true, "calling dispose");
	assert.equal(app._disposed, true, "disposed correctly");
});


QUnit.test("SmartJs.Components.Timer", function (assert) {

	//assert.expect(15);   //init async asserts (to wait for)
	var done1 = assert.async();
	var done2 = assert.async();
	var done3 = assert.async();
	var done4 = assert.async();
	var done5 = assert.async();
	var done6 = assert.async();
	var done7 = assert.async();
	var done8 = assert.async();
	//added tests after changing constructor and adding remainingTime
	var done9 = assert.async();
	var done10 = assert.async();
	//var done11 = assert.async();

	
	var testHandler1 = function () {
		assert.ok(true, "constructor + event dispatched");
		done1();
	};
	var testHandler2 = function () {
		assert.ok(true, "oveerride instance while running");
		done2();
	};
	var testHandler3 = function () {
		assert.ok(true, "timeout = 0ms");
		done3();
	};

	var t = new SmartJs.Components.Timer(800, new SmartJs.Event.EventListener(testHandler1, this), true);
	assert.ok(t instanceof SmartJs.Components.Timer, "instance check");

	t = new SmartJs.Components.Timer(500, new SmartJs.Event.EventListener(testHandler2, this), true);

	var i = new SmartJs.Components.Timer(0, new SmartJs.Event.EventListener(testHandler3, this), true);
	
	//test: pause & resume
	var start = new Date();
	var testFinished = false;
	var pauseCount = 0, resumeCount = 0;
	
	var testHandler4 = function () {
		testFinished = true;
		assert.equal(pauseCount, 4, "pause");
		done4();
		assert.equal(resumeCount, 4, "resume");
		done5();

		var time = 1400 + 4 * 300;
		assert.ok((new Date() - start) >= (time - 100) && (new Date() - start) <= (time + 100), "pause resume: total time (" + (new Date() - start) + "ms) == 2600 ms +/- 100ms");
		done6();
		//console.log("pauseCount: " + pauseCount + ", resumeCount: " + resumeCount);
		//console.log("finished after: " + (new Date() - start));
	};
	var p = new SmartJs.Components.Timer(1400, new SmartJs.Event.EventListener(testHandler4, this), true);

	var pauseHandler = function () {
		//console.log("pause after: " + (new Date() - start));
		if (testFinished)
			return;
		p.pause();
		pauseCount++;
		var t = window.setTimeout(resumeHandler, 300);//*0.96);
	};
	var resumeHandler = function () {
		//console.log("resume after: " + (new Date() - start));
		if (testFinished)
			return;
		p.resume();
		resumeCount++;
		var t = window.setTimeout(pauseHandler, 300);// * 0.96);
	};
	var t = window.setTimeout(pauseHandler, 300);// * 0.96);


	//argument callback argmument
	//assert.ok(true, "test");
	//done7();
	var testHandler6 = function (e) {
		assert.ok(e.threadId === 25, "callback with constructor argument");
		done7();
	};

	var p1 = new SmartJs.Components.Timer(20, new SmartJs.Event.EventListener(testHandler6, this), true, { threadId: 25 });

	//stop start
	var testHandler7 = function (e) {   //this funciton should never be called due to stop()
		assert.ok(false, "stop timer: handler called");
	};

	p1 = new SmartJs.Components.Timer(20, new SmartJs.Event.EventListener(testHandler7, this), true, { threadId: 25 });
	p1.stop();

	assert.ok(true, "stop timer: see handler called message if timer was stopped"); //^^ test will fail if handler is called
	done8();

	//after changing ctr & adding remainingTime
	var testHandler9 = function (e) {
		assert.equal(e.target, p9, "event attached and dispatched: event args target check");
		done9();
	};

	var p9 = new SmartJs.Components.Timer(20);
	p9.onExpire.addEventListener(new SmartJs.Event.EventListener(testHandler9, this));

	p9.start();
	var remainingRunning = p9.remainingTime;
	//console.log(remainingRunning);
	p9.pause();
	var remaining = p9.remainingTime;
	//console.log(remaining);
	assert.ok(remainingRunning >= remaining, "remaining at runtime");
	assert.ok(remaining >= 0 && remaining <= 20, "reamining timer on pause");
	p9.pause();
	assert.equal(remaining, p9.remainingTime, "timer change when pause() is calaled more than once");
	p9.resume();
	p9.resume();

	var p10 = new SmartJs.Components.Timer(30);
	var testHandler10 = function (e) {
		var diff = new Date() - startTime;
		assert.ok(diff >= 40, diff + " >= 25, check pause time part of full time");
		done10();
	};
	p10.onExpire.removeEventListener(new SmartJs.Event.EventListener(testHandler9, this));
	p10.onExpire.addEventListener(new SmartJs.Event.EventListener(testHandler10, this));

	var restart = function () {
		assert.ok(remainingRunning <= 19, remainingRunning + " <= 12, test paused timer remaining time");
		window.setTimeout(function () { p10.resume(); }, 10);
	};

	var startTime = new Date();
	p10.start();
	window.setTimeout(function () { remainingRunning = p10.remainingTime; p10.pause(); restart(); }, 15);

	//done11();


});