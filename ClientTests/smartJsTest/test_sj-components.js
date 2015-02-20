/// <reference path="../../client/smartJs/sj.js" />
/// <reference path="../../client/smartJs/sj-error.js" />
/// <reference path="../../client/smartJs/sj-core.js" />
/// <reference path="../../client/smartJs/sj-event.js" />
/// <reference path="../../client/smartJs/sj-components.js" />
/// <reference path="../qunit/qunit-1.16.0.js" />
'use strict';

QUnit.module("sj-components.js");

QUnit.test("SmartJs.Components.Timer", function (assert) {

	assert.expect(7);   //init async asserts (to wait for)
	var done1 = assert.async();
	var done2 = assert.async();
	var done3 = assert.async();
	var done4 = assert.async();
	var done5 = assert.async();
	var done6 = assert.async();
	var done7 = assert.async();

	
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

	var t = new SmartJs.Components.Timer(new SmartJs.Event.EventListener(testHandler1, this), 800);

	t = new SmartJs.Components.Timer(new SmartJs.Event.EventListener(testHandler2, this), 500);

	var i = new SmartJs.Components.Timer(new SmartJs.Event.EventListener(testHandler3, this), 0);
	
	//test: pause & resume
	var start = new Date();
	var testFinished = false;
	var pauseCount = 0, resumeCount = 0;
	
	var testHandler4 = function () {
		testFinished = true;
		assert.ok(pauseCount == 4 && resumeCount == 4, "pause resume");
		done4();

		var time = 1400 + 4 * 300;
		assert.ok((new Date() - start) >= (time - 100) && (new Date() - start) <= (time + 100), "pause resume: total time = 2600 ms +/- 100ms");
		done5();
		//console.log("pauseCount: " + pauseCount + ", resumeCount: " + resumeCount);
		//console.log("finished after: " + (new Date() - start));
	};
	var p = new SmartJs.Components.Timer(new SmartJs.Event.EventListener(testHandler4, this), 1400);

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
	//done6();
	var testHandler6 = function (e) {
		assert.ok(e.threadId === 25, "callback with constructor argument");
		done6();
	};

	var p1 = new SmartJs.Components.Timer(new SmartJs.Event.EventListener(testHandler6, this), 20, { threadId: 25 });

	//stop start
	var testHandler7 = function (e) {   //this funciton should never be called due to stop()
		assert.ok(false, "stop timer: handler called");
	};

	p1 = new SmartJs.Components.Timer(new SmartJs.Event.EventListener(testHandler7, this), 20, { threadId: 25 });
	p1.stop();

	assert.ok(true, "stop timer: see handler called message if timer was stopped"); //^^ test will fail if handler is called
	done7();
});