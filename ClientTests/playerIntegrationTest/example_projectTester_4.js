'use strict';

QUnit.module("Test 10 randomly and 2 own projects - FULL");

QUnit.test("ProjectTester", function (assert) {

    /* ************************************************************* */
    /* Example to test 10 projects fetched by web and 2 own projects */
    /* ************************************************************* */

    // Create Test Instance
    var test = new PocketCode.Test.ProjectTester();
    var last_assert = assert.async();


    var singleProjectHandler = function (e) {
        assert.ok(true, e.print);
        if (test._nextTest() == "last_call")
            last_assert();
    };

    var errorHandler = function (e) {
        assert.ok(false, e.print);
        if (test._nextTest() == "last_call")
            last_assert();
    };

    // list of projects
    var pid = [1, 2, 3];

    // define own settings
    var ns = PocketCode.Test;
    var settings = {
        method: ns.Method.FULL,
        mask: ns.Mask.RANDOM,
        limit: 10
    };

    // Add Listener
    test.onGetProject.addEventListener(new SmartJs.Event.EventListener(singleProjectHandler, this));
    test.onGetError.addEventListener(new SmartJs.Event.EventListener(errorHandler, this));

    // start test
    test._startTests(settings, pid);
});
