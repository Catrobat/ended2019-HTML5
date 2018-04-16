/// <reference path="../qunit/qunit-2.4.0.js" />
/// <reference path="../../client/smartJs/sj.js" />
/// <reference path="../../client/smartJs/sj-error.js" />
/// <reference path="../../client/smartJs/sj-core.js" />
/// <reference path="../../client/smartJs/sj-event.js" />
/// <reference path="../../client/smartJs/sj-components.js" />
'use strict';

QUnit.module("sj-components.worker.js");

//tested in seperated file because code coverage does not work for injected methods
QUnit.test("SmartJs.Components.InlineWorker", function (assert) {

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
    var worker = new SmartJs.Components.InlineWorker(testInstance, testInstance.floor);

    assert.ok(worker instanceof SmartJs.Components.InlineWorker && worker instanceof SmartJs.Core.EventTarget, "instance check");
    assert.ok(worker.onExecuted instanceof SmartJs.Event.Event && worker.onError instanceof SmartJs.Event.Event, "event check");
    assert.notOk(worker.isBusy, "isBusy initially set to false");

    assert.throws(function () { worker = new SmartJs.Components.InlineWorker(1); }, Error, "ERROR: wrong scope");
    assert.throws(function () { worker = new SmartJs.Components.InlineWorker(testInstance, 1); }, Error, "ERROR: wrong worker method");
    assert.throws(function () { worker = new SmartJs.Components.InlineWorker(testInstance, testInstance.floor, 1); }, Error, "ERROR: helper methods object");
    assert.throws(function () { worker = new SmartJs.Components.InlineWorker(testInstance, testInstance.floor, function () { }); }, Error, "ERROR: helper method found");

    //create worker including helper methods to cover complete cntr
    worker = new SmartJs.Components.InlineWorker(testInstance, testInstance.floor, { ceil: testInstance.floor });
    worker.dispose();
    assert.ok(worker._disposed, "dispose: using internal worker");

    var store_url = URL.createObjectURL;
    URL.createObjectURL = undefined;    //make sure the cntr throws error
    worker = new SmartJs.Components.InlineWorker(testInstance, testInstance.floor, { ceil: testInstance.floor });//ERROR: window.Worker not supported (catched to use fallback)
    assert.equal(worker._worker, undefined, "internal worker not initialised on Error");
    worker.dispose();
    assert.ok(worker._disposed, "dispose: using fallback");
    assert.throws(function () { worker.execute(); }, Error, "ERROR: calling execute() on disposed worker");

    //recreate on complex objects
    worker = new SmartJs.Components.InlineWorker(testInstance, testInstance.floor, { bool: true, string: "string", fnc: testInstance.floor, number: 34, obj: { array: [1, "2", null], number: 45 } });

    URL.createObjectURL = store_url;    //restore
});


