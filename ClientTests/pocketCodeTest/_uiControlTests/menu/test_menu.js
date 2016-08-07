/**
 * Created by Michael Pittner on 17.06.2016.
 */


window.onload = function () {
  var layoutContainer = document.getElementById('layoutContainer');

  var menu = new PocketCode.Ui.Menu();

  layoutContainer.appendChild(menu._dom);

  var separator = new PocketCode.Ui.MenuSeparator();
  var separator2 = new PocketCode.Ui.MenuSeparator();
  var button1 = new PocketCode.Ui.MenuItem("example");
  var button2 = new PocketCode.Ui.MenuItem("example");
  var button3 = new PocketCode.Ui.MenuItem("example");
  var button32 = new PocketCode.Ui.MenuItem("example32");

  //var submenu = new PocketCode.Ui.SubMenu();



  var separator3 = new PocketCode.Ui.MenuSeparator();
  var separator4 = new PocketCode.Ui.MenuSeparator();
  var button4 = new PocketCode.Ui.MenuItem("Play");
  var button5 = new PocketCode.Ui.MenuItem("lblOk");
  var button6 = new PocketCode.Ui.MenuItem( "lblDownload" );


  var separator5 = new PocketCode.Ui.MenuSeparator();
  var separator6 = new PocketCode.Ui.MenuSeparator();
  var button7 = new PocketCode.Ui.MenuItem("example");
  var button8 = new PocketCode.Ui.MenuItem("example");
  var button9 = new PocketCode.Ui.MenuItem("example");

  var cb1 = new PocketCode.Ui.Checkbox("lblOk");
  var radio1 = new PocketCode.Ui.Radio('key1', 'val1');
  var radio2 = new PocketCode.Ui.Radio('key2', 'val2');
  var dc = new PocketCode.Ui.RadioGroup();
  dc.add( radio1 );
  dc.add( radio2 );


  menu.appendChild( button1 );

  menu.appendChild( separator );
  menu.appendChild( button2 );
  menu.appendChild( separator2 );
  menu.appendChild( button3 );
  menu.appendChild( button32 );


  //menu.appendChild( submenu );

  menu.appendChild( button4 );
  menu.appendChild( separator3 );
  menu.appendChild( cb1 );
  menu.appendChild( separator5 );
  menu.appendChild( radio1 );
  menu.appendChild( separator6 );
  menu.appendChild( radio2 );

  menu.appendChild( button5 );
  menu.appendChild( separator4 );
  menu.appendChild( button6 );

  menu.appendChild( button7 );
  menu.removeChild( radio2 );





  window.onresize = function (e) {
    menu._onResize.dispatchEvent();
  };
  menu._onResize.dispatchEvent();  //once at the beginning



  //click handler
  var onClickEventFired = function () {
    outputContainer.innerHTML += '<br />Menu open/close clicked';
  };
  menu.onClick.addEventListener(new SmartJs.Event.EventListener(onClickEventFired, this));

  //click handler
  var onClick2EventFired = function () {
    outputContainer.innerHTML += '<br />Button 2 clicked';
  };
  button2.onClick.addEventListener(new SmartJs.Event.EventListener(onClick2EventFired, this));


  //click handler
  var onClick3EventFired = function () {
    outputContainer.innerHTML += '<br />Button 3 clicked';
  };
  button3.onClick.addEventListener(new SmartJs.Event.EventListener(onClick3EventFired, this));


  //click handler
  var onClick32EventFired = function () {
    outputContainer.innerHTML += '<br />Button 32 clicked';
  };
  button32.onClick.addEventListener(new SmartJs.Event.EventListener(onClick32EventFired, this));

};