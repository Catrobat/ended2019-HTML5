/**
 * Created by Michael Pittner on 17.06.2016.
 */


window.onload = function () {
  var layoutContainer = document.getElementById('layoutContainer');

  var menue = new PocketCode.Ui.Menue();
  var separator = new PocketCode.Ui.Separator();
  var separator2 = new PocketCode.Ui.Separator();
  var button1 = new PocketCode.Ui.MenuItem("example");
  var button2 = new PocketCode.Ui.MenuItem("example");
  var button3 = new PocketCode.Ui.MenuItem("example");

  menue._addElement( button1 );
  menue._addElement( separator );
  menue._addElement( button2 );
  menue._addElement( separator2 );
  menue._addElement( button3 );



  layoutContainer.appendChild(menue._dom);





  //click handler
  var onClickEventFired = function () {
    outputContainer.innerHTML += '<br />clicked';
  };
  menue.onClick.addEventListener(new SmartJs.Event.EventListener(onClickEventFired, this));

};