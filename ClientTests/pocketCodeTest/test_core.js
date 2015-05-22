'use strict';

QUnit.module("core.js");


QUnit.test("core framework", function (assert) {

    var compatible = PocketCode.isPlayerCompatible();
    assert.ok(compatible.result, "browser compatibility check");

});

