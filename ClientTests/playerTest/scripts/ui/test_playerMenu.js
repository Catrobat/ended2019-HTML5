/// <reference path="../../qunit/qunit-2.1.1.js" />
/// <reference path="../../../../Client/pocketCode/scripts/ui/menu.js" />
/// <reference path="../../../../Client/player/scripts/ui/playerMenu.js" />
'use strict';

QUnit.module("scripts/ui/playerMenu.js");


QUnit.test("Menu", function (assert) {


  var done = assert.async;

  var ctrl = new PocketCode.Player.Ui.Menu();

  // test initial state
  assert.ok(ctrl._subMenu.hidden, "Menu is closed");
  assert.equal(ctrl._menuButton.className, "pc-menuButton", "Class Name of MenuButton Ok");

  // open menu
  ctrl._openCloseHandler();
  assert.ok(!ctrl._subMenu.hidden, "Menu is open");
  assert.equal(ctrl._menuButton.className, "pc-menuButton pc-menuButtonOpened", "Class Name of MenuButton Ok");


  // open menu
  ctrl._openCloseHandler();
  assert.ok(ctrl._subMenu.hidden, "Menu is closed because of opening 2 times");

  ctrl._openCloseHandler();
  ctrl.close();
  assert.ok(ctrl._subMenu.hidden, "Menu is closed again");


  ctrl._openCloseHandler();
  var item = new PocketCode.Ui.MenuItem("menuImpressum");
  item.onClick.addEventListener(new SmartJs.Event.EventListener(function () {
      assert.ok(true, "Clicked");
      ctrl.close();
      ctrl._onMenuAction.dispatchEvent({command: PocketCode.Player.MenuCommand.TERMS_OF_USE});
      assert.ok(ctrl._subMenu.hidden, "Menu is closed again");

      done();
    }
    ,
    ctrl));
  ctrl.appendChild(item);

  item._dom.click();  //simulate click


/*

  var radios;
  var i, l;
  var e = {};
  e.language = "en";
  ctrl._onLanguageChange(e);

  console.log("test");
  radios = ctrl._languageRadioGroup.radios;


  console.log(radios.length);
  for (i = 0, l = radios.length; i < l; i++)
    if (radios[i].value == e.language) {
        assert.ok(radios[i].checked, "English Radio is checked");
        done1();
      break;
    }

  e.language = "de";
  ctrl._onLanguageChange(e);

  console.log(radios.length);
  radios = ctrl._languageRadioGroup.radios;
  for (i = 0, l = radios.length; i < l; i++)
    if (radios[i].value == e.language) {
        assert.ok(radios[i].checked, "German Radio is checked");

      done2();
      break;
    }


  //console.log( ctrl );

  //ctrl._subMenu._childs[0]._childs[0]._childs[1].click()
  //console.log( ctrl._subMenu._childs[0]._childs[0]._childs[1].click() );
*/
  assert.ok(false, "Not finished!");
});

