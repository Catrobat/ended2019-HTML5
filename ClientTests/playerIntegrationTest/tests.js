/// <reference path="projectTester.js" />
'use strict';

QUnit.module("Test ALL projects sorted by views - FULL");

QUnit.test("ProjectTester", function (assert) {

    /* ******************************************* */
    /* Example to test all projects fetched by web */
    /* ******************************************* */

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

    // define own settings
    var ns = PocketCode.Test;
    var settings = {
        method: ns.Method.JSON,
        mask: ns.Mask.RECENT,
        limit: 1500,//ns.Limit.ALL
    };

    // Add Listener
    test.onGetProject.addEventListener(new SmartJs.Event.EventListener(singleProjectHandler, this));
    test.onGetError.addEventListener(new SmartJs.Event.EventListener(errorHandler, this));

    // start test
    test._startTests(settings);
});