QUnit.test("SmartJs.Components.InlineWorker: asynchronous (using worker)", function (assert) {

    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();
    var done4 = assert.async();
    //var done5 = assert.async(); - currently disabled: see information below
    var done6 = assert.async();

    //test class used in the test cases below
    var ns1 = { ns2: "2", ns3: { array: [1, "2", null, 4], fnc: function (a, b) { return a * b; } } };
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
            objectTest: function () {
                return ns1.ns3.fnc(parseInt(ns1.ns2), ns1.ns3.array[3]);
            },
            longRunningTask: function (value1, value2) {   //delayed on purpose
                for (var i = 0, l = 20000000; i < l; i++)
                    this.floor(value1) * this.ceil(value2)
                return this.floor(value1) * this.ceil(value2);
            },
            throwError: function () {
                return this._exec();//throw new Error("custom error");
            },
        };

        return TestClass;
    })();

    var testInstance = new TestClass(3);
    assert.equal(testInstance.exec(2), 6, "TestClass check");

    var globalErrorHandler = function (e) {
            alert(e.message + ": make sure to NOT run this test (async Worker) using code coverage.");
        },
        globalErrorListener = new SmartJs.Event.EventListener(globalErrorHandler, this);

    //simple test
    var worker = new SmartJs.Components.InlineWorker(testInstance, testInstance.floor);

    var onExecutedHandler = function (e) {
        assert.equal(e.result, 4, "scope + method: simple test");
        assert.ok(e.async, "async set if executed using internal worker");
        done1();
    }
    worker.onExecuted.addEventListener(new SmartJs.Event.EventListener(onExecutedHandler, this));
    worker.onError.addEventListener(globalErrorListener);
    worker.execute(4.98765);

    //test: simpe object
    var worker2 = new SmartJs.Components.InlineWorker(testInstance, testInstance.mult, { floor: testInstance.floor, ceil: testInstance.ceil });

    var onExecutedHandler2 = function (e) {
        assert.equal(e.result, 25, "scope + method + helpers: simple test");
        done2();
    }
    worker2.onExecuted.addEventListener(new SmartJs.Event.EventListener(onExecutedHandler2, this));
    worker2.onError.addEventListener(globalErrorListener);
    worker2.execute(5.98765, 4.001);

    //test: complex object
    var worker3 = new SmartJs.Components.InlineWorker(testInstance, testInstance.objectTest, { ns1: ns1 });

    var onExecutedHandler3 = function (e) {
        assert.equal(e.result, 8, "scope + method + helpers: complex test");
        done3();
    }
    worker3.onExecuted.addEventListener(new SmartJs.Event.EventListener(onExecutedHandler3, this));
    worker3.onError.addEventListener(globalErrorListener);
    worker3.execute();

    //long running test
    var worker4 = new SmartJs.Components.InlineWorker(testInstance, testInstance.longRunningTask, { floor: testInstance.floor, ceil: testInstance.ceil });
    var onExecutedHandler4 = function (e) {
        assert.equal(e.result, 25, "scope + method + helpers: long running test");
        assert.notOk(worker4.isBusy, "isBusy set to false after processing completed");
        done4();
    }
    worker4.onExecuted.addEventListener(new SmartJs.Event.EventListener(onExecutedHandler4, this));
    worker4.onError.addEventListener(globalErrorListener);
    worker4.execute(5.98765, 4.001);

    assert.ok(worker4.isBusy, "isBusy set to true if currently processing");
    assert.throws(function () { worker4.execute(5.98765, 4.001); }, Error, "ERROR: try to call worker again while it is busy");

    //test: error - temporarely removed because we cannot catch the worker internal exception
    //var worker5 = new SmartJs.Components.InlineWorker(testInstance, testInstance.throwError);

    //var onErrorHandler5 = function (e) {
    //    assert.ok(true, "ERROR: error event thrown");
    //    done5();
    //}
    //worker5.onError.addEventListener(new SmartJs.Event.EventListener(onErrorHandler5, this));
    //try {
    //    worker5.execute();
    //} catch (e) { } //silet catch: error was based inside the script to test the error event (on intention)

    //image data tests
    var dom = document.getElementById("qunit-fixture");
    var canvas = document.createElement("canvas");
    dom.appendChild(canvas);

    var ctx = canvas.getContext("2d");
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var filters = {
        RED: 1,
    };
    var filter = {
        apply: function (imageData, filter) {
            switch (filter) {
                case filters.RED:
                    var data = imageData.data;
                    for (var i = 0, l = data.length; i < l; i += 4)
                        data[i] = 255;
                    return imageData;
                    break;
                default:
                    throw new Error("filter not found");
            }
        },
    };
    var worker6 = new SmartJs.Components.InlineWorker(filter, filter.apply, { filters: filters });
    var onExecutedHandler6 = function (e) {
        assert.equal(e.result.data[12], 255, "pixels changed to red");
        dom.removeChild(canvas);
        done6();
    }
    worker6.onExecuted.addEventListener(new SmartJs.Event.EventListener(onExecutedHandler6, this));
    worker6.onError.addEventListener(globalErrorListener);

    assert.throws(function () { worker6.executeOnImageData([], filters.RED); }, Error, "ERROR: imageData violation");
    assert.throws(function () { worker6.executeOnImageData(true, imageData, filters.RED); }, Error, "ERROR: imageData 1st argument violation");

    worker6.executeOnImageData(imageData, filters.RED);

});


