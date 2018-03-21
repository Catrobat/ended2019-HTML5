/// <reference path="../qunit/qunit-2.4.0.js" />
/// <reference path="../../client/smartJs/sj.js" />
/// <reference path="../../client/smartJs/sj-error.js" />
/// <reference path="../../client/smartJs/sj-core.js" />
/// <reference path="../../client/smartJs/sj-event.js" />
/// <reference path="../../client/smartJs/sj-components.js" />
'use strict';

QUnit.module("sj-components.worker.js");

//tested in seperated file because code coverage does not work for injected methods
QUnit.test("SmartJs.Components.WebWorker", function (assert) {

    //test class used in the test cases below
    var TestClass = (function () {
        function TestClass(value) {
            this._value = value;
        }

        TestClass.prototype = {
            exec: function (value) {
                return value * this._value;
            },
            floor: function (value) {
                return Math.floor(value);
            },
            ceil: function (value) {
                return Math.ceil(value);
            },
            mult: function (value1, value2) {
                return this.floor(value1) * this.ceil(value2);
            },
            longRunningTask: function (value1, value2) {   //delayed on purpose
                for (var i = 0, l = 20000000; i < l; i++)
                    this.floor(value1) * this.ceil(value2)
                return this.floor(value1) * this.ceil(value2);
            },
        };

        return TestClass;
    })();

    var testInstance = new TestClass(3);
    assert.equal(testInstance.exec(2), 6, "TestClass check");

    //tests
    var worker = new SmartJs.Components.WebWorker(testInstance, testInstance.floor);

    assert.ok(worker instanceof SmartJs.Components.WebWorker && worker instanceof SmartJs.Core.EventTarget, "instance check");
    assert.ok(worker.onExecuted instanceof SmartJs.Event.Event && worker.onError instanceof SmartJs.Event.Event, "event check");
    assert.notOk(worker.isBusy, "isBusy initially set to false");

    assert.throws(function () { worker = new SmartJs.Components.WebWorker(1); }, Error, "ERROR: wrong scope");
    assert.throws(function () { worker = new SmartJs.Components.WebWorker(testInstance, 1); }, Error, "ERROR: wrong worker method");
    assert.throws(function () { worker = new SmartJs.Components.WebWorker(testInstance, testInstance.floor, 1); }, Error, "ERROR: helper methods object");
    assert.throws(function () { worker = new SmartJs.Components.WebWorker(testInstance, testInstance.floor, { a: 1 }); }, Error, "ERROR: helper method found");

    //create worker including helper methods to cover complete cntr
    worker = new SmartJs.Components.WebWorker(testInstance, testInstance.floor, { ceil: testInstance.floor });
    worker.dispose();
    assert.ok(worker._disposed, "dispose: using internal worker");

    var store_url = URL.createObjectURL;
    URL.createObjectURL = undefined;    //make sure the cntr throws error
    worker = new SmartJs.Components.WebWorker(testInstance, testInstance.floor, { ceil: testInstance.floor });//ERROR: window.Worker not supported (catched to use fallback)
    assert.equal(worker._worker, undefined, "internal worker not initialised on Error");
    worker.dispose();
    assert.ok(worker._disposed, "dispose: using fallback");

    URL.createObjectURL = store_url;    //restore
});


