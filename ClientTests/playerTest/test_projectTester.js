'use strict';

QUnit.module("Project Tester");

QUnit.test("projectTesterClass", function (assert) {


  var test = new PocketCode.ProjectTesterClass();

  assert.ok( test._fetchAllProjects(), "Fetch all programs" );

});