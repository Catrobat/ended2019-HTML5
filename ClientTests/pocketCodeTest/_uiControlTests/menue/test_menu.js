/**
 * Created by Michael Pittner on 17.06.2016.
 */


window.onload = function () {
  var layoutContainer = document.getElementById('layoutContainer');

  var menue = new PocketCode.Ui.Menu();
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

  menue.addElement( button1 );
  menue.addElement( separator );
  menue.addElement( button2 );
  menue.addElement( separator2 );
  menue.addElement( button3 );

  menue.addElement( button4 );
  menue.addElement( separator3 );
  menue.addElement( button5 );
  menue.addElement( separator4 );
  menue.addElement( button6 );

  menue.addElement( button7 );
  menue.addElement( separator5 );
  menue.addElement( button8 );
  menue.addElement( separator6 );
  menue.addElement( button9 );



  layoutContainer.appendChild(menue._dom);





  //click handler
  var onClickEventFired = function () {
    outputContainer.innerHTML += '<br />Menu open/close clicked';
  };
  menue.onClick.addEventListener(new SmartJs.Event.EventListener(onClickEventFired, this));

  //click handler
  var onClick2EventFired = function () {
    outputContainer.innerHTML += '<br />Button 2 clicked';
  };
  button2.onClick.addEventListener(new SmartJs.Event.EventListener(onClick2EventFired, this));

};