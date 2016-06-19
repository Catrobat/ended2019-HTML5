/**
 * Created by Michael Pittner on 17.06.2016.
 */


window.onload = function () {
  var layoutContainer = document.getElementById('layoutContainer');

  var menu = new PocketCode.Ui.Menu();
  var separator = new PocketCode.Ui.MenuSeparator();
  var separator2 = new PocketCode.Ui.MenuSeparator();
  var button1 = new PocketCode.Ui.MenuItem("example");
  var button2 = new PocketCode.Ui.MenuItem("example");
  var button3 = new PocketCode.Ui.MenuItem("example");


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


  menu.addElement( button1 );

  menu.addElement( separator );
  menu.addElement( button2 );
  menu.addElement( separator2 );
  menu.addElement( button3 );

  menu.addElement( button4 );
  menu.addElement( separator3 );
  menu.addElement( cb1 );
  menu.addElement( separator5 );
  menu.addElement( radio1 );
  menu.addElement( separator6 );
  menu.addElement( radio2 );

  menu.addElement( button5 );
  menu.addElement( separator4 );
  menu.addElement( button6 );

  menu.addElement( button7 );



  layoutContainer.appendChild(menu._dom);



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

};