QUnit.test("SmartJs.Components.WebWorker: asynchronous (using worker)", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();

    //test class used in the test cases below
    var TestClass = (function () {
        function TestClass(value) {
            this._value = value;
        }

        TestClass.prototype = {
            exec: function (value) {
                return value * this._value;
            },
            floor: function (value) {
                return Math.floor(value);
            },
            ceil: function (value) {
                return Math.ceil(value);
            },
            mult: function (value1, value2) {
                return this.floor(value1) * this.ceil(value2);
            },
            longRunningTask: function (value1, value2) {   //delayed on purpose
                for (var i = 0, l = 20000000; i < l; i++)
                    this.floor(value1) * this.ceil(value2)
                return this.floor(value1) * this.ceil(value2);
            },
        };

        return TestClass;
    })();

    var testInstance = new TestClass(3);
    assert.equal(testInstance.exec(2), 6, "TestClass check");


    //simple test
    var worker = new SmartJs.Components.WebWorker(testInstance, testInstance.floor);

    var onExecutedHandler = function (e) {
        assert.equal(e.result, 4, "scope + method: simple test");
        assert.ok(e.async, "async set if executed using internal worker");
        done1();
    }
    worker.onExecuted.addEventListener(new SmartJs.Event.EventListener(onExecutedHandler, this));
    worker.execute(4.98765);

    //simple test
    var worker2 = new SmartJs.Components.WebWorker(testInstance, testInstance.mult, { floor: testInstance.floor, ceil: testInstance.ceil });

    var onExecutedHandler2 = function (e) {
        assert.equal(e.result, 25, "scope + method + helpers: simple test");
        done2();
    }
    worker2.onExecuted.addEventListener(new SmartJs.Event.EventListener(onExecutedHandler2, this));
    worker2.execute(5.98765, 4.001);

    //long running test
    var worker3 = new SmartJs.Components.WebWorker(testInstance, testInstance.longRunningTask, { floor: testInstance.floor, ceil: testInstance.ceil });
    var onExecutedHandler3 = function (e) {
        assert.equal(e.result, 25, "scope + method + helpers: simple test");
        assert.notOk(worker3.isBusy, "isBusy set to false after processing completed");
        done3();
    }
    worker3.onExecuted.addEventListener(new SmartJs.Event.EventListener(onExecutedHandler3, this));
    worker3.execute(5.98765, 4.001);

    assert.ok(worker3.isBusy, "isBusy set to true if currently processing");
    assert.throws(function () { worker3.execute(5.98765, 4.001); }, Error, "ERROR: try to call worker again while it is busy");


    assert.ok(false, "TODO");

});


QUnit.test("SmartJs.Components.WebWorker: synchronous (using fallback)", function (assert) {

    //test class used in the test cases below
    var TestClass = (function () {
        function TestClass(value) {
            this._value = value;
        }

        TestClass.prototype = {
            exec: function (value) {
                return value * this._value;
            },
            floor: function (value) {
                return Math.floor(value);
            },
            ceil: function (value) {
                return Math.ceil(value);
            },
            mult: function (value1, value2) {
                return this.floor(value1) * this.ceil(value2);
            },
            longRunningTask: function (value1, value2) {   //delayed on purpose
                for (var i = 0, l = 20000000; i < l; i++)
                    this.floor(value1) * this.ceil(value2)
                return this.floor(value1) * this.ceil(value2);
            },
        };

        return TestClass;
    })();

    var testInstance = new TestClass(3);
    assert.equal(testInstance.exec(2), 6, "TestClass check");


    //simple test
    var worker = new SmartJs.Components.WebWorker(testInstance, testInstance.floor);
    worker._worker = undefined; //override internal worker to force fallback execution

    assert.ok(worker instanceof SmartJs.Components.WebWorker && worker instanceof SmartJs.Core.EventTarget, "instance check");
    assert.ok(worker.onExecuted instanceof SmartJs.Event.Event && worker.onError instanceof SmartJs.Event.Event, "event check");
    assert.notOk(worker.isBusy, "isBusy initially set to false");

    var onExecutedHandler = function (e) {
        assert.equal(e.result, 4, "scope + method: simple test");
        assert.notOk(e.async, "async not set if executed using fallback implementation");
    }
    worker.onExecuted.addEventListener(new SmartJs.Event.EventListener(onExecutedHandler, this));
    worker.execute(4.98765);

    //simple test
    var worker2 = new SmartJs.Components.WebWorker(testInstance, testInstance.mult, { floor: testInstance.floor, ceil: testInstance.ceil });
    worker2._worker = undefined; //override internal worker to force fallback execution

    var onExecutedHandler2 = function (e) {
        assert.equal(e.result, 25, "scope + method + helpers: simple test");
    }
    worker2.onExecuted.addEventListener(new SmartJs.Event.EventListener(onExecutedHandler2, this));
    worker2.execute(5.98765, 4.001);

    //long running test
    var worker3 = new SmartJs.Components.WebWorker(testInstance, testInstance.longRunningTask, { floor: testInstance.floor, ceil: testInstance.ceil });
    worker3._worker = undefined; //override internal worker to force fallback execution

    var onExecutedHandler3 = function (e) {
        assert.equal(e.result, 25, "scope + method + helpers: simple test");
        assert.notOk(worker3.isBusy, "isBusy set to false after processing completed");
    }
    worker3.onExecuted.addEventListener(new SmartJs.Event.EventListener(onExecutedHandler3, this));
    worker3.execute(5.98765, 4.001);

    assert.notOk(worker3.isBusy, "isBusy set to false if synchronous processing");


    assert.ok(false, "TODO");

});

