'use strict';


PocketCode.Ui.ScrollContainer = (function () {
    ScrollContainer.extends(SmartJs.Ui.ContainerControl, false);

    //cntr
    function ScrollContainer(propObject, innerPropObject) {
        SmartJs.Ui.ContainerControl.call(this, propObject);

        this._container = new SmartJs.Ui.ContainerControl(innerPropObject);
        this._appendChild(this._container);
        if (!propObject)
            this._dom.style.overflow = 'hidden';

        this._iScroll = new IScroll(this._dom, {
            mouseWheel: true,
            //scrollbars: true,
            //fadeScrollbars: true,         //on mobile
            interactiveScrollbars: true,    //on desktop ^^use this exclusive?
            scrollbars: 'custom',
            bounce: true,   //default
            shrinkScrollbars: 'clip',
            //invertWheelDirection: true,
            preventDefault: true,
        });
        this.onResize.addEventListener(new SmartJs.Event.EventListener(this._resizeHandler, this));
        this.onLayoutChange.addEventListener(new SmartJs.Event.EventListener(this._resizeHandler, this));
    }

    //methods
    ScrollContainer.prototype.merge({
        _resizeHandler: function (e) {
            this._iScroll.refresh();
        },
    });

    return ScrollContainer;
})();
