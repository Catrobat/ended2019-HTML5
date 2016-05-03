'use strict';

QUnit.module("Test 3 own ids - FULL");

QUnit.test("projectTesterClass", function (assert) {

  /* ********************************************* */
  /* Example to test 3 own projects given by array */
  /* ********************************************* */

  // Create Test Instance
  var test = new PocketCode.ProjectTesterClass();
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
  var settings = {
    method: test._methods.FULL,
    limit: test._limits.NONE
  };

  // Add Listener
  test.onGetProject.addEventListener(new SmartJs.Event.EventListener(singleProjectHandler, this));
  test.onGetError.addEventListener(new SmartJs.Event.EventListener(errorHandler, this));

  // start test
  test._startTests(settings, pid);
});
