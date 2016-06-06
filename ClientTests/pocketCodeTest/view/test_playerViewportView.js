/// <reference path="../../qunit/qunit-1.23.0.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
'use strict';

QUnit.module("view/playerViewportView.js");


QUnit.test("PlayerViewportView", function (assert) {

    var view = new PocketCode.Ui.PlayerViewportView();
    assert.ok(view instanceof  PocketCode.Ui.PlayerViewportView, 'instance check');
    assert.ok(view.axisVisible == false, 'axes hidden initially');
    assert.ok(view.onSpriteClicked instanceof SmartJs.Event.Event, 'click event instance check');
    assert.ok(false, "TODO");
});



