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
                this.scaling = 1;   //initial
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
                    this._setBackstoreDimension('width', width);
                    this._setCssDimension('width', width + 'px');
                    this._setBackstoreDimension('height', height);
                    this._setCssDimension('height', height + 'px');
                    this.scaling = scaling;
                    this.calcOffset();
                    //PocketCode.ImageHelper.setImageSmoothing(this.contextContainer, false);
                },
                //TODO: override rendering
                clear: function () {
                    this.clearContext(this.contextContainer);
                },
                renderAll: function (fireEvent, ignoreScaling) {//viewportScaling) {//allOnTop) {
                    var ctx = this.contextContainer;//,//this[(allOnTop === true && this.interactive) ? 'contextTop' : 'contextContainer'],
                    this.clearContext(ctx);
                    //PocketCode.ImageHelper.setImageSmoothing(ctx, false);
                    //activeGroup = this.getActiveGroup();

                    //if (this.contextTop && this.selection && !this._groupSelector) {
                    //    this.clearContext(this.contextTop);
                    //}

                    //if (!allOnTop) {
                    //    this.clearContext(context);
                    //}

                    //this.fire('before:render');

                    //if (this.clipTo) {
                    //    fabric.util.clipContext(this, context);
                    //}

                    this._renderBackground(ctx);
                    var scaling = 1.;
                    if (!ignoreScaling)
                        scaling = this.scaling;
                    //this._renderObjects(context, activeGroup);
                    var ro = this._renderingObjects;
                    for (var i = 0, l = ro.length; i < l; i++) {
                        //var obj = this._renderingObjects[i].object;
                        //this._draw(ctx, ro[i].object);//obj);
                        ro[i].draw(ctx, scaling);
                    }
                    //ro = this._renderingTexts
                    //for (var i = 0, l = ro.length; i < l; i++) //{
                    //    //var obj = this._renderingObjects[i].object;
                    //    //this._draw(ctx, ro[i].object);//obj);
                    //    ro[i].draw(ctx, this.scaling);

                    //this._renderActiveGroup(context, activeGroup);

                    //if (this.clipTo) {
                    //    context.restore();
                    //}

                    //this._renderOverlay(context);

                    //if (this.controlsAboveOverlay && this.interactive) {
                    //    this.drawControls(context);
                    //}
                    if (fireEvent)
                        this.fire('after:render');

                    //return this;
                },
                //_renderObjects: function (ctx, activeGroup) {
                //    //var i, length;

                //    // fast path
                //    //if (!activeGroup || this.preserveObjectStacking) {
                //    var ro = this._renderingObjects;
                //    for (var i = 0, l = ro.length; i < l; ++i) //{    //++i???
                //        //var obj = this._renderingObjects[i].object;
                //        this._draw(ctx, ro[i].object);//obj);
                //    //}
                //    //}
                //    //else {
                //    //    for (i = 0, length = this._renderingObjects.length; i < length; ++i) {
                //    //        if (this._renderingObjects[i].object && !activeGroup.contains(this._renderingObjects[i].object)) {
                //    //            this._draw(ctx, this._renderingObjects[i].object);
                //    //            console.log('B render', i);
                //    //        }
                //    //    }
                //    //}
                //},
                _searchPossibleTargets: function(e, skipGroup){
                    // Cache all targets where their bounding box contains point.
                    if (e.type != 'mousedown')
                        return;
                    var target,
                        pointer = this.getPointer(e, true),
                        i = this._renderingObjects.length;

                    // Do not check for currently grouped objects, since we check the parent group itself.
                    // untill we call this function specifically to search inside the activeGroup
                    while (i--) {
                        if (this._checkTarget(e, this._renderingObjects[i].object, pointer)){
                            this.relatedTarget = this._renderingObjects[i].object;
                            target = this._renderingObjects[i].object;
                            break;
                        }
                    }
                    return target;
                },

                __toDataURL: function(format, quality, cropping) {

                    this.renderAll(false, true);

                    var canvasEl = this.lowerCanvasEl,
                        croppedCanvasEl = this.__getCroppedCanvas(canvasEl, cropping);

                    // to avoid common confusion https://github.com/kangax/fabric.js/issues/806
                    if (format === 'jpg') {
                        format = 'jpeg';
                    }

                    var data = (fabric.StaticCanvas.supports('toDataURLWithQuality'))
                        ? (croppedCanvasEl || canvasEl).toDataURL('image/' + format, quality)
                        : (croppedCanvasEl || canvasEl).toDataURL('image/' + format);

                    //this.contextTop && this.clearContext(this.contextTop);
                    this.renderAll();

                    if (croppedCanvasEl) {
                        croppedCanvasEl = null;
                    }

                    return data;
                },

                __toDataURLWithMultiplier: function(format, quality, cropping, multiplier) {

                    var origWidth = this.getWidth(),
                        origHeight = this.getHeight(),
                        scaledWidth = origWidth * multiplier,
                        scaledHeight = origHeight * multiplier,
                        activeObject = this.getActiveObject(),
                        activeGroup = this.getActiveGroup(),

                        ctx = this.contextTop || this.contextContainer;

                    if (multiplier > 1) {
                        this.setWidth(scaledWidth).setHeight(scaledHeight);
                    }
                    ctx.scale(multiplier, multiplier);

                    if (cropping.left) {
                        cropping.left *= multiplier;
                    }
                    if (cropping.top) {
                        cropping.top *= multiplier;
                    }
                    if (cropping.width) {
                        cropping.width *= multiplier;
                    }
                    else if (multiplier < 1) {
                        cropping.width = scaledWidth;
                    }
                    if (cropping.height) {
                        cropping.height *= multiplier;
                    }
                    else if (multiplier < 1) {
                        cropping.height = scaledHeight;
                    }

                    /*if (activeGroup) {
                        // not removing group due to complications with restoring it with correct state afterwords
                        this._tempRemoveBordersControlsFromGroup(activeGroup);
                    }
                    else if (activeObject && this.deactivateAll) {
                        this.deactivateAll();
                    }*/

                    this.renderAll(false, true);

                    var data = this.__toDataURL(format, quality, cropping);

                    // restoring width, height for `renderAll` to draw
                    // background properly (while context is scaled)
                    this.width = origWidth;
                    this.height = origHeight;

                    ctx.scale(1. / multiplier,  1. / multiplier);
                    this.setWidth(origWidth).setHeight(origHeight);

                    /*if (activeGroup) {
                        this._restoreBordersControlsOnGroup(activeGroup);
                    }
                    else if (activeObject && this.setActiveObject) {
                        this.setActiveObject(activeObject);
                    }*/

                    // this.contextTop && this.clearContext(this.contextTop);
                    this.renderAll();

                    return data;
                },
            });

            return FCAdapter;
        })())(document.createElement('canvas'), config);

        args = args || {};
        SmartJs.Ui.Control.call(this, this._fcAdapter.wrapperEl, args); //the fabricJs wrapper div becomes our _dom root element
        //this.className = 'pc-canvas';

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

        //this._onClick = new SmartJs.Event.Event(this);
        //this._addDomListener(this._dom, 'click', this._clickHandler);
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
        context: {
            get: function () {
                return this._fcAdapter.getContext();//'2d');
            },
        },
        canvasOverlay: {
            get: function () {
                return this._fcAdapter.upperCanvasEl;
            },
        },
        renderingImages: {
            set: function (list) {
                this._fcAdapter.renderingObjects = list;
            },
        },
        //renderingTexts: {
        //    set: function (list) {
        //        this._fcAdapter.renderingTexts = list;
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
        //_onClickHandler: function (e) {
        ////    this._onClick.dispatchEvent();
        ////    //e.target.blur();//preventDefault(); //stop event so the button doesn't get focus
        //},
        //_onResizeHandler: function(e) {

        //},
        setDimensions: function (width, height, scaling) {
            this._fcAdapter.setDimensionsWr(width, height, scaling);
        },
        clear: function () {
            this._fcAdapter.clear();
        },
        render: function () {
            this._fcAdapter.renderAll(true);
        },
        toDataURL: function (backgroundColor) {
            //scaling = scaling || 1;
            // TODO Check alpha channel value range
            backgroundColor = backgroundColor || 'rgba(255, 255, 255, 1)';
            this._fcAdapter.setBackgroundColor(backgroundColor);   //setting background temporarly without triggering a render
            var dataUrl = this._fcAdapter.toDataURL({ multiplier: 1. / this._fcAdapter.scaling });
            this._fcAdapter.setBackgroundColor('');
            return dataUrl;
        },
        //findItemById: function (id) {
        //    return this._fcAdapter.findItemById(id);
        //},
        //handleChangedScaling: function(e){
        //    var scaling = e.scaling;
        //    var canv = this._fcAdapter;
        //    for (var i = 0, l = canv._renderingObjects.length; i<l; i++) {
        //        var obj = canv._renderingObjects[i];
        //        this.applyScalingToObject(obj, scaling);
        //    }

        //    this.render();
        //},
        //applyScalingToObject: function(obj, scaling) {
        //    var canvas = this._fcAdapter;
        //    if (obj.object.id != undefined) {
        //        obj.object.left = obj._positionX * scaling + canvas.width / 2.0;
        //        obj.object.top = canvas.height - (obj._positionY * scaling + canvas.height / 2.0);
        //        obj.object.scaleX = obj._size * scaling / obj._initialScaling;
        //        obj.object.scaleY = obj._size * scaling / obj._initialScaling;
        //        obj.object.setCoords();
        //    }
        //},
    });

    return Canvas;
})();



