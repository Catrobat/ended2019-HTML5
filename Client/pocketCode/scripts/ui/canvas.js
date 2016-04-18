/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../core.js" />
/// <reference path="../ui.js" />
/// <reference path="../../libs/fabric/fabric-1.6.0-rc.1.js" />
'use strict';

PocketCode.Ui.Canvas = (function () {
    Canvas.extends(SmartJs.Ui.Control, false);

    //cntr
    function Canvas(args) {

        var config = {
            //width: cwidth,
            //height: cheight,
            //containerClass: 'canvas-container',
            selection: false,
            skipTargetFind: false,
            perPixelTargetFind: true,
            renderOnAddRemove: false,
            //stateful: false,  //TODO: ??? check this again
            //?centerTransform (= centeredRotation, centeredScaling in current version)
        };

        //create internal fabricJs canvas adapter
        this._fcAdapter = new ((function () {
            FCAdapter.extends(fabric.Canvas, false);

            function FCAdapter(canvasElement) {
                fabric.Canvas.call(this, canvasElement, config);
                this._renderingObjects = [];
                this._renderingTexts = [];
                this.scaling = 1.0;   //initial
                //TODO: throw exception if internal canvas list changes and set as a public property: including methods?
            }

            //properties
            Object.defineProperties(FCAdapter.prototype, {
                renderingObjects: {
                    set: function (list) {
                        this._renderingObjects = list;  //TODO: exception handling, argument check
                    },
                },
                renderingTexts: {
                    set: function (list) {
                        this._renderingTexts = list;  //TODO: exception handling, argument check
                    },
                },
            });

            //methods
            FCAdapter.prototype.merge({
                findItemById: function (id) {
                    var items = this._renderingObjects;
                    if (items === undefined)
                        return;

                    for (var i = 0, l = items.length; i < l; i++) {
                        if (items[i].object.id == id)
                            return items[i];
                    }
                },
                setDimensionsWr: function (width, height, scaling) {   //without rerendering
                    width = Math.floor(width / 2.0) * 2.0;
                    height = Math.floor(height / 2.0) * 2.0;

                    this._setBackstoreDimension('width', width);
                    this._setCssDimension('width', width + 'px');
                    this._setBackstoreDimension('height', height);
                    this._setCssDimension('height', height + 'px');
                    this.scaling = scaling;
                    this.calcOffset();
                    this._createCacheCanvas();  //make sure our cahce canvas has the full size to search for click events
                },
                _createCacheCanvas: function () {
                    this.cacheCanvasEl = this._createCanvasElement();
                    this.cacheCanvasEl.setAttribute('width', this.width / this.scaling);
                    this.cacheCanvasEl.setAttribute('height', this.height / this.scaling);
                    this.contextCache = this.cacheCanvasEl.getContext('2d');
                },
                clear: function () {
                    this.clearContext(this.contextTop);
                    this.clearContext(this.contextContainer);
                },
                __onMouseDown: function (e) {

                    var isLeftClick = 'which' in e ? e.which === 1 : e.button === 1;
                    if (!isLeftClick && !SmartJs.Device.isTouch) {
                        return;
                    }

                    var target = this.findTarget(e),
                        pointer = this.getPointer(e, true);

                    // save pointer for check in __onMouseUp event
                    this._previousPointer = pointer;

                    var shouldRender = this._shouldRender(target, pointer),
                        shouldGroup = this._shouldGroup(e, target);

                    if (this._shouldClearSelection(e, target)) {
                        this._clearSelection(e, target, pointer);
                    }
                    else if (shouldGroup) {
                        this._handleGrouping(e, target);
                        target = this.getActiveGroup();
                    }

                    if (target && target.selectable && !shouldGroup) {
                        this._beforeTransform(e, target);
                        this._setupCurrentTransform(e, target);
                    }
                    // we must renderAll so that active image is placed on the top canvas
                    shouldRender && this.renderAll();

                    this.fire('mouse:down', { target: target, e: e });
                    target && target.fire('mousedown', { e: e });
                },
                _getTouchPointer: function (event, pageProp, clientProp) {
                    var touchProp = event.type === 'touchend' ? 'changedTouches' : 'touches';

                    return (event[touchProp] && event[touchProp][0] ?
                        (event[touchProp][0][pageProp] - (event[touchProp][0][pageProp] - event[touchProp][0][clientProp])) || event[clientProp] :
                        event[clientProp]);
                },
                _getEventPointer: function (event) {
                    event || (event = fabric.window.event);

                    var element = event.target || (typeof event.srcElement !== unknown ? event.srcElement : null),
                        scroll = fabric.util.getScrollLeftTop(element),
                        x = 0,
                        y = 0;

                    if (SmartJs.Device.isTouch) {
                        x = this._getTouchPointer(event, 'pageX', 'clientX');
                        y = this._getTouchPointer(event, 'pageY', 'clientY');
                    }
                    else {
                        x = event.clientX ? event.clientX : 0;
                        y = event.clientY ? event.clientY : 0;
                    }
                    return {
                        x: x + scroll.left,
                        y: y + scroll.top
                    };
                },
                getPointer: function (e, ignoreZoom, upperCanvasEl) {
                    if (!upperCanvasEl) {
                        upperCanvasEl = this.upperCanvasEl;
                    }
                    var pointer = this._getEventPointer(e),
                        bounds = upperCanvasEl.getBoundingClientRect(),
                        boundsWidth = bounds.width || 0,
                        boundsHeight = bounds.height || 0,
                        cssScale;

                    if (!boundsWidth || !boundsHeight) {
                        if ('top' in bounds && 'bottom' in bounds) {
                            boundsHeight = Math.abs(bounds.top - bounds.bottom);
                        }
                        if ('right' in bounds && 'left' in bounds) {
                            boundsWidth = Math.abs(bounds.right - bounds.left);
                        }
                    }

                    //this.calcOffset();    //are calculated during resize

                    pointer.x = pointer.x - this._offset.left;
                    pointer.y = pointer.y - this._offset.top;
                    if (!ignoreZoom) {
                        pointer = fabric.util.transformPoint(
                          pointer,
                          fabric.util.invertTransform(this.viewportTransform)
                        );
                    }

                    if (boundsWidth === 0 || boundsHeight === 0) {
                        // If bounds are not available (i.e. not visible), do not apply scale.
                        cssScale = { width: 1, height: 1 };
                    }
                    else {
                        cssScale = {
                            width: upperCanvasEl.width / boundsWidth,
                            height: upperCanvasEl.height / boundsHeight
                        };
                    }

                    return {
                        x: pointer.x * cssScale.width,
                        y: pointer.y * cssScale.height,
                    };
                },
                _checkTarget: function (obj, pointer) {
                    obj.setCoords();
                    if (obj && obj.visible && obj.evented && obj.containsPoint(pointer)) {
                        if ((this.perPixelTargetFind || obj.perPixelTargetFind) && !obj.isEditing) {
                            var isTransparent = this.isTargetTransparent(obj, pointer.x, pointer.y);
                            if (!isTransparent) {
                                return true;
                            }
                        }
                        else {
                            return true;
                        }
                    }
                    return false;
                },
                _searchPossibleTargets: function (e, skipGroup) {
                    // Cache all targets where their bounding box contains point.
                    if (e.type != 'mousedown' && e.type != 'touchstart')
                        return;
                    //this.calcOffset();    //calculated onResize
                    var target,
                        pointer = this.getPointer(e, true),
                        objs = this._renderingObjects,
                        obj;
                    var i = objs.length;
                    pointer = { //include our canvas scaling for search only
                        x: pointer.x / this.scaling,
                        y: pointer.y / this.scaling,
                    }
                    while (i--) {
                        obj = objs[i].object;
                        if (this._checkTarget(obj, pointer)) {
                            this.relatedTarget = obj;
                            target = obj;
                            break;
                        }
                    }
                    return target;
                },
                renderAll: function (viewportScaling) {
                    var ctx = this.contextContainer;
                    this.clearContext(ctx);

                    this._renderBackground(ctx);

                    var ro = this._renderingObjects,
                        scaling = viewportScaling || this.scaling;
                    ctx.save();
                    ctx.scale(scaling, scaling);

                    for (var i = 0, l = ro.length; i < l; i++)
                        ro[i].draw(ctx);

                    ro = this._renderingTexts;
                    for (var i = 0, l = ro.length; i < l; i++)
                        ro[i].draw(ctx);

                    ctx.restore();
                    this.fire('after:render');
                },
                toDataURL: function (width, height) {//format, quality) {
                    var cw = this.getWidth(),
                        ch = this.getHeight();

                    this.setWidth(width).setHeight(height);//Math.floor(origWidth / this.scaling / 2.0) * 2.0).setHeight(Math.floor(origHeight / this.scaling / 2.0) * 2.0);
                    
                    this.renderAll(width * this.scaling / cw);//1.0);
                    //format = format || 'png';
                    //if (format === 'jpg') {
                    //    format = 'jpeg';
                    //}
                    //quality = quality || 1;

                    //var data = (fabric.StaticCanvas.supports('toDataURLWithQuality'))
                    //    ? this.lowerCanvasEl.toDataURL('image/' + format, quality)
                    //    : this.lowerCanvasEl.toDataURL('image/' + format);
                    var data = this.lowerCanvasEl.toDataURL('image/png');

                    //restore
                    this.setDimensionsWr(cw, ch, this.scaling);
                    this.renderAll();

                    return data;
                }
            });

            return FCAdapter;
        })())(document.createElement('canvas'), config);

        args = args || {};
        SmartJs.Ui.Control.call(this, this._fcAdapter.wrapperEl, args); //the fabricJs wrapper div becomes our _dom root element

        this._fcAdapter.on('mouse:down', (function (e) {
            if (e.target)
                this._onMouseDown.dispatchEvent({ id: e.target.id });
        }).bind(this));
        this._fcAdapter.on('after:render', (function (e) {
            this._onAfterRender.dispatchEvent();
        }).bind(this));

        //events
        this._onMouseDown = new SmartJs.Event.Event(this);
        this._onAfterRender = new SmartJs.Event.Event(this);
    }

    //properties
    Object.defineProperties(Canvas.prototype, {
        /* override */
        height: {
            //set: function (value) {
            //    this._fcAdapter.setHeight(value);
            //},
            get: function () {
                return this._fcAdapter.getHeight();
            },
        },
        /* override */
        width: {
            //set: function (value) {
            //    this._fcAdapter.setWidth(value);
            //},
            get: function () {
                return this._fcAdapter.getWidth();
            },
        },
        contextTop: {
            get: function () {
                return this._fcAdapter.contextTop;
            },
        },
        renderingImages: {
            set: function (list) {
                this._fcAdapter.renderingObjects = list;
            },
        },
        renderingTexts: {
            set: function (list) {
                this._fcAdapter.renderingTexts = list;
            },
        },
    });

    //events
    Object.defineProperties(Canvas.prototype, {
        onMouseDown: {
            get: function () {
                return this._onMouseDown;
            },
        },
        //onAfterRender: {
        //    get: function () {
        //        return this._onAfterRender;
        //    },
        //},
    });

    //methods
    Canvas.prototype.merge({
        setDimensions: function (width, height, scaling) {
            this._fcAdapter.setDimensionsWr(width, height, scaling);
        },
        clear: function () {
            this._fcAdapter.clear();
        },
        render: function () {
            this._fcAdapter.renderAll();
        },
        toDataURL: function (width, height) {//backgroundColor) {
            // TODO Check alpha channel value range
            //backgroundColor = backgroundColor || 'rgba(255, 255, 255, 1)';
            this._fcAdapter.setBackgroundColor('rgba(255, 255, 255, 1)');//backgroundColor);   //setting background temporarly without triggering a render
            var dataUrl = this._fcAdapter.toDataURL(width, height);
            this._fcAdapter.setBackgroundColor('');
            return dataUrl;
        },
    });

    return Canvas;
})();



