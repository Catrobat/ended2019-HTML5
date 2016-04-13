'use strict';

QUnit.module("projectTester.js");

QUnit.test("projectTesterClass", function (assert) {


  var view = new PocketCode.ProjectTesterClass();
  var res = view.wert;
  view._add();
  var res2 = view.wert;

  assert.equal( res, 0, "success" );
  assert.equal( res2, 1, "success" );
});