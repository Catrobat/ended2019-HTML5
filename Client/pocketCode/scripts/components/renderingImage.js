/// <reference path='../components/sprite.js' />

/*override*/
fabric.Image.prototype.applyFilters = function (callback, filters, imgElement, forResizing) {

    filters = filters || this.filters;
    imgElement = imgElement || this._originalElement;

    if (!imgElement) {
        return;
    }

    if (filters.length === 0) {
        this._element = imgElement;
        callback && callback();
        return imgElement;
    }

    //we need to draw the a new canvas to apply filters without modifying our original look
    var canvasEl = fabric.util.createCanvasElement();
    canvasEl.width = imgElement.width;
    canvasEl.height = imgElement.height;
    canvasEl.getContext('2d').drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);

    filters.forEach(function (filter) {
        filter && filter.applyTo(canvasEl, filter.scaleX || this.scaleX, filter.scaleY || this.scaleY);
        if (!forResizing && filter && filter.type === 'Resize') {
            this.width *= filter.scaleX;
            this.height *= filter.scaleY;
        }
    }.bind(this));

    this._element = canvasEl;
    !forResizing && (this._filteredEl = canvasEl);
    callback && callback();

    return canvasEl;
};

PocketCode.RenderingImage = (function () {

    function RenderingImage(imageProperties) {
        if (!imageProperties || !(typeof imageProperties === 'object'))
            throw new Error('The rendering object has to be initialized using a sprite parameter object');

        var canvas = imageProperties.look;
        this._fabricImage = new fabric.Image(canvas, {
            perPixelTargetFind: true, // only pixels inside item area trigger click
            selectable: false,
            hasControls: false,
            hasBorders: false,
            hasRotatingPoint: false,
            originX: 'center',
            originY: 'center',
            centeredScaling: true,
            width: canvas.width,
            height: canvas.height,
            // flipX = flipH: false, //already a property and false (default)
            // flipy = flipV: false, //already a property and false (default)
            //filters: [],  //default
            //opacity: 1.0  //default
        });
        this._brightnesFilter = new fabric.Image.filters.Brightness({
            brightness: 0,
        });

        this.merge(imageProperties);
    }

    //properties
    Object.defineProperties(RenderingImage.prototype, {
        object: {
            get: function () {
                return this._fabricImage;
            },
        },
        id: {
            set: function (value) {
                this._fabricImage.id = value;
            },
            get: function () {
                return this._fabricImage.id;
            },
        },
        look: {
            set: function (value) {
                this._fabricImage.setElement(value);
            },
        },
        x: {
            set: function (value) {
                this._fabricImage.left = value;
            },
            get: function () {
                return this._x;
            }
        },
        y: {
            set: function (value) {
                this._y = value;
                this._fabricImage.top = value;
            },

            get: function () {
                return this._y;
            }
        },
        scaling: {
            set: function (value) {
                this._scaling = value;
                this._fabricImage.scaleX = value;
                this._fabricImage.scaleY = value;
            },
        },
        rotation: {
            set: function (value) {
                this._fabricImage.angle = value;
            }
        },
        flipX: {
            set: function (value) {
                this._fabricImage.flipX = value;
            }
        },
        visible: {
            set: function (value) {
                this._fabricImage.visible = value;
            },
            get: function () {
                return this._fabricImage.visible;
            }
        },
        graphicEffects: {
            set: function (effects) {
                if (!(effects instanceof Array))
                    throw new Error('invalid argument: effects');

                for (var i = 0, l = effects.length; i < l; i++) {
                    switch (effects[i].effect) {
                        case PocketCode.GraphicEffect.GHOST:
                            //opacity: 1.0  //default
                            this._fabricImage.opacity = 1 - effects[i].value / 100.0;
                            break;
                        case PocketCode.GraphicEffect.BRIGHTNESS:
                            var val = effects[i].value;
                            if (val) {  //!= 0
                                this._brightnesFilter.brightness = Math.round(val * 2.55);
                                if (this._fabricImage.filters.indexOf(this._brightnesFilter) == -1) //not in list
                                    this._fabricImage.filters.push(this._brightnesFilter);
                                this._fabricImage.applyFilters();
                            }
                            else if (this._fabricImage.filters.indexOf(this._brightnesFilter) !== -1) { //remove
                                this._fabricImage.filters.remove(this._brightnesFilter);
                                this._fabricImage.applyFilters();
                            }
                            break;

                        //default:
                        //throw? unknown effect? -> we ignore it as we have not implemented all scratch effects
                    }
                }
            }
        },
    });

    //methods
    RenderingImage.prototype.merge({
        draw: function (context) {
            this._fabricImage.render(context);
        },
    });

    return RenderingImage;
})();