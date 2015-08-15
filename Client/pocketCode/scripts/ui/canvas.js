/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../core.js" />
/// <reference path="../ui.js" />
/// <reference path="../../libs/fabric/fabric-1.5.0.js" />
'use strict';

PocketCode.Ui.Canvas = (function () {
    Canvas.extends(SmartJs.Ui.Control, false);

    //cntr
    function Canvas(args) {

        //fabric canvas config
        //var cheight = 920.0;    //TODO:
        //var cwidth = 640.0;
        var config = {
            //width: cwidth,
            //height: cheight,
            //containerClass: 'canvas-container',
            selection: false,
            skipTargetFind: false,
            perPixelTargetFind: true,
            renderOnAddRemove: false,
            stateful: false,
            preserveObjectStacking: true,
        };

        //create internal fabricJs canvas adapter
        this._fcAdapter = new ((function () {
            FCAdapter.extends(fabric.Canvas, false);

            function FCAdapter(canvasElement) {
                fabric.Canvas.call(this, canvasElement, config);
                this._renderingObjects = [];
                //TODO: throw exception if internal canvas list changes and set as a public property: including methods?
            }

            //properties
            Object.defineProperties(FCAdapter.prototype, {
                renderingObjects: {
                    set: function (list) {
                        this._renderingObjects = list;  //TODO: exception handling, argument check
                    },
                },
            });

            //methods
            FCAdapter.prototype.merge({
                //TODO: override rendering
                //_searchPossibleTargets: function (e) {

                //    // Cache all targets where their bounding box contains point.
                //    var target,
                //        pointer = this.getPointer(e, true),
                //        i = this._objects.length;

                //    while (i--) {
                //        if (this._checkTarget(e, this._objects[i], pointer)) {
                //            this.relatedTarget = this._objects[i];
                //            target = this._objects[i];
                //            break;
                //        }
                //    }

                //    return target;
                //},
                //renderAll: function (allOnTop) {
                //    var canvasToDrawOn = this[(allOnTop === true && this.interactive) ? 'contextTop' : 'contextContainer'],
                //        activeGroup = this.getActiveGroup();

                //    if (this.contextTop && this.selection && !this._groupSelector) {
                //        this.clearContext(this.contextTop);
                //    }

                //    if (!allOnTop) {
                //        this.clearContext(canvasToDrawOn);
                //    }

                //    this.fire('before:render');

                //    if (this.clipTo) {
                //        fabric.util.clipContext(this, canvasToDrawOn);
                //    }

                //    this._renderBackground(canvasToDrawOn);
                //    this._renderObjects(canvasToDrawOn, activeGroup);
                //    this._renderActiveGroup(canvasToDrawOn, activeGroup);

                //    if (this.clipTo) {
                //        canvasToDrawOn.restore();
                //    }

                //    this._renderOverlay(canvasToDrawOn);

                //    if (this.controlsAboveOverlay && this.interactive) {
                //        this.drawControls(canvasToDrawOn);
                //    }

                //    this.fire('after:render');

                //    return this;
                //},
                //_renderObjects: function (ctx, activeGroup) {
                //    var i, length;

                //    // fast path
                //    if (!activeGroup || this.preserveObjectStacking) {
                //        for (i = 0, length = this._objects.length; i < length; ++i) {
                //            this._draw(ctx, this._objects[i]);
                //        }
                //    }
                //    else {
                //        for (i = 0, length = this._objects.length; i < length; ++i) {
                //            if (this._objects[i] && !activeGroup.contains(this._objects[i])) {
                //                this._draw(ctx, this._objects[i]);
                //            }
                //        }
                //    }
                //},
            });

            return FCAdapter;
        })())(document.createElement('canvas'), config);

        args = args || {};
        SmartJs.Ui.Control.call(this, this._fcAdapter.wrapperEl, args);//{ className: 'pc-canvas' }.merge(args));
        this.className = 'pc-canvas';

        this._fcAdapter.on('mouse:down', (function (e) {
            if (e.target)// != 'undefined') {
                //console.log('cl2');
                this._onMouseDown.dispatchEvent({ id: e.target.id });
            //}
        }).bind(this));
        this._fcAdapter.on('after:render', (function (e) {
            this._onAfterRender.dispatchEvent();
        }).bind(this));

        //events
        this._onMouseDown = new SmartJs.Event.Event(this);
        this._onAfterRender = new SmartJs.Event.Event(this);
        //this._onClick = new SmartJs.Event.Event(this);
        //this._addDomListener(this._dom, 'click', this._clickHandler);
    }

    //properties
    Object.defineProperties(Canvas.prototype, {
        /* override */
        height: {
            set: function (value) {
                this._fcAdapter.setHeight(value);
            },
            get: function () {
                return this._fcAdapter.getHeight();
            },
        },
        /* override */
        width: {
            set: function (value) {
                this._fcAdapter.setWidth(value);
            },
            get: function () {
                return this._fcAdapter.getWidth();
            },
        },
        context: {
            get: function() {
                return this._fcAdapter.getContext('2d');
            },
        },
        //renderingObjects: {
        //    set: function (list) {
        //        this._fcAdapter.renderingObjects = list;
        //    },
        //},
        //text: {
        //    get: function () {
        //        return this._textNode.text;
        //    },
        //    set: function (value) {
        //        this._textNode.text = value;
        //    },
        //},
        //disabled: {
        //    get: function () {
        //        return this._dom.disabled;
        //    },
        //    set: function (value) {
        //        this._dom.disabled = value;
        //    },
        //},
    });

    //events
    Object.defineProperties(Canvas.prototype, {
        onMouseDown: {
            get: function () {
                return this._onMouseDown;
            },
        },
        onAfterRender: {
            get: function () {
                return this._onAfterRender;
            },
        },
    });

    //methods
    Canvas.prototype.merge({
        _onClickHandler: function (e) {
        //    this._onClick.dispatchEvent();
        //    //e.target.blur();//preventDefault(); //stop event so the button dowsn't get focus
        },
        _onResizeHandler: function(e) {

        },
        clear: function () {

        },
        render: function (renderingObjectList) {

        },
    });

    return Canvas;
})();