QUnit.test("SmartJs.Components.InlineWorker: synchronous (using fallback)", function (assert) {

    //test class used in the test cases below
    var ns1 = { ns2: "2", ns3: { array: [1, "2", null, 4], fnc: function (a, b) { return a * b; } } };
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
            objectTest: function () {
                return ns1.ns3.fnc(parseInt(ns1.ns2), ns1.ns3.array[3]);
            },
            longRunningTask: function (value1, value2) {   //delayed on purpose
                for (var i = 0, l = 20000000; i < l; i++)
                    this.floor(value1) * this.ceil(value2)
                return this.floor(value1) * this.ceil(value2);
            },
            throwError: function () {
                throw new Error("custom error");
            },
        };

        return TestClass;
    })();

    var testInstance = new TestClass(3);
    assert.equal(testInstance.exec(2), 6, "TestClass check");


    //simple test
    var worker = new SmartJs.Components.InlineWorker(testInstance, testInstance.floor);
    worker._worker = undefined; //override internal worker to force fallback execution

    assert.ok(worker instanceof SmartJs.Components.InlineWorker && worker instanceof SmartJs.Core.EventTarget, "instance check");
    assert.ok(worker.onExecuted instanceof SmartJs.Event.Event && worker.onError instanceof SmartJs.Event.Event, "event check");
    assert.notOk(worker.isBusy, "isBusy initially set to false");

    var onExecutedHandler = function (e) {
        assert.equal(e.result, 4, "scope + method: simple test");
        assert.notOk(e.async, "async not set if executed using fallback implementation");
    }
    worker.onExecuted.addEventListener(new SmartJs.Event.EventListener(onExecutedHandler, this));
    worker.execute(4.98765);

    //simple test
    var worker2 = new SmartJs.Components.InlineWorker(testInstance, testInstance.mult, { floor: testInstance.floor, ceil: testInstance.ceil });
    worker2._worker = undefined; //override internal worker to force fallback execution

    var onExecutedHandler2 = function (e) {
        assert.equal(e.result, 25, "scope + method + helpers: simple test");
    }
    worker2.onExecuted.addEventListener(new SmartJs.Event.EventListener(onExecutedHandler2, this));
    worker2.execute(5.98765, 4.001);

    //test: complex object
    var worker3 = new SmartJs.Components.InlineWorker(testInstance, testInstance.objectTest, { ns1: ns1 });
    worker3._worker = undefined; //override internal worker to force fallback execution

    var onExecutedHandler3 = function (e) {
        assert.equal(e.result, 8, "scope + method + helpers: complex test");
    }
    worker3.onExecuted.addEventListener(new SmartJs.Event.EventListener(onExecutedHandler3, this));
    worker3.execute();

    //long running test
    var worker4 = new SmartJs.Components.InlineWorker(testInstance, testInstance.longRunningTask, { floor: testInstance.floor, ceil: testInstance.ceil });
    worker4._worker = undefined; //override internal worker to force fallback execution

    var onExecutedHandler4 = function (e) {
        assert.equal(e.result, 25, "scope + method + helpers: simple test");
        assert.notOk(worker4.isBusy, "isBusy set to false after processing completed");
    }
    worker4.onExecuted.addEventListener(new SmartJs.Event.EventListener(onExecutedHandler4, this));
    worker4.execute(5.98765, 4.001);

    assert.notOk(worker4.isBusy, "isBusy set to false if synchronous processing");

});